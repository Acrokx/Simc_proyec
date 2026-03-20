from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Medicion
from .serializers import MedicionSerializer
from sensores.models import Sensor


@api_view(['POST'])
def crear_medicion(request):
    """Crear una nueva medición"""
    sensor_id = request.data.get('id_sensor') or request.data.get('sensor_id')
    valor_humedad = request.data.get('valor_humedad')

    if not sensor_id or valor_humedad is None:
        return Response({'error': 'Se requieren id_sensor y valor_humedad'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        sensor = Sensor.objects.get(pk=sensor_id)
        medicion = Medicion.objects.create(id_sensor=sensor, valor_humedad=valor_humedad)
        serializer = MedicionSerializer(medicion)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Sensor.DoesNotExist:
        return Response({'error': 'Sensor no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MedicionViewSet(viewsets.ModelViewSet):
    queryset = Medicion.objects.all().order_by('-fecha_medicion')
    serializer_class = MedicionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        sensor_id = self.request.query_params.get('id_sensor') or self.request.query_params.get('sensor')
        if sensor_id:
            queryset = queryset.filter(id_sensor=sensor_id)
        if not self.request.query_params:
            queryset = queryset[:50]
        return queryset


@api_view(['GET'])
def ultima_medicion(request):
    sensor_id = request.query_params.get('id_sensor')
    if not sensor_id:
        return Response({'error': 'Se requiere id_sensor'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        medicion = Medicion.objects.filter(id_sensor=sensor_id).order_by('-fecha_medicion').first()
        if medicion:
            serializer = MedicionSerializer(medicion)
            return Response(serializer.data)
        return Response({'message': 'No hay mediciones'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
