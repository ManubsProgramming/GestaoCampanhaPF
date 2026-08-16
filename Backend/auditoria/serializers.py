from rest_framework import serializers

from .models import RegistroAuditoria


class RegistroAuditoriaSerializer(serializers.ModelSerializer):
    usuario_nome = serializers.SerializerMethodField()
    acao_nome = serializers.CharField(
        source="get_acao_display",
        read_only=True,
    )

    class Meta:
        model = RegistroAuditoria

        fields = [
            "id",
            "usuario",
            "usuario_nome",
            "acao",
            "acao_nome",
            "entidade",
            "entidade_id",
            "descricao",
            "endereco_ip",
            "dados_extras",
            "criado_em",
        ]

        read_only_fields = fields

    def get_usuario_nome(self, obj):
        if not obj.usuario:
            return "Sistema"

        nome = obj.usuario.get_full_name()

        return nome or obj.usuario.username