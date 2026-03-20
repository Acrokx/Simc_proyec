from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Sensor
from .serializers import SensorSerializer


class SensorViewSet(viewsets.ModelViewSet):
    """ViewSet para operaciones CRUD de Sensor"""
    queryset = Sensor.objects.all().order_by('-id_sensor')
    serializer_class = SensorSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        tipo_sensor = self.request.query_params.get('tipo_sensor') or self.request.query_params.get('tipo')
        estado = self.request.query_params.get('estado')
        id_cultivo = self.request.query_params.get('id_cultivo') or self.request.query_params.get('cultivo')

        if tipo_sensor:
            queryset = queryset.filter(tipo_sensor=tipo_sensor)
        if estado:
            queryset = queryset.filter(estado=estado)
        if id_cultivo:
            queryset = queryset.filter(id_cultivo=id_cultivo)

        return queryset
