from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import filters, viewsets

from usuarios.permissions import EhAdministrador

from .models import RegistroAuditoria
from .serializers import RegistroAuditoriaSerializer


class RegistroAuditoriaViewSet(
    viewsets.ReadOnlyModelViewSet
):
    serializer_class = RegistroAuditoriaSerializer
    permission_classes = [EhAdministrador]

    queryset = (
        RegistroAuditoria.objects
        .select_related("usuario")
        .all()
        .order_by("-criado_em")
    )

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "usuario",
        "acao",
        "entidade",
    ]

    search_fields = [
        "descricao",
        "entidade",
        "usuario__username",
        "usuario__first_name",
        "usuario__last_name",
        "endereco_ip",
    ]

    ordering_fields = [
        "criado_em",
        "acao",
        "entidade",
    ]

    ordering = [
        "-criado_em",
    ]

    def get_queryset(self):
        queryset = super().get_queryset()

        data_inicio = self.request.query_params.get(
            "data_inicio"
        )

        data_fim = self.request.query_params.get(
            "data_fim"
        )

        if data_inicio:
            queryset = queryset.filter(
                criado_em__date__gte=data_inicio
            )

        if data_fim:
            queryset = queryset.filter(
                criado_em__date__lte=data_fim
            )

        return queryset