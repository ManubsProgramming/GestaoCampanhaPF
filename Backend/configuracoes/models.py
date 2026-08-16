from django.db import models


class ConfiguracaoSistema(models.Model):
    nome_sistema = models.CharField(
        max_length=150,
        default="Gestão de Cadastros",
    )

    nome_instituicao = models.CharField(
        max_length=200,
        blank=True,
    )

    email_instituicao = models.EmailField(
        blank=True,
    )

    logo = models.ImageField(
        upload_to="configuracoes/",
        blank=True,
        null=True,
    )

    menu_compacto = models.BooleanField(
        default=False,
    )

    animacoes_interface = models.BooleanField(
        default=True,
    )

    cadastrador_pode_criar = models.BooleanField(
        default=True,
    )

    cadastrador_pode_editar = models.BooleanField(
        default=True,
    )

    cadastrador_pode_excluir = models.BooleanField(
        default=False,
    )

    cadastrador_pode_ver_outros = models.BooleanField(
        default=False,
    )

    cadastrador_pode_exportar = models.BooleanField(
        default=False,
    )

    logout_automatico = models.BooleanField(
        default=True,
    )

    tempo_logout_minutos = models.PositiveIntegerField(
        default=30,
    )

    ultimo_backup = models.DateTimeField(
        null=True,
        blank=True,
    )

    atualizado_em = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        verbose_name = "Configuração do sistema"
        verbose_name_plural = "Configurações do sistema"

    def __str__(self):
        return self.nome_sistema