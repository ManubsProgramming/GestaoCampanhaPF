from django.contrib import admin

from .models import ConfiguracaoSistema


@admin.register(ConfiguracaoSistema)
class ConfiguracaoSistemaAdmin(
    admin.ModelAdmin
):
    list_display = [
        "nome_sistema",
        "nome_instituicao",
        "email_instituicao",
        "atualizado_em",
    ]

    readonly_fields = [
        "ultimo_backup",
        "atualizado_em",
    ]

    fieldsets = [
        (
            "Sistema",
            {
                "fields": [
                    "nome_sistema",
                    "nome_instituicao",
                    "email_instituicao",
                    "logo",
                ]
            },
        ),

        (
            "Interface",
            {
                "fields": [
                    "menu_compacto",
                    "animacoes_interface",
                ]
            },
        ),

        (
            "Permissões dos cadastradores",
            {
                "fields": [
                    "cadastrador_pode_criar",
                    "cadastrador_pode_editar",
                    "cadastrador_pode_excluir",
                    "cadastrador_pode_ver_outros",
                    "cadastrador_pode_exportar",
                ]
            },
        ),

        (
            "Segurança",
            {
                "fields": [
                    "logout_automatico",
                    "tempo_logout_minutos",
                ]
            },
        ),

        (
            "Backup",
            {
                "fields": [
                    "ultimo_backup",
                ]
            },
        ),
    ]