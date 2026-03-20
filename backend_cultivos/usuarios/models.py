from django.db import models

class Usuario(models.Model):
    """Tabla Usuario que almacena los usuarios del sistema"""
    id_usuario = models.AutoField(primary_key=True, db_column='id_usuario')
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100, blank=True, default='')
    correo = models.EmailField(max_length=100, unique=True)
    contraseña = models.CharField(max_length=255)
    telefono = models.CharField(max_length=20, blank=True, default='')
    rol = models.CharField(max_length=20, choices=[
        ('Administrador', 'Administrador'),
        ('Agricultor', 'Agricultor'),
    ], default='Agricultor')
    fecha_registro = models.DateField(auto_now_add=True)

    class Meta:
        db_table = 'usuario'

    def __str__(self):
        return self.nombre
