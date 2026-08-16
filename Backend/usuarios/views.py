from django.db.models import Count

from rest_framework import (
    filters,
    status,
    viewsets,
)

from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from auditoria.services import registrar_auditoria

from .models import Usuario
from .permissions import EhAdministrador

from .serializers import (
    UsuarioCriacaoSerializer,
    UsuarioSerializer,
)


class UsuarioViewSet(viewsets.ModelViewSet):
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

    def get_queryset(self):
        return (
            Usuario.objects
            .annotate(
                total_cadastros=Count(
                    "pessoas_cadastradas"
                )
            )
            .order_by(
                "first_name",
                "username",
            )
        )

    def get_permissions(self):
        if self.action == "me":
            return [
                IsAuthenticated()
            ]

        return [
            EhAdministrador()
        ]

    def get_serializer_class(self):
        if self.action == "create":
            return (
                UsuarioCriacaoSerializer
            )

        return UsuarioSerializer

    @action(
        detail=False,
        methods=["get"],
        url_path="me",
    )
    def me(self, request):
        usuario = (
            Usuario.objects
            .annotate(
                total_cadastros=Count(
                    "pessoas_cadastradas"
                )
            )
            .get(
                pk=request.user.pk
            )
        )

        serializer = UsuarioSerializer(
            usuario
        )

        return Response(
            serializer.data
        )

    def perform_create(self, serializer):
        usuario = serializer.save()

        registrar_auditoria(
            request=self.request,
            acao="CRIACAO",
            entidade="Usuario",
            entidade_id=usuario.id,
            descricao=(
                f"Usuário "
                f"{usuario.username} criado."
            ),
        )

    def perform_update(self, serializer):
        usuario = serializer.save()

        registrar_auditoria(
            request=self.request,
            acao="ALTERACAO",
            entidade="Usuario",
            entidade_id=usuario.id,
            descricao=(
                f"Usuário "
                f"{usuario.username} alterado."
            ),
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs,
    ):
        usuario = self.get_object()

        if usuario == request.user:
            return Response(
                {
                    "detail": (
                        "Você não pode "
                        "desativar o próprio usuário."
                    )
                },
                status=(
                    status.HTTP_400_BAD_REQUEST
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
            entidade_id=usuario.id,
            descricao=(
                f"Usuário "
                f"{usuario.username} desativado."
            ),
        )

        return Response(
            {
                "detail": (
                    "Usuário desativado "
                    "com sucesso."
                )
            },
            status=status.HTTP_200_OK,
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
        usuario = self.get_object()

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
            entidade_id=usuario.id,
            descricao=(
                f"Usuário "
                f"{usuario.username} ativado."
            ),
        )

        return Response(
            {
                "detail": (
                    "Usuário ativado "
                    "com sucesso."
                )
            },
            status=status.HTTP_200_OK,
        )