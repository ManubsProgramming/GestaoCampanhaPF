"""
URL configuration for GestaoPF project.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

from usuarios.views import (
    LoginView,
)


urlpatterns = [

    # Django Admin

    path(
        "admin/",
        admin.site.urls,
    ),


    # Autenticação JWT

    path(
        "api/auth/login/",
        LoginView.as_view(),
        name="token_obtain_pair",
    ),

    path(
        "api/auth/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),


    # Dashboard

    path(
        "api/painel/",
        include(
            "painel.urls"
        ),
    ),


    # Regiões / localidades / ruas

    path(
        "api/",
        include(
            "regioes.urls"
        ),
    ),


    # Pessoas

    path(
        "api/",
        include(
            "pessoas.urls"
        ),
    ),


    # Usuários

    path(
        "api/",
        include(
            "usuarios.urls"
        ),
    ),


    # Relatórios

    path(
        "api/relatorios/",
        include(
            "relatorios.urls"
        ),
    ),


    # Auditoria

    path(
        "api/",
        include(
            "auditoria.urls"
        ),
    ),


    # Configurações

    path(
        "api/",
        include(
            "configuracoes.urls"
        ),
    ),

]


# Arquivos enviados pelo sistema,
# como a logo.

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=(
            settings.MEDIA_ROOT
        ),
    )