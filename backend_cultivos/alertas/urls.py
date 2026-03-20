from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.AlertaViewSet)

urlpatterns = [
    path('crear/', views.crear_alerta, name='crear_alerta'),
    path('no-leidas/', views.alertas_no_leidas, name='alertas_no_leidas'),
    path('marcar-leida/<int:pk>/', views.marcar_leida, name='marcar_leida'),
    path('crear-automatica/', views.crear_alerta_automatica, name='crear_alerta_automatica'),
    path('', include(router.urls)),
]
