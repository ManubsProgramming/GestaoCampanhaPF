from django.contrib import admin

from .models import RegistroAuditoria


@admin.register(RegistroAuditoria)
class RegistroAuditoriaAdmin(admin.ModelAdmin):

    list_display = (
        "usuario",
        "acao",
        "entidade",
        "entidade_id",
        "endereco_ip",
        "criado_em",
    )

    list_filter = (
        "acao",
        "entidade",
        "criado_em",
    )

    search_fields = (
        "usuario__username",
        "usuario__first_name",
        "usuario__last_name",
        "usuario__email",
        "entidade",
        "descricao",
        "endereco_ip",
    )

    readonly_fields = (
        "usuario",
        "acao",
        "entidade",
        "entidade_id",
        "descricao",
        "endereco_ip",
        "dados_extras",
        "criado_em",
    )

    ordering = (
        "-criado_em",
    )

    date_hierarchy = "criado_em"

    list_per_page = 50