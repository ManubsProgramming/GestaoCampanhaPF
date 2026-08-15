from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PessoaViewSet


router = DefaultRouter()

router.register(
    "pessoas",
    PessoaViewSet,
    basename="pessoa",
)


urlpatterns = [
    path("", include(router.urls)),
]