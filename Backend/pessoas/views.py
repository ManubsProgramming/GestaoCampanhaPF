from django_filters.rest_framework import (
    DjangoFilterBackend,
)

from rest_framework import (
    filters,
    viewsets,
)

from rest_framework.permissions import (
    IsAuthenticated,
)

from auditoria.services import (
    registrar_auditoria,
)

from .models import Pessoa

from .serializers import (
    PessoaSerializer,
)


class PessoaViewSet(
    viewsets.ModelViewSet
):
    serializer_class = (
        PessoaSerializer
    )

    permission_classes = [
        IsAuthenticated
    ]

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
        "zona_eleitoral",
        "secao_eleitoral",
        "municipio_eleitoral",
    ]

    search_fields = [
        "nome_completo",
        "cpf",
        "titulo_eleitor",
        "zona_eleitoral",
        "secao_eleitoral",
        "municipio_eleitoral",
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

        usuario = (
            self.request.user
        )

        if (
            usuario.tipo ==
            "CADASTRADOR"
        ):
            queryset = (
                queryset.filter(
                    cadastrada_por=usuario
                )
            )

        data_inicio = (
            self.request
            .query_params
            .get(
                "data_inicio"
            )
        )

        data_fim = (
            self.request
            .query_params
            .get(
                "data_fim"
            )
        )

        if data_inicio:
            queryset = (
                queryset.filter(
                    criado_em__date__gte=(
                        data_inicio
                    )
                )
            )

        if data_fim:
            queryset = (
                queryset.filter(
                    criado_em__date__lte=(
                        data_fim
                    )
                )
            )

        return queryset

    def perform_create(
        self,
        serializer,
    ):
        pessoa = serializer.save(
            cadastrada_por=(
                self.request.user
            )
        )

        registrar_auditoria(
            request=self.request,
            acao="CRIACAO",
            entidade="Pessoa",
            entidade_id=pessoa.id,
            descricao=(
                f"Pessoa "
                f"{pessoa.nome_completo} "
                f"cadastrada."
            ),
        )

    def perform_update(
        self,
        serializer,
    ):
        pessoa = serializer.save()

        registrar_auditoria(
            request=self.request,
            acao="ALTERACAO",
            entidade="Pessoa",
            entidade_id=pessoa.id,
            descricao=(
                f"Cadastro de "
                f"{pessoa.nome_completo} "
                f"alterado."
            ),
        )

    def perform_destroy(
        self,
        instance,
    ):
        pessoa_id = (
            instance.id
        )

        nome = (
            instance.nome_completo
        )

        instance.delete()

        registrar_auditoria(
            request=self.request,
            acao="EXCLUSAO",
            entidade="Pessoa",
            entidade_id=pessoa_id,
            descricao=(
                f"Cadastro de "
                f"{nome} excluído."
            ),
        )