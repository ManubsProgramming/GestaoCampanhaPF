from rest_framework import serializers

from .models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    nome_completo = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            "id",
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
            "criado_em",
            "atualizado_em",
        ]

        read_only_fields = [
            "id",
            "is_staff",
            "criado_em",
            "atualizado_em",
        ]

    def get_nome_completo(self, obj):
        return obj.get_full_name() or obj.username


class UsuarioCriacaoSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    class Meta:
        model = Usuario
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "telefone",
            "tipo",
            "password",
        ]

        read_only_fields = ["id"]

    def create(self, validated_data):
        password = validated_data.pop("password")

        usuario = Usuario(**validated_data)

        usuario.set_password(password)

        # Usuários criados pela API não viram staff automaticamente.
        usuario.is_staff = False
        usuario.is_superuser = False
        usuario.is_active = True
        usuario.ativo = True

        usuario.save()

        return usuario