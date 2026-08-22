from datetime import timedelta

from django.db.models import (
    Count,
    Q,
)
from django.utils import timezone

from rest_framework import (
    filters,
    status,
    viewsets,
)
from rest_framework.decorators import (
    action,
)
from rest_framework.permissions import (
    IsAuthenticated,
)
from rest_framework.response import (
    Response,
)
from rest_framework.views import (
    APIView,
)

from rest_framework_simplejwt.tokens import (
    RefreshToken,
)

from auditoria.services import (
    registrar_auditoria,
)
from rest_framework.throttling import (
    AnonRateThrottle,
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
)
from .models import Usuario
from .permissions import (
    EhAdministrador,
)
from .serializers import (
    UsuarioCriacaoSerializer,
    UsuarioSerializer,
)


class LogoutView(APIView):
    permission_classes = [
        IsAuthenticated
    ]

    def post(
        self,
        request,
    ):
        refresh_token = (
            request.data.get(
                "refresh"
            )
        )

        if not refresh_token:
            return Response(
                {
                    "detail":
                        "Refresh token não informado."
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )

        try:
            token = RefreshToken(
                refresh_token
            )

            token.blacklist()

        except Exception:
            return Response(
                {
                    "detail":
                        "Refresh token inválido."
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )

        registrar_auditoria(
            request=request,
            acao="LOGOUT",
            entidade="Usuario",
            entidade_id=(
                request.user.id
            ),
            descricao=(
                f"Usuário "
                f"{request.user.username} "
                f"encerrou a sessão."
            ),
        )

        return Response(
            {
                "detail":
                    "Logout realizado com sucesso."
            },
            status=(
                status
                .HTTP_200_OK
            ),
        )

class LoginRateThrottle(
    AnonRateThrottle
):
    scope = "login"


class LoginView(
    TokenObtainPairView
):
    throttle_classes = [
        LoginRateThrottle
    ]
class UsuarioViewSet(
    viewsets.ModelViewSet
):
    permission_classes = [
        EhAdministrador
    ]

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "username",
        "email",
        "first_name",
        "last_name",
        "telefone",
    ]

    ordering_fields = [
        "username",
        "first_name",
        "last_name",
        "criado_em",
        "total_cadastros",
    ]

    ordering = [
        "first_name",
        "username",
    ]

    def get_queryset(
        self
    ):
        agora = timezone.now()

        inicio_hoje = agora.replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )

        inicio_semana = (
            inicio_hoje
            - timedelta(
                days=6
            )
        )

        inicio_mes = (
            inicio_hoje.replace(
                day=1
            )
        )

        return (
            Usuario.objects
            .annotate(
                total_cadastros=Count(
                    "pessoas_cadastradas",
                    distinct=True,
                ),

                cadastros_hoje=Count(
                    "pessoas_cadastradas",
                    filter=Q(
                        pessoas_cadastradas__criado_em__gte=(
                            inicio_hoje
                        )
                    ),
                    distinct=True,
                ),

                cadastros_semana=Count(
                    "pessoas_cadastradas",
                    filter=Q(
                        pessoas_cadastradas__criado_em__gte=(
                            inicio_semana
                        )
                    ),
                    distinct=True,
                ),

                cadastros_mes=Count(
                    "pessoas_cadastradas",
                    filter=Q(
                        pessoas_cadastradas__criado_em__gte=(
                            inicio_mes
                        )
                    ),
                    distinct=True,
                ),
            )
            .order_by(
                "first_name",
                "username",
            )
        )

    def get_permissions(
        self
    ):
        if (
            self.action == "me"
        ):
            return [
                IsAuthenticated()
            ]

        return [
            EhAdministrador()
        ]

    def get_serializer_class(
        self
    ):
        if (
            self.action == "create"
        ):
            return (
                UsuarioCriacaoSerializer
            )

        return UsuarioSerializer

    @action(
        detail=False,
        methods=["get"],
        url_path="me",
    )
    def me(
        self,
        request,
    ):
        usuario = (
            self.get_queryset()
            .get(
                pk=request.user.pk
            )
        )

        serializer = (
            UsuarioSerializer(
                usuario
            )
        )

        return Response(
            serializer.data
        )

    def perform_create(
        self,
        serializer,
    ):
        usuario = (
            serializer.save()
        )

        registrar_auditoria(
            request=self.request,
            acao="CRIACAO",
            entidade="Usuario",
            entidade_id=(
                usuario.id
            ),
            descricao=(
                f"Usuário "
                f"{usuario.username} "
                f"criado."
            ),
        )

    def perform_update(
        self,
        serializer,
    ):
        usuario = (
            serializer.save()
        )

        registrar_auditoria(
            request=self.request,
            acao="ALTERACAO",
            entidade="Usuario",
            entidade_id=(
                usuario.id
            ),
            descricao=(
                f"Usuário "
                f"{usuario.username} "
                f"alterado."
            ),
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs,
    ):
        usuario = (
            self.get_object()
        )

        if (
            usuario
            == request.user
        ):
            return Response(
                {
                    "detail": (
                        "Você não pode "
                        "desativar o próprio usuário."
                    )
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )

        usuario.ativo = False
        usuario.is_active = False

        usuario.save(
            update_fields=[
                "ativo",
                "is_active",
            ]
        )

        registrar_auditoria(
            request=request,
            acao="DESATIVACAO",
            entidade="Usuario",
            entidade_id=(
                usuario.id
            ),
            descricao=(
                f"Usuário "
                f"{usuario.username} "
                f"desativado."
            ),
        )

        return Response(
            {
                "detail": (
                    "Usuário desativado "
                    "com sucesso."
                )
            },
            status=(
                status
                .HTTP_200_OK
            ),
        )

    @action(
        detail=True,
        methods=["patch"],
        url_path="ativar",
    )
    def ativar(
        self,
        request,
        pk=None,
    ):
        usuario = (
            self.get_object()
        )

        usuario.ativo = True
        usuario.is_active = True

        usuario.save(
            update_fields=[
                "ativo",
                "is_active",
            ]
        )

        registrar_auditoria(
            request=request,
            acao="ATIVACAO",
            entidade="Usuario",
            entidade_id=(
                usuario.id
            ),
            descricao=(
                f"Usuário "
                f"{usuario.username} "
                f"ativado."
            ),
        )

        return Response(
            {
                "detail": (
                    "Usuário ativado "
                    "com sucesso."
                )
            },
            status=(
                status
                .HTTP_200_OK
            ),
        )