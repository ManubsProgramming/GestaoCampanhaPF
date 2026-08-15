from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):

    class Tipo(models.TextChoices):
        ADMINISTRADOR = "ADMINISTRADOR", "Administrador"
        CADASTRADOR = "CADASTRADOR", "Cadastrador"

    tipo = models.CharField(
        max_length=20,
        choices=Tipo.choices,
        default=Tipo.CADASTRADOR,
    )

    telefone = models.CharField(
        max_length=20,
        blank=True,
    )

    ativo = models.BooleanField(
        default=True,
    )

    criado_em = models.DateTimeField(
        auto_now_add=True,
    )

    atualizado_em = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        verbose_name = "Usuário"
        verbose_name_plural = "Usuários"

    def __str__(self):
        return self.get_full_name() or self.username