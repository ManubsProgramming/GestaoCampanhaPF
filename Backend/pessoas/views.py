from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from auditoria.services import registrar_auditoria

from .models import Pessoa
from .serializers import PessoaSerializer


class PessoaViewSet(viewsets.ModelViewSet):
    serializer_class = PessoaSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "regiao",
        "localidade",
        "rua",
        "cadastrada_por",
        "status",
    ]

    search_fields = [
        "nome_completo",
        "cpf",
        "titulo_eleitor",
        "telefone",
        "regiao__nome",
        "localidade__nome",
        "rua__nome",
        "cadastrada_por__username",
        "cadastrada_por__first_name",
        "cadastrada_por__last_name",
    ]

    ordering_fields = [
        "nome_completo",
        "criado_em",
        "atualizado_em",
    ]

    ordering = [
        "-criado_em",
    ]

    def get_queryset(self):
        queryset = (
            Pessoa.objects
            .select_related(
                "regiao",
                "localidade",
                "rua",
                "cadastrada_por",
            )
            .all()
        )

        data_inicio = self.request.query_params.get("data_inicio")
        data_fim = self.request.query_params.get("data_fim")

        if data_inicio:
            queryset = queryset.filter(
                criado_em__date__gte=data_inicio
            )

        if data_fim:
            queryset = queryset.filter(
                criado_em__date__lte=data_fim
            )

        return queryset

    def perform_create(self, serializer):
        pessoa = serializer.save(
            cadastrada_por=self.request.user
        )

        registrar_auditoria(
            request=self.request,
            acao="CRIACAO",
            entidade="Pessoa",
            entidade_id=pessoa.id,
            descricao=f"Pessoa {pessoa.nome_completo} cadastrada.",
        )

    def perform_update(self, serializer):
        pessoa = serializer.save()

        registrar_auditoria(
            request=self.request,
            acao="ALTERACAO",
            entidade="Pessoa",
            entidade_id=pessoa.id,
            descricao=f"Cadastro de {pessoa.nome_completo} alterado.",
        )

    def perform_destroy(self, instance):
        pessoa_id = instance.id
        nome = instance.nome_completo

        instance.delete()

        registrar_auditoria(
            request=self.request,
            acao="EXCLUSAO",
            entidade="Pessoa",
            entidade_id=pessoa_id,
            descricao=f"Cadastro de {nome} excluído.",
        )