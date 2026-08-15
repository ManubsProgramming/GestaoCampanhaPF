from django.contrib import admin

from .models import Regiao, Localidade, Rua


@admin.register(Regiao)
class RegiaoAdmin(admin.ModelAdmin):
    list_display = (
        "nome",
        "ativa",
        "criado_em",
        "atualizado_em",
    )

    list_filter = (
        "ativa",
    )

    search_fields = (
        "nome",
    )

    ordering = (
        "nome",
    )


@admin.register(Localidade)
class LocalidadeAdmin(admin.ModelAdmin):
    list_display = (
        "nome",
        "tipo",
        "regiao",
        "ativa",
        "criado_em",
    )

    list_filter = (
        "tipo",
        "regiao",
        "ativa",
    )

    search_fields = (
        "nome",
        "regiao__nome",
    )

    autocomplete_fields = (
        "regiao",
    )

    ordering = (
        "regiao__nome",
        "nome",
    )


@admin.register(Rua)
class RuaAdmin(admin.ModelAdmin):
    list_display = (
        "nome",
        "localidade",
        "tipo_localidade",
        "regiao",
        "ativa",
        "criado_em",
    )

    list_filter = (
        "ativa",
        "localidade__tipo",
        "localidade__regiao",
    )

    search_fields = (
        "nome",
        "localidade__nome",
        "localidade__regiao__nome",
    )

    autocomplete_fields = (
        "localidade",
    )

    ordering = (
        "localidade__regiao__nome",
        "localidade__nome",
        "nome",
    )

    @admin.display(description="Tipo")
    def tipo_localidade(self, obj):
        return obj.localidade.get_tipo_display()

    @admin.display(description="Região")
    def regiao(self, obj):
        return obj.localidade.regiao.nome