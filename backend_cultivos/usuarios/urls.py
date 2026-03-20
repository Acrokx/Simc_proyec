from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.UsuarioViewSet)

urlpatterns = [
    # Rutas específicas primero (antes del router)
    path('perfil/', views.editar_perfil, name='editar_perfil'),
    path('login/', views.login_usuario, name='login_usuario'),
    path('registro/', views.registro_usuario, name='registro_usuario'),
    path('agricultores/', views.agricultores_view, name='agricultores'),
    path('eliminar/<int:pk>/', views.eliminar_agricultor, name='eliminar_agricultor'),
    path('editar/<int:pk>/', views.editar_agricultor, name='editar_agricultor'),
    # Router al final
    path('', include(router.urls)),
]
