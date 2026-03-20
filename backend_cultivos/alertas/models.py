from django.db import models
from mediciones.models import Medicion


class Alerta(models.Model):
    """Modelo de Alerta generada cuando los niveles de humedad son inadecuados"""
    id_alerta = models.AutoField(primary_key=True, db_column='id_alerta')
    tipo_alerta = models.CharField(max_length=50)
    descripcion = models.TextField()
    fecha_alerta = models.DateTimeField(auto_now_add=True)
    prioridad = models.CharField(max_length=20, default='media')
    leida = models.BooleanField(default=False)
    id_medicion = models.ForeignKey(Medicion, on_delete=models.CASCADE, related_name='alertas', db_column='id_medicion', null=True, blank=True)

    class Meta:
        db_table = 'alerta'

    def __str__(self):
        return f"{self.tipo_alerta} - {self.fecha_alerta}"
