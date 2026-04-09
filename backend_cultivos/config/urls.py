"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.decorators.csrf import csrf_exempt
from usuarios.views import login_usuario, registro_usuario, logout_usuario, editar_perfil
from cultivos.views import dashboard_view, FincaViewSet, CultivoViewSet, HistorialRiegoViewSet
from rest_framework.routers import DefaultRouter

# Crear router para fincas y cultivos con rutas planas
router_cultivos = DefaultRouter()
router_cultivos.register('fincas', FincaViewSet, basename='fincas')
router_cultivos.register('cultivos', CultivoViewSet, basename='cultivos')
router_cultivos.register('riegos', HistorialRiegoViewSet, basename='riegos')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints - Rutas principales para el frontend
    path('api/login/', csrf_exempt(login_usuario), name='login'),
    path('api/logout/', csrf_exempt(logout_usuario), name='logout'),
    path('api/registro/', csrf_exempt(registro_usuario), name='registro'),
    path('api/dashboard/', dashboard_view, name='dashboard'),
    
    # Fincas y Cultivos con rutas planas
    path('api/', include(router_cultivos.urls)),
    
    # Sensores
    path('api/sensores/', include('sensores.urls')),
    
    # Mediciones
    path('api/mediciones/', include('mediciones.urls')),
    
    # Alertas
    path('api/alertas/', include('alertas.urls')),
    
    # Rutas originales (para compatibilidad)
    path('api/usuarios/', include('usuarios.urls')),
    path('api/usuarios/perfil/', csrf_exempt(editar_perfil), name='editar_perfil_api'),
]
