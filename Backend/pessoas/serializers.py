import re

from rest_framework import serializers

from .models import Pessoa


class PessoaSerializer(
    serializers.ModelSerializer
):
    regiao_nome = serializers.CharField(
        source="regiao.nome",
        read_only=True,
    )

    localidade_nome = serializers.CharField(
        source="localidade.nome",
        read_only=True,
    )

    tipo_localidade = serializers.CharField(
        source="localidade.get_tipo_display",
        read_only=True,
    )

    rua_nome = serializers.CharField(
        source="rua.nome",
        read_only=True,
    )

    cadastrada_por_nome = (
        serializers.SerializerMethodField()
    )

    class Meta:
        model = Pessoa

        fields = [
            "id",
            "nome_completo",
            "cpf",
            "data_nascimento",
            "nome_mae",
            "nome_pai",
            "telefone",
            "regiao",
            "regiao_nome",
            "localidade",
            "localidade_nome",
            "tipo_localidade",
            "rua",
            "rua_nome",
            "numero",
            "complemento",
            "observacoes",
            "cadastrada_por",
            "cadastrada_por_nome",
            "status",
            "status_verificacao_cpf",
            "criado_em",
            "atualizado_em",
        ]

        read_only_fields = [
            "id",
            "cadastrada_por",
            "status_verificacao_cpf",
            "criado_em",
            "atualizado_em",
        ]

    def validar_texto_seguro(
        self,
        valor,
        campo,
    ):
        if not valor:
            return valor

        texto = str(
            valor
        ).strip()

        padrao_perigoso = re.compile(
            (
                r"<\s*/?\s*"
                r"(script|iframe|object|embed|"
                r"style|img|svg|link|meta)\b"
            ),
            re.IGNORECASE,
        )

        if padrao_perigoso.search(
            texto
        ):
            raise serializers.ValidationError(
                (
                    f"O campo {campo} contém "
                    f"conteúdo não permitido."
                )
            )

        if re.search(
            r"javascript\s*:",
            texto,
            re.IGNORECASE,
        ):
            raise serializers.ValidationError(
                (
                    f"O campo {campo} contém "
                    f"conteúdo não permitido."
                )
            )

        if re.search(
            r"on[a-z]+\s*=",
            texto,
            re.IGNORECASE,
        ):
            raise serializers.ValidationError(
                (
                    f"O campo {campo} contém "
                    f"conteúdo não permitido."
                )
            )

        return texto

    def validate_nome_completo(
        self,
        value,
    ):
        return self.validar_texto_seguro(
            value,
            "nome completo",
        )

    def validate_nome_mae(
        self,
        value,
    ):
        return self.validar_texto_seguro(
            value,
            "nome da mãe",
        )

    def validate_nome_pai(
        self,
        value,
    ):
        return self.validar_texto_seguro(
            value,
            "nome do pai",
        )

    def validate_complemento(
        self,
        value,
    ):
        return self.validar_texto_seguro(
            value,
            "complemento",
        )

    def validate_observacoes(
        self,
        value,
    ):
        return self.validar_texto_seguro(
            value,
            "observações",
        )

    def get_cadastrada_por_nome(
        self,
        obj,
    ):
        if not obj.cadastrada_por:
            return ""

        nome = (
            obj.cadastrada_por
            .get_full_name()
        )

        if nome:
            return nome

        return (
            obj.cadastrada_por
            .username
        )

    def validate_cpf(
        self,
        value,
    ):
        cpf = "".join(
            filter(
                str.isdigit,
                value or "",
            )
        )

        queryset = (
            Pessoa.objects.filter(
                cpf=cpf
            )
        )

        if self.instance:
            queryset = (
                queryset.exclude(
                    pk=self.instance.pk
                )
            )

        if queryset.exists():
            raise serializers.ValidationError(
                (
                    "Já existe uma pessoa "
                    "cadastrada com este CPF."
                )
            )

        return cpf

    def validate(
        self,
        dados,
    ):
        regiao = dados.get(
            "regiao",
            getattr(
                self.instance,
                "regiao",
                None,
            ),
        )

        localidade = dados.get(
            "localidade",
            getattr(
                self.instance,
                "localidade",
                None,
            ),
        )

        rua = dados.get(
            "rua",
            getattr(
                self.instance,
                "rua",
                None,
            ),
        )

        if (
            regiao
            and localidade
            and localidade.regiao_id
            != regiao.id
        ):
            raise serializers.ValidationError(
                {
                    "localidade": (
                        "A localidade selecionada "
                        "não pertence à região "
                        "informada."
                    )
                }
            )

        if (
            localidade
            and rua
            and rua.localidade_id
            != localidade.id
        ):
            raise serializers.ValidationError(
                {
                    "rua": (
                        "A rua selecionada não "
                        "pertence à localidade "
                        "informada."
                    )
                }
            )

        return dados