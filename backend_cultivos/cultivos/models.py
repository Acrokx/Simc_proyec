from django.db import models
from usuarios.models import Usuario


class Finca(models.Model):
    """Modelo de Finca registrado en el sistema"""
    id_finca = models.AutoField(primary_key=True, db_column='id_finca')
    nombre_finca = models.CharField(max_length=100)
    ubicacion = models.CharField(max_length=150)
    tamaño_hectareas = models.DecimalField(max_digits=10, decimal_places=2)
    descripcion = models.TextField(blank=True, null=True)
    id_usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='fincas', db_column='id_usuario')

    class Meta:
        db_table = 'finca'

    def __str__(self):
        return self.nombre_finca


class Cultivo(models.Model):
    """Modelo de Cultivo presente en cada finca"""
    id_cultivo = models.AutoField(primary_key=True, db_column='id_cultivo')
    tipo_cultivo = models.CharField(max_length=100)
    fecha_siembra = models.DateField()
    estado = models.CharField(max_length=50)
    id_finca = models.ForeignKey(Finca, on_delete=models.CASCADE, related_name='cultivos', db_column='id_finca')

    class Meta:
        db_table = 'cultivo'

    def __str__(self):
        return f"{self.tipo_cultivo} ({self.estado})"


class HistorialRiego(models.Model):
    """Modelo de Historial de Riegos realizados en los cultivos"""
    id_riego = models.AutoField(primary_key=True, db_column='id_riego')
    fecha_riego = models.DateField()
    cantidad_agua = models.DecimalField(max_digits=10, decimal_places=2)
    id_cultivo = models.ForeignKey(Cultivo, on_delete=models.CASCADE, related_name='riegos', db_column='id_cultivo')

    class Meta:
        db_table = 'historial_riego'

    def __str__(self):
        return f"Riego {self.id_cultivo.tipo_cultivo} - {self.fecha_riego}: {self.cantidad_agua}L"
