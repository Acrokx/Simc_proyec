from rest_framework import serializers
from .models import Sensor


class SensorSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='id_sensor', read_only=True)

    class Meta:
        model = Sensor
        fields = ['id', 'id_sensor', 'tipo_sensor', 'ubicacion', 'estado', 'id_cultivo']
