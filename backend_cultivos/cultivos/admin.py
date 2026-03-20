from django.contrib import admin
from .models import Finca, Cultivo, HistorialRiego

@admin.register(Finca)
class FincaAdmin(admin.ModelAdmin):
    list_display = ('nombre_finca', 'ubicacion', 'tamaño_hectareas', 'id_usuario')
    list_filter = ('id_usuario',)
    search_fields = ('nombre_finca', 'ubicacion')

@admin.register(Cultivo)
class CultivoAdmin(admin.ModelAdmin):
    list_display = ('tipo_cultivo', 'fecha_siembra', 'estado', 'id_finca')
    list_filter = ('estado', 'fecha_siembra')
    search_fields = ('tipo_cultivo',)

@admin.register(HistorialRiego)
class HistorialRiegoAdmin(admin.ModelAdmin):
    list_display = ('id_cultivo', 'fecha_riego', 'cantidad_agua')
    list_filter = ('fecha_riego',)
