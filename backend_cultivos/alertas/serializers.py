from rest_framework import serializers
from .models import Alerta


class AlertaSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='id_alerta', read_only=True)

    class Meta:
        model = Alerta
        fields = ['id', 'id_alerta', 'tipo_alerta', 'descripcion', 'fecha_alerta', 'prioridad', 'leida', 'id_medicion']
        read_only_fields = ['id', 'id_alerta', 'fecha_alerta']
