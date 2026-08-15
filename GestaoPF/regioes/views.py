from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from usuarios.permissions import EhAdministradorOuSomenteLeitura
from .models import Regiao, Localidade, Rua
from .serializers import (
    RegiaoSerializer,
    LocalidadeSerializer,
    RuaSerializer,
)


class RegiaoViewSet(viewsets.ModelViewSet):
    queryset = Regiao.objects.all().order_by("nome")
    serializer_class = RegiaoSerializer
    permission_classes = [EhAdministradorOuSomenteLeitura]

class LocalidadeViewSet(viewsets.ModelViewSet):
    queryset = (
        Localidade.objects
        .select_related("regiao")
        .all()
        .order_by("nome")
    )

    serializer_class = LocalidadeSerializer
    permission_classes = [EhAdministradorOuSomenteLeitura]
    def get_queryset(self):
        queryset = super().get_queryset()

        regiao = self.request.query_params.get("regiao")
        tipo = self.request.query_params.get("tipo")
        ativa = self.request.query_params.get("ativa")

        if regiao:
            queryset = queryset.filter(regiao_id=regiao)

        if tipo:
            queryset = queryset.filter(tipo=tipo)

        if ativa is not None:
            if ativa.lower() == "true":
                queryset = queryset.filter(ativa=True)

            elif ativa.lower() == "false":
                queryset = queryset.filter(ativa=False)

        return queryset


class RuaViewSet(viewsets.ModelViewSet):
    queryset = (
        Rua.objects
        .select_related(
            "localidade",
            "localidade__regiao",
        )
        .all()
        .order_by("nome")
    )

    serializer_class = RuaSerializer
    permission_classes = [EhAdministradorOuSomenteLeitura]
    def get_queryset(self):
        queryset = super().get_queryset()

        localidade = self.request.query_params.get("localidade")
        regiao = self.request.query_params.get("regiao")
        ativa = self.request.query_params.get("ativa")

        if localidade:
            queryset = queryset.filter(
                localidade_id=localidade
            )

        if regiao:
            queryset = queryset.filter(
                localidade__regiao_id=regiao
            )

        if ativa is not None:
            if ativa.lower() == "true":
                queryset = queryset.filter(ativa=True)

            elif ativa.lower() == "false":
                queryset = queryset.filter(ativa=False)

        return queryset