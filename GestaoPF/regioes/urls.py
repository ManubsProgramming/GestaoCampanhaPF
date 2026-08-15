from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    RegiaoViewSet,
    LocalidadeViewSet,
    RuaViewSet,
)


router = DefaultRouter()

router.register(
    "regioes",
    RegiaoViewSet,
    basename="regiao",
)

router.register(
    "localidades",
    LocalidadeViewSet,
    basename="localidade",
)

router.register(
    "ruas",
    RuaViewSet,
    basename="rua",
)


urlpatterns = [
    path("", include(router.urls)),
]