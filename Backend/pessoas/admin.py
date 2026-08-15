from django.contrib import admin

from .models import Pessoa


@admin.register(Pessoa)
class PessoaAdmin(admin.ModelAdmin):

    list_display = (
        "nome_completo",
        "cpf",
        "data_nascimento",
        "titulo_eleitor",
        "telefone",
        "regiao",
        "localidade",
        "rua",
        "cadastrada_por",
        "status",
        "status_verificacao_cpf",
        "status_verificacao_titulo",
        "criado_em",
    )

    list_filter = (
        "status",
        "status_verificacao_cpf",
        "status_verificacao_titulo",
        "regiao",
        "localidade__tipo",
        "localidade",
        "rua",
        "cadastrada_por",
        "criado_em",
    )

    search_fields = (
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
    )

    autocomplete_fields = (
        "regiao",
        "localidade",
        "rua",
        "cadastrada_por",
    )

    readonly_fields = (
        "criado_em",
        "atualizado_em",
    )

    ordering = (
        "-criado_em",
    )

    date_hierarchy = "criado_em"

    list_per_page = 25

    fieldsets = (
        (
            "Dados pessoais",
            {
                "fields": (
                    "nome_completo",
                    "cpf",
                    "data_nascimento",
                    "titulo_eleitor",
                    "telefone",
                )
            },
        ),
        (
            "Endereço",
            {
                "fields": (
                    "regiao",
                    "localidade",
                    "rua",
                    "numero",
                    "complemento",
                )
            },
        ),
        (
            "Verificações",
            {
                "fields": (
                    "status_verificacao_cpf",
                    "status_verificacao_titulo",
                )
            },
        ),
        (
            "Cadastro",
            {
                "fields": (
                    "cadastrada_por",
                    "status",
                    "observacoes",
                )
            },
        ),
        (
            "Controle",
            {
                "fields": (
                    "criado_em",
                    "atualizado_em",
                )
            },
        ),
    )