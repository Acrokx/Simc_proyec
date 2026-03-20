from django.contrib import admin
from .models import Usuario

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'correo', 'rol', 'fecha_registro')
    list_filter = ('rol', 'fecha_registro')
    search_fields = ('nombre', 'correo')
