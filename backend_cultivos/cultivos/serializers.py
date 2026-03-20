from rest_framework import serializers
from .models import Finca, Cultivo, HistorialRiego


class FincaSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='id_finca', read_only=True)
    nombre_usuario = serializers.CharField(source='id_usuario.nombre', read_only=True)

    class Meta:
        model = Finca
        fields = ['id', 'id_finca', 'nombre_finca', 'ubicacion', 'tamaño_hectareas', 'descripcion', 'id_usuario', 'nombre_usuario']
        read_only_fields = ['id_usuario']


class CultivoSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='id_cultivo', read_only=True)

    class Meta:
        model = Cultivo
        fields = ['id', 'id_cultivo', 'tipo_cultivo', 'fecha_siembra', 'estado', 'id_finca']


class HistorialRiegoSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='id_riego', read_only=True)

    class Meta:
        model = HistorialRiego
        fields = ['id', 'id_riego', 'fecha_riego', 'cantidad_agua', 'id_cultivo']
