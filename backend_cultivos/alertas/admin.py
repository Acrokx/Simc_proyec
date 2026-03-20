from django.contrib import admin
from .models import Alerta

@admin.register(Alerta)
class AlertaAdmin(admin.ModelAdmin):
    list_display = ('tipo_alerta', 'descripcion', 'fecha_alerta', 'id_medicion')
    list_filter = ('tipo_alerta', 'fecha_alerta')
    search_fields = ('descripcion',)
