from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from regioes.models import Regiao, Localidade, Rua


def validar_cpf(cpf):
    cpf = "".join(
        filter(str.isdigit, cpf)
    )

    if len(cpf) != 11:
        raise ValidationError(
            "CPF deve conter 11 dígitos."
        )

    if cpf == cpf[0] * 11:
        raise ValidationError(
            "CPF inválido."
        )

    soma = sum(
        int(cpf[i]) * (10 - i)
        for i in range(9)
    )

    digito1 = (
        soma * 10 % 11
    ) % 10

    soma = sum(
        int(cpf[i]) * (11 - i)
        for i in range(10)
    )

    digito2 = (
        soma * 10 % 11
    ) % 10

    if cpf[-2:] != (
        f"{digito1}{digito2}"
    ):
        raise ValidationError(
            "CPF inválido."
        )


class Pessoa(models.Model):

    class Status(models.TextChoices):
        ATIVO = (
            "ATIVO",
            "Ativo",
        )
        INATIVO = (
            "INATIVO",
            "Inativo",
        )

    class StatusVerificacao(
        models.TextChoices
    ):
        NAO_VERIFICADO = (
            "NAO_VERIFICADO",
            "Não verificado",
        )
        CONSULTADO = (
            "CONSULTADO",
            "Consulta realizada",
        )

    nome_completo = models.CharField(
        max_length=200,
    )

    cpf = models.CharField(
        max_length=14,
        unique=True,
        validators=[
            validar_cpf
        ],
    )

    data_nascimento = models.DateField()

    # -------------------------
    # FILIAÇÃO
    # -------------------------

    nome_mae = models.CharField(
        max_length=200,
        blank=True,
    )

    nome_pai = models.CharField(
        max_length=200,
        blank=True,
    )

    # -------------------------
    # DADOS ELEITORAIS
    # -------------------------

    titulo_eleitor = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True,
    )

    zona_eleitoral = models.CharField(
        max_length=10,
        blank=True,
    )

    secao_eleitoral = models.CharField(
        max_length=10,
        blank=True,
    )

    municipio_eleitoral = models.CharField(
        max_length=150,
        blank=True,
    )

    # -------------------------
    # CONTATO
    # -------------------------

    telefone = models.CharField(
        max_length=20,
        blank=True,
    )

    # -------------------------
    # ENDEREÇO
    # -------------------------

    regiao = models.ForeignKey(
        Regiao,
        on_delete=models.PROTECT,
        related_name="pessoas",
    )

    localidade = models.ForeignKey(
        Localidade,
        on_delete=models.PROTECT,
        related_name="pessoas",
    )

    rua = models.ForeignKey(
        Rua,
        on_delete=models.PROTECT,
        related_name="pessoas",
    )

    numero = models.CharField(
        max_length=20,
        blank=True,
    )

    complemento = models.CharField(
        max_length=200,
        blank=True,
    )

    observacoes = models.TextField(
        blank=True,
    )
    # -------------------------
    # OPÇÕES DE CANDIDATOS
    # -------------------------

    candidato_deputado_estadual = models.BooleanField(
        default=False,
    )

    candidato_senador = models.BooleanField(
        default=False,
    )

    candidato_governador = models.BooleanField(
        default=False,
    )

    candidato_deputado_federal = models.BooleanField(
        default=False,
    )
    # -------------------------
    # USUÁRIO QUE CADASTROU
    # -------------------------

    cadastrada_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="pessoas_cadastradas",
    )

    # -------------------------
    # STATUS
    # -------------------------

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ATIVO,
    )

    status_verificacao_cpf = models.CharField(
        max_length=20,
        choices=StatusVerificacao.choices,
        default=StatusVerificacao.NAO_VERIFICADO,
    )

    status_verificacao_titulo = models.CharField(
        max_length=20,
        choices=StatusVerificacao.choices,
        default=StatusVerificacao.NAO_VERIFICADO,
    )

    # -------------------------
    # DATAS
    # -------------------------

    criado_em = models.DateTimeField(
        auto_now_add=True,
    )

    atualizado_em = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        verbose_name = "Pessoa cadastrada"
        verbose_name_plural = (
            "Pessoas cadastradas"
        )
        ordering = [
            "-criado_em"
        ]

    def __str__(self):
        return self.nome_completo