from django.contrib.auth.password_validation import (
    validate_password,
)
from rest_framework import serializers

from .models import Usuario


class UsuarioSerializer(
    serializers.ModelSerializer
):
    nome_completo = (
        serializers.SerializerMethodField()
    )

    total_cadastros = (
        serializers.IntegerField(
            read_only=True,
        )
    )

    cadastros_hoje = (
        serializers.IntegerField(
            read_only=True,
        )
    )

    cadastros_semana = (
        serializers.IntegerField(
            read_only=True,
        )
    )

    cadastros_mes = (
        serializers.IntegerField(
            read_only=True,
        )
    )

    class Meta:
        model = Usuario

        fields = [
            "id",
            "public_id",
            "username",
            "email",
            "first_name",
            "last_name",
            "nome_completo",
            "telefone",
            "tipo",
            "ativo",
            "is_active",
            "is_staff",
            "total_cadastros",
            "cadastros_hoje",
            "cadastros_semana",
            "cadastros_mes",
            "criado_em",
            "atualizado_em",
        ]

        read_only_fields = [
            "id",
            "public_id",
            "is_staff",
            "total_cadastros",
            "cadastros_hoje",
            "cadastros_semana",
            "cadastros_mes",
            "criado_em",
            "atualizado_em",
        ]

    def get_nome_completo(
        self,
        obj,
    ):
        return (
            obj.get_full_name()
            or obj.username
        )


class UsuarioCriacaoSerializer(
    serializers.ModelSerializer
):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    class Meta:
        model = Usuario

        fields = [
            "id",
            "public_id",
            "username",
            "email",
            "first_name",
            "last_name",
            "telefone",
            "tipo",
            "password",
        ]

        read_only_fields = [
            "id",
            "public_id",
        ]

    def validate_password(
        self,
        value,
    ):
        validate_password(
            value
        )

        return value

    def create(
        self,
        validated_data,
    ):
        password = validated_data.pop(
            "password"
        )

        usuario = Usuario(
            **validated_data
        )

        usuario.set_password(
            password
        )

        usuario.is_staff = False
        usuario.is_superuser = False
        usuario.is_active = True
        usuario.ativo = True

        usuario.save()

        return usuario