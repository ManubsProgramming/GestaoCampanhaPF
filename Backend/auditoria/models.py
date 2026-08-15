from django.conf import settings
from django.db import models


class RegistroAuditoria(models.Model):

    class Acao(models.TextChoices):
        LOGIN = "LOGIN", "Login"
        LOGOUT = "LOGOUT", "Logout"
        CRIACAO = "CRIACAO", "Criação"
        ALTERACAO = "ALTERACAO", "Alteração"
        EXCLUSAO = "EXCLUSAO", "Exclusão"
        ATIVACAO = "ATIVACAO", "Ativação"
        DESATIVACAO = "DESATIVACAO", "Desativação"
        CONSULTA = "CONSULTA", "Consulta"

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="registros_auditoria",
    )

    acao = models.CharField(
        max_length=20,
        choices=Acao.choices,
    )

    entidade = models.CharField(
        max_length=100,
    )

    entidade_id = models.PositiveBigIntegerField(
        null=True,
        blank=True,
    )

    descricao = models.TextField(
        blank=True,
    )

    endereco_ip = models.GenericIPAddressField(
        null=True,
        blank=True,
    )

    dados_extras = models.JSONField(
        default=dict,
        blank=True,
    )

    criado_em = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        verbose_name = "Registro de auditoria"
        verbose_name_plural = "Registros de auditoria"
        ordering = ["-criado_em"]

    def __str__(self):
        usuario = self.usuario or "Sistema"

        return (
            f"{usuario} - "
            f"{self.get_acao_display()} - "
            f"{self.entidade}"
        )