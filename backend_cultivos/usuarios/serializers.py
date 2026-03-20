from rest_framework import serializers
from .models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='id_usuario', read_only=True)

    class Meta:
        model = Usuario
        fields = ['id', 'id_usuario', 'nombre', 'apellido', 'correo', 'telefono', 'contraseña', 'rol', 'fecha_registro']
        extra_kwargs = {
            'contraseña': {'write_only': True},
            'fecha_registro': {'read_only': True}
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Asegurar que id_usuario esté disponible
        if 'id' in data:
            data['id_usuario'] = data['id']
        return data

    def create(self, validated_data):
        usuario = Usuario(**validated_data)
        usuario.save()
        return usuario
