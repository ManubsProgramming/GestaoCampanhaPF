import uuid

from django.db import migrations, models


def preencher_public_ids(
    apps,
    schema_editor,
):
    Usuario = apps.get_model(
        "usuarios",
        "Usuario",
    )

    for usuario in (
        Usuario.objects
        .filter(
            public_id__isnull=True
        )
        .iterator()
    ):
        usuario.public_id = (
            uuid.uuid4()
        )

        usuario.save(
            update_fields=[
                "public_id"
            ]
        )


class Migration(
    migrations.Migration
):

    dependencies = [
        (
            "usuarios",
            "0001_initial",
        ),
    ]

    operations = [

        # 1. Cria o campo sem UNIQUE
        migrations.AddField(
            model_name="usuario",
            name="public_id",
            field=models.UUIDField(
                null=True,
                editable=False,
            ),
        ),

        # 2. Gera um UUID diferente
        # para cada usuário existente
        migrations.RunPython(
            preencher_public_ids,
            migrations.RunPython.noop,
        ),

        # 3. Depois que todos possuem
        # UUID diferente, ativa UNIQUE
        migrations.AlterField(
            model_name="usuario",
            name="public_id",
            field=models.UUIDField(
                default=uuid.uuid4,
                editable=False,
                unique=True,
            ),
        ),
    ]