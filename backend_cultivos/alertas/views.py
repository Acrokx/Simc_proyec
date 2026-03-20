from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Alerta
from .serializers import AlertaSerializer


@api_view(['POST'])
def crear_alerta(request):
    tipo_alerta = request.data.get('tipo_alerta')
    descripcion = request.data.get('descripcion')
    prioridad = request.data.get('prioridad', 'media')
    leida = request.data.get('leida', False)
    id_medicion = request.data.get('id_medicion')

    if not tipo_alerta or not descripcion:
        return Response({'error': 'Se requieren tipo_alerta y descripcion'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        alerta_data = {
            'tipo_alerta': tipo_alerta,
            'descripcion': descripcion,
            'prioridad': prioridad,
            'leida': leida,
        }

        if id_medicion:
            alerta_data['id_medicion_id'] = id_medicion

        alerta = Alerta.objects.create(**alerta_data)
        serializer = AlertaSerializer(alerta)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AlertaViewSet(viewsets.ModelViewSet):
    queryset = Alerta.objects.all().order_by('-fecha_alerta')
    serializer_class = AlertaSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        id_medicion = self.request.query_params.get('id_medicion')
        if id_medicion:
            queryset = queryset.filter(id_medicion=id_medicion)
        return queryset


@api_view(['GET'])
def alertas_no_leidas(request):
    alertas = Alerta.objects.filter(leida=False).order_by('-fecha_alerta')
    serializer = AlertaSerializer(alertas, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
def marcar_leida(request, pk=None):
    try:
        alerta = Alerta.objects.get(pk=pk)
        alerta.leida = True
        alerta.save(update_fields=['leida'])
        return Response(AlertaSerializer(alerta).data)
    except Alerta.DoesNotExist:
        return Response({'error': 'Alerta no encontrada'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def crear_alerta_automatica(request):
    return crear_alerta(request)
