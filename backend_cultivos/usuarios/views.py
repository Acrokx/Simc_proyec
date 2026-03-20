from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password, check_password

from .models import Usuario
from .serializers import UsuarioSerializer


class UsuarioViewSet(viewsets.ModelViewSet):
    """ViewSet para operaciones CRUD de Usuario"""
    queryset = Usuario.objects.all().order_by('-fecha_registro')
    serializer_class = UsuarioSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        rol = self.request.query_params.get('rol')
        if rol:
            queryset = queryset.filter(rol__iexact=rol)
        return queryset

    def is_administrador(self):
        nombre = self.request.headers.get('X-Usuario')
        password = self.request.headers.get('X-Password')
        if not nombre or not password:
            return False
        try:
            usuario = Usuario.objects.get(nombre=nombre, rol__iexact='Administrador')
            return check_password(password, usuario.contraseña)
        except Usuario.DoesNotExist:
            return False

    def create(self, request, *args, **kwargs):
        if not self.is_administrador():
            return Response({'error': 'Acceso denegado: solo admins'}, status=status.HTTP_403_FORBIDDEN)

        if request.data.get('rol', 'Agricultor').capitalize() != 'Agricultor':
            return Response({'error': 'Sólo puede crear usuarios con rol Agricultor'}, status=status.HTTP_403_FORBIDDEN)

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not self.is_administrador():
            return Response({'error': 'Acceso denegado: solo admins'}, status=status.HTTP_403_FORBIDDEN)

        usuario_obj = self.get_object()
        if usuario_obj.rol.lower() != 'agricultor':
            return Response({'error': 'Sólo puede actualizar usuarios con rol Agricultor'}, status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not self.is_administrador():
            return Response({'error': 'Acceso denegado: solo admins'}, status=status.HTTP_403_FORBIDDEN)

        usuario_obj = self.get_object()
        if usuario_obj.rol.lower() != 'agricultor':
            return Response({'error': 'Sólo puede eliminar usuarios con rol Agricultor'}, status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_usuario(request):
    # Aceptar diferentes nombres de campo para compatibilidad
    correo = request.data.get('correo') or request.data.get('email') or request.data.get('username')
    contraseña = request.data.get('contraseña') or request.data.get('password') or request.data.get('pwd')

    if not correo or not contraseña:
        return Response({'error': 'Correo y contraseña son requeridos'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        usuario = Usuario.objects.get(correo__iexact=correo)
    except Usuario.DoesNotExist:
        return Response({'success': False, 'message': 'Credenciales incorrectas'}, status=status.HTTP_401_UNAUTHORIZED)

    if check_password(contraseña, usuario.contraseña):
        return Response({
            'success': True,
            'usuario': UsuarioSerializer(usuario).data
        })

    return Response({'success': False, 'message': 'Credenciales incorrectas'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def registro_usuario(request):
    nombre = request.data.get('nombre')
    apellido = request.data.get('apellido', '')
    correo = request.data.get('correo')
    contraseña = request.data.get('contraseña') or request.data.get('password')
    telefono = request.data.get('telefono', '')
    rol = request.data.get('rol', 'Agricultor')

    if not nombre or not correo or not contraseña:
        return Response({'error': 'nombre, correo y contraseña son requeridos'}, status=status.HTTP_400_BAD_REQUEST)

    if Usuario.objects.filter(correo=correo).exists():
        return Response({'error': 'El correo ya está registrado'}, status=status.HTTP_400_BAD_REQUEST)

    usuario = Usuario.objects.create(
        nombre=nombre,
        apellido=apellido,
        correo=correo,
        contraseña=make_password(contraseña),
        telefono=telefono,
        rol=rol
    )

    return Response({'success': True, 'usuario': UsuarioSerializer(usuario).data}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def agricultores_view(request):
    agricultores = Usuario.objects.filter(rol__iexact='Agricultor')
    data = UsuarioSerializer(agricultores, many=True).data
    return Response(data)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_usuario(request):
    return Response({'success': True, 'message': 'Logout successful'})


@api_view(['DELETE'])
@permission_classes([AllowAny])
def eliminar_agricultor(request, pk):
    """Eliminar un agricultor por ID"""
    try:
        usuario = Usuario.objects.get(pk=pk, rol__iexact='Agricultor')
        usuario.delete()
        return Response({'success': True, 'message': 'Agricultor eliminado'})
    except Usuario.DoesNotExist:
        return Response({'error': 'Agricultor no encontrado'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
def editar_agricultor(request, pk):
    """Editar un agricultor por ID (solo admin)"""
    try:
        usuario = Usuario.objects.get(pk=pk, rol__iexact='Agricultor')
    except Usuario.DoesNotExist:
        return Response({'error': 'Agricultor no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    nombre = request.data.get('nombre')
    apellido = request.data.get('apellido')
    telefono = request.data.get('telefono')
    
    if nombre:
        usuario.nombre = nombre
    if apellido is not None:
        usuario.apellido = apellido
    if telefono is not None:
        usuario.telefono = telefono
    
    usuario.save()
    return Response({'success': True, 'usuario': UsuarioSerializer(usuario).data})


@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
def editar_perfil(request):
    """Editar el perfil del usuario actual"""
    correo = request.data.get('correo')
    if not correo:
        return Response({'error': 'Correo requerido'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        usuario = Usuario.objects.get(correo=correo)
    except Usuario.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    nombre = request.data.get('nombre')
    apellido = request.data.get('apellido')
    telefono = request.data.get('telefono')
    nueva_contraseña = request.data.get('password')
    
    if nombre:
        usuario.nombre = nombre
    if apellido is not None:
        usuario.apellido = apellido
    if telefono is not None:
        usuario.telefono = telefono
    if nueva_contraseña:
        usuario.contraseña = make_password(nueva_contraseña)
    
    usuario.save()
    return Response({'success': True, 'usuario': UsuarioSerializer(usuario).data})

