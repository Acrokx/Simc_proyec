from django.contrib import admin
from .models import Medicion

@admin.register(Medicion)
class MedicionAdmin(admin.ModelAdmin):
    list_display = ('valor_humedad', 'fecha_medicion', 'id_sensor')
    list_filter = ('fecha_medicion',)
    search_fields = ('id_sensor__tipo_sensor',)
