from django.db import models
from cultivos.models import Cultivo


class Sensor(models.Model):
    """Modelo de Sensor instalado para monitorear el cultivo"""
    id_sensor = models.AutoField(primary_key=True, db_column='id_sensor')
    tipo_sensor = models.CharField(max_length=50)
    ubicacion = models.CharField(max_length=100)
    estado = models.CharField(max_length=50)
    id_cultivo = models.ForeignKey(Cultivo, on_delete=models.CASCADE, related_name='sensores', db_column='id_cultivo')

    class Meta:
        db_table = 'sensor'

    def __str__(self):
        return f"{self.tipo_sensor} - {self.ubicacion} ({self.estado})"
