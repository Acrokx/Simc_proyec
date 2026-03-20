from django.db import models
from sensores.models import Sensor


class Medicion(models.Model):
    """Modelo de Medición realizada por los sensores"""
    id_medicion = models.AutoField(primary_key=True, db_column='id_medicion')
    valor_humedad = models.DecimalField(max_digits=6, decimal_places=2)
    fecha_medicion = models.DateTimeField(auto_now_add=True)
    id_sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name='mediciones', db_column='id_sensor')

    class Meta:
        db_table = 'medicion'

    def __str__(self):
        return f"Medición {self.id_medicion} - {self.valor_humedad}% ({self.fecha_medicion})"
