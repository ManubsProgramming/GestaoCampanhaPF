from django.urls import path

from .views import (
    AlterarSenhaView,
    ConfiguracaoSistemaView,
)


urlpatterns = [
    path(
        "configuracoes/",
        ConfiguracaoSistemaView.as_view(),
        name="configuracoes",
    ),

    path(
        "configuracoes/alterar-senha/",
        AlterarSenhaView.as_view(),
        name="alterar-senha",
    ),
]