from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "tipo",
        "ativo",
        "is_staff",
    )

    list_filter = (
        "tipo",
        "ativo",
        "is_staff",
        "is_superuser",
    )

    search_fields = (
        "username",
        "email",
        "first_name",
        "last_name",
        "telefone",
    )

    ordering = (
        "first_name",
        "last_name",
        "username",
    )

    fieldsets = UserAdmin.fieldsets + (
        (
            "Informações do GestaoPF",
            {
                "fields": (
                    "tipo",
                    "telefone",
                    "ativo",
                )
            },
        ),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "Informações do GestaoPF",
            {
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "tipo",
                    "telefone",
                    "ativo",
                )
            },
        ),
    )