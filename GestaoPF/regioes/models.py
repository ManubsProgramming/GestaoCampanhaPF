from django.db import models


class Regiao(models.Model):
    nome = models.CharField(
        max_length=150,
        unique=True,
    )

    ativa = models.BooleanField(
        default=True,
    )

    criado_em = models.DateTimeField(
        auto_now_add=True,
    )

    atualizado_em = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        verbose_name = "Região"
        verbose_name_plural = "Regiões"
        ordering = ["nome"]

    def __str__(self):
        return self.nome


class Localidade(models.Model):

    class Tipo(models.TextChoices):
        BAIRRO = "BAIRRO", "Bairro"
        COMUNIDADE = "COMUNIDADE", "Comunidade"

    regiao = models.ForeignKey(
        Regiao,
        on_delete=models.PROTECT,
        related_name="localidades",
    )

    nome = models.CharField(
        max_length=150,
    )

    tipo = models.CharField(
        max_length=20,
        choices=Tipo.choices,
        default=Tipo.BAIRRO,
    )

    ativa = models.BooleanField(
        default=True,
    )

    criado_em = models.DateTimeField(
        auto_now_add=True,
    )

    atualizado_em = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        verbose_name = "Localidade"
        verbose_name_plural = "Localidades"
        ordering = ["nome"]

        constraints = [
            models.UniqueConstraint(
                fields=["regiao", "nome", "tipo"],
                name="localidade_unica_por_regiao",
            )
        ]

    def __str__(self):
        return f"{self.nome} ({self.get_tipo_display()})"


class Rua(models.Model):
    localidade = models.ForeignKey(
        Localidade,
        on_delete=models.PROTECT,
        related_name="ruas",
        null=True,
        blank=True,
    )

    nome = models.CharField(
        max_length=200,
    )

    ativa = models.BooleanField(
        default=True,
    )

    criado_em = models.DateTimeField(
        auto_now_add=True,
    )

    atualizado_em = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        verbose_name = "Rua"
        verbose_name_plural = "Ruas"
        ordering = ["nome"]

        constraints = [
            models.UniqueConstraint(
                fields=["localidade", "nome"],
                name="rua_unica_por_localidade",
            )
        ]

    def __str__(self):
        return self.nome