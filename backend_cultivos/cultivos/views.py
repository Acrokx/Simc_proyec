from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Finca, Cultivo, HistorialRiego
from .serializers import FincaSerializer, CultivoSerializer, HistorialRiegoSerializer
from sensores.models import Sensor
from mediciones.models import Medicion
from alertas.models import Alerta


@api_view(['GET'])
def dashboard_view(request):
    """Vista para el dashboard con estadísticas generales"""
    try:
        num_fincas = Finca.objects.count()
        num_cultivos = Cultivo.objects.count()
        num_sensores = Sensor.objects.count()
        num_alertas = Alerta.objects.count()
        ultima_medicion = Medicion.objects.order_by('-fecha_medicion').first()

        return Response({
            'success': True,
            'data': {
                'num_fincas': num_fincas,
                'num_cultivos': num_cultivos,
                'num_sensores': num_sensores,
                'num_alertas': num_alertas,
                'ultima_medicion': {
                    'valor': float(ultima_medicion.valor_humedad) if ultima_medicion else None,
                    'sensor': ultima_medicion.id_sensor.tipo_sensor if ultima_medicion and ultima_medicion.id_sensor else None,
                    'fecha': ultima_medicion.fecha_medicion.isoformat() if ultima_medicion else None
                } if ultima_medicion else None
            }
        })
    except Exception as e:
        return Response({'success': False, 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FincaViewSet(viewsets.ModelViewSet):
    queryset = Finca.objects.all().order_by('-id_finca')
    serializer_class = FincaSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        usuario_id = self.request.query_params.get('id_usuario')
        if usuario_id:
            # Convertir a int para asegurar comparación correcta
            try:
                queryset = queryset.filter(id_usuario=int(usuario_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def perform_create(self, serializer):
        """Guardar la finca asignando el usuario actual"""
        # Intentar obtener el usuario del token de autenticación
        usuario = None
        if hasattr(self.request, 'user') and self.request.user.is_authenticated:
            from usuarios.models import Usuario
            try:
                usuario = Usuario.objects.get(correo=self.request.user.email)
            except Usuario.DoesNotExist:
                pass
        
        # Si no se encontró usuario del token, intentar desde los datos
        if not usuario:
            usuario_id = self.request.data.get('id_usuario')
            if usuario_id:
                from usuarios.models import Usuario
                try:
                    usuario = Usuario.objects.get(pk=usuario_id)
                except Usuario.DoesNotExist:
                    pass
        
        if usuario:
            serializer.save(id_usuario=usuario)
        else:
            # Si no hay usuario, intentar guardar sin él (para pruebas)
            serializer.save()


class CultivoViewSet(viewsets.ModelViewSet):
    queryset = Cultivo.objects.all().order_by('-id_cultivo')
    serializer_class = CultivoSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        finca_id = self.request.query_params.get('id_finca') or self.request.query_params.get('finca')
        if finca_id:
            queryset = queryset.filter(id_finca=finca_id)
        return queryset


class HistorialRiegoViewSet(viewsets.ModelViewSet):
    queryset = HistorialRiego.objects.all().order_by('-fecha_riego')
    serializer_class = HistorialRiegoSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        cultivo_id = self.request.query_params.get('id_cultivo')
        if cultivo_id:
            queryset = queryset.filter(id_cultivo=cultivo_id)
        return queryset
