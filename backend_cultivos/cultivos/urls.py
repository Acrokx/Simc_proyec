from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('fincas', views.FincaViewSet)
router.register('cultivos', views.CultivoViewSet)
router.register('riegos', views.HistorialRiegoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
