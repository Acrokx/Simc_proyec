from django.contrib import admin
from .models import Sensor

@admin.register(Sensor)
class SensorAdmin(admin.ModelAdmin):
    list_display = ('tipo_sensor', 'ubicacion', 'estado', 'id_cultivo')
    list_filter = ('estado',)
    search_fields = ('ubicacion',)
