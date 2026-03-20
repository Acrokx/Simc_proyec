from rest_framework import serializers
from .models import Medicion


class MedicionSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Medicion"""
    id = serializers.IntegerField(source='id_medicion', read_only=True)

    class Meta:
        model = Medicion
        fields = ['id', 'id_medicion', 'valor_humedad', 'fecha_medicion', 'id_sensor']
        read_only_fields = ['id', 'id_medicion', 'fecha_medicion']
