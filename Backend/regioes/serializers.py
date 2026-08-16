from rest_framework import serializers

from .models import Regiao, Localidade, Rua


class RegiaoSerializer(serializers.ModelSerializer):
    total_pessoas = serializers.IntegerField(
        read_only=True,
    )

    class Meta:
        model = Regiao

        fields = [
            "id",
            "nome",
            "ativa",
            "total_pessoas",
            "criado_em",
            "atualizado_em",
        ]

        read_only_fields = [
            "id",
            "total_pessoas",
            "criado_em",
            "atualizado_em",
        ]


class LocalidadeSerializer(serializers.ModelSerializer):
    regiao_nome = serializers.CharField(
        source="regiao.nome",
        read_only=True,
    )

    tipo_nome = serializers.CharField(
        source="get_tipo_display",
        read_only=True,
    )

    total_pessoas = serializers.IntegerField(
        read_only=True,
    )

    class Meta:
        model = Localidade

        fields = [
            "id",
            "regiao",
            "regiao_nome",
            "nome",
            "tipo",
            "tipo_nome",
            "ativa",
            "total_pessoas",
            "criado_em",
            "atualizado_em",
        ]

        read_only_fields = [
            "id",
            "total_pessoas",
            "criado_em",
            "atualizado_em",
        ]


class RuaSerializer(serializers.ModelSerializer):
    localidade_nome = serializers.CharField(
        source="localidade.nome",
        read_only=True,
    )

    tipo_localidade = serializers.CharField(
        source="localidade.get_tipo_display",
        read_only=True,
    )

    regiao_id = serializers.IntegerField(
        source="localidade.regiao.id",
        read_only=True,
    )

    regiao_nome = serializers.CharField(
        source="localidade.regiao.nome",
        read_only=True,
    )

    total_pessoas = serializers.IntegerField(
        read_only=True,
    )

    class Meta:
        model = Rua

        fields = [
            "id",
            "localidade",
            "localidade_nome",
            "tipo_localidade",
            "regiao_id",
            "regiao_nome",
            "nome",
            "ativa",
            "total_pessoas",
            "criado_em",
            "atualizado_em",
        ]

        read_only_fields = [
            "id",
            "total_pessoas",
            "criado_em",
            "atualizado_em",
        ]