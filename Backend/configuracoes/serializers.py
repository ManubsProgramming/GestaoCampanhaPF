from rest_framework import serializers

from .models import ConfiguracaoSistema


class ConfiguracaoSistemaSerializer(
    serializers.ModelSerializer
):
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = ConfiguracaoSistema

        fields = [
            "id",
            "nome_sistema",
            "nome_instituicao",
            "email_instituicao",
            "logo",
            "logo_url",
            "menu_compacto",
            "animacoes_interface",
            "cadastrador_pode_criar",
            "cadastrador_pode_editar",
            "cadastrador_pode_excluir",
            "cadastrador_pode_ver_outros",
            "cadastrador_pode_exportar",
            "logout_automatico",
            "tempo_logout_minutos",
            "ultimo_backup",
            "atualizado_em",
        ]

        read_only_fields = [
            "id",
            "logo_url",
            "ultimo_backup",
            "atualizado_em",
        ]

    def get_logo_url(self, obj):
        if not obj.logo:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                obj.logo.url
            )

        return obj.logo.url