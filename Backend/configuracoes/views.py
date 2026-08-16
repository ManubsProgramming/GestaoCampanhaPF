from django.contrib.auth import authenticate
from django.utils import timezone

from rest_framework import status
from rest_framework.parsers import (
    FormParser,
    JSONParser,
    MultiPartParser,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from auditoria.services import registrar_auditoria
from usuarios.permissions import EhAdministrador

from .models import ConfiguracaoSistema
from .serializers import ConfiguracaoSistemaSerializer


def obter_configuracao():
    configuracao, _ = (
        ConfiguracaoSistema.objects.get_or_create(
            pk=1
        )
    )

    return configuracao


class ConfiguracaoSistemaView(APIView):
    permission_classes = [
        EhAdministrador
    ]

    parser_classes = [
        JSONParser,
        MultiPartParser,
        FormParser,
    ]

    def get(self, request):
        configuracao = obter_configuracao()

        serializer = ConfiguracaoSistemaSerializer(
            configuracao,
            context={
                "request": request
            },
        )

        return Response(
            serializer.data
        )

    def patch(self, request):
        configuracao = obter_configuracao()

        serializer = ConfiguracaoSistemaSerializer(
            configuracao,
            data=request.data,
            partial=True,
            context={
                "request": request
            },
        )

        serializer.is_valid(
            raise_exception=True
        )

        configuracao = serializer.save()

        registrar_auditoria(
            request=request,
            acao="ALTERACAO",
            entidade="ConfiguracaoSistema",
            entidade_id=configuracao.id,
            descricao=(
                "Configurações do sistema alteradas."
            ),
        )

        return Response(
            ConfiguracaoSistemaSerializer(
                configuracao,
                context={
                    "request": request
                },
            ).data
        )


class AlterarSenhaView(APIView):
    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request):
        senha_atual = request.data.get(
            "senha_atual",
            "",
        )

        nova_senha = request.data.get(
            "nova_senha",
            "",
        )

        confirmar_senha = request.data.get(
            "confirmar_senha",
            "",
        )

        if not senha_atual:
            return Response(
                {
                    "detail": (
                        "Informe a senha atual."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(nova_senha) < 8:
            return Response(
                {
                    "detail": (
                        "A nova senha deve possuir "
                        "pelo menos 8 caracteres."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if nova_senha != confirmar_senha:
            return Response(
                {
                    "detail": (
                        "A confirmação da senha "
                        "não corresponde."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        usuario = authenticate(
            username=request.user.username,
            password=senha_atual,
        )

        if usuario is None:
            return Response(
                {
                    "detail": (
                        "A senha atual está incorreta."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        request.user.set_password(
            nova_senha
        )

        request.user.save(
            update_fields=[
                "password"
            ]
        )

        registrar_auditoria(
            request=request,
            acao="ALTERACAO",
            entidade="Usuario",
            entidade_id=request.user.id,
            descricao=(
                "Senha do usuário alterada."
            ),
        )

        return Response(
            {
                "detail": (
                    "Senha alterada com sucesso."
                )
            }
        )