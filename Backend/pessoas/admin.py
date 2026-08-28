from django.contrib import admin

from .models import Pessoa


@admin.register(Pessoa)
class PessoaAdmin(admin.ModelAdmin):
    list_display = [
        "nome_completo",
        "cpf",
        "telefone",
        "regiao",
        "localidade",
        "rua",
        "cadastrada_por",
        "status",
        "criado_em",
    ]

    search_fields = [
        "nome_completo",
        "cpf",
        "telefone",
        "cadastrada_por__username",
        "cadastrada_por__first_name",
        "cadastrada_por__last_name",
    ]

    list_filter = [
        "status",
        "regiao",
        "localidade",
        "status_verificacao_cpf",
        "criado_em",
    ]

    readonly_fields = [
        "criado_em",
        "atualizado_em",
    ]

    fieldsets = [
        (
            "Dados pessoais",
            {
                "fields": [
                    "nome_completo",
                    "cpf",
                    "data_nascimento",
                    "telefone",
                ]
            },
        ),


        (
            "Endereço",
            {
                "fields": [
                    "regiao",
                    "localidade",
                    "rua",
                    "numero",
                    "complemento",
                ]
            },
        ),

        (
            "Cadastro",
            {
                "fields": [
                    "cadastrada_por",
                    "status",
                    "status_verificacao_cpf",
                    "observacoes",
                ]
            },
        ),

        (
            "Datas",
            {
                "fields": [
                    "criado_em",
                    "atualizado_em",
                ]
            },
        ),
    ]