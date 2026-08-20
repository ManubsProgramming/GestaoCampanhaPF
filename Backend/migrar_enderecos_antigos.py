import os
import re
import unicodedata

import django


os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "GestaoPF.settings",
)

django.setup()


from django.db import transaction

from pessoas.models import Pessoa
from regioes.models import (
    Localidade,
    Regiao,
    Rua,
)


def normalizar(texto):
    texto = str(
        texto or ""
    ).strip()

    texto = unicodedata.normalize(
        "NFD",
        texto,
    )

    texto = "".join(
        caractere
        for caractere in texto
        if unicodedata.category(
            caractere
        ) != "Mn"
    )

    texto = texto.lower()

    texto = re.sub(
        r"\bav\.?\s*",
        "avenida ",
        texto,
    )

    texto = re.sub(
        r"\br\.\s*",
        "rua ",
        texto,
    )

    texto = re.sub(
        r"\s+",
        " ",
        texto,
    )

    return texto.strip()


MAPEAMENTO = {
    "HONORIO HOLDAO": {
        "regiao":
            "Zona Urbana",

        "localidade":
            "Honório Roldão",
    },

    "JOSE DUTRA": {
        "regiao":
            "Zona Urbana",

        "localidade":
            "José Dutra",
    },

    "JARDIM FLORESTA": {
        "regiao":
            "Zona Rural",

        "localidade":
            "Jardim Floresta",
    },
}


@transaction.atomic
def migrar():
    regiao_antiga = (
        Regiao.objects.get(
            nome="PRESIDENTE FIGUEIREDO"
        )
    )

    total_pessoas = 0

    for (
        nome_antigo,
        destino
    ) in MAPEAMENTO.items():

        localidade_antiga = (
            Localidade.objects
            .filter(
                regiao=regiao_antiga,
                nome__iexact=nome_antigo,
            )
            .first()
        )

        if not localidade_antiga:
            print()
            print(
                "LOCALIDADE ANTIGA NÃO ENCONTRADA:",
                nome_antigo,
            )
            print(
                "Localidades disponíveis:",
                list(
                    regiao_antiga
                    .localidades
                    .values_list(
                        "nome",
                        flat=True,
                    )
                ),
            )
            continue

        regiao_nova = (
            Regiao.objects.get(
                nome=destino[
                    "regiao"
                ]
            )
        )

        localidade_nova = (
            Localidade.objects
            .filter(
                regiao=regiao_nova,
                nome__iexact=(
                    destino[
                        "localidade"
                    ]
                ),
            )
            .first()
        )

        if not localidade_nova:
            print()
            print(
                "LOCALIDADE NOVA NÃO ENCONTRADA:",
                destino[
                    "localidade"
                ],
                "| Região:",
                regiao_nova.nome,
            )

            print(
                "Localidades disponíveis:",
                list(
                    regiao_nova
                    .localidades
                    .values_list(
                        "nome",
                        flat=True,
                    )
                ),
            )
            continue

    

        print()
        print(
            "Migrando:",
            localidade_antiga.nome,
            "->",
            localidade_nova.nome,
        )

        ruas_novas = list(
            localidade_nova
            .ruas
            .all()
        )

        for rua_antiga in list(
            localidade_antiga
            .ruas
            .all()
        ):
            rua_equivalente = None

            nome_antigo_normalizado = (
                normalizar(
                    rua_antiga.nome
                )
            )

            for rua_nova in ruas_novas:
                if (
                    normalizar(
                        rua_nova.nome
                    )
                    ==
                    nome_antigo_normalizado
                ):
                    rua_equivalente = (
                        rua_nova
                    )

                    break

            pessoas_da_rua = (
                Pessoa.objects
                .filter(
                    rua=rua_antiga
                )
            )

            if rua_equivalente:
                print(
                    "  Rua existente:",
                    rua_antiga.nome,
                    "->",
                    rua_equivalente.nome,
                )

                pessoas_da_rua.update(
                    rua=rua_equivalente,
                    localidade=(
                        localidade_nova
                    ),
                    regiao=regiao_nova,
                )

            else:
                print(
                    "  Movendo rua:",
                    rua_antiga.nome,
                    "para",
                    localidade_nova.nome,
                )

                rua_antiga.localidade = (
                    localidade_nova
                )

                rua_antiga.save(
                    update_fields=[
                        "localidade",
                    ]
                )

                pessoas_da_rua.update(
                    localidade=(
                        localidade_nova
                    ),
                    regiao=regiao_nova,
                )

                ruas_novas.append(
                    rua_antiga
                )

        pessoas_restantes = (
            Pessoa.objects
            .filter(
                localidade=(
                    localidade_antiga
                )
            )
        )

        quantidade = (
            pessoas_restantes.count()
        )

        if quantidade:
            pessoas_restantes.update(
                localidade=localidade_nova,
                regiao=regiao_nova,
            )

        total_pessoas += (
            quantidade
        )

        if (
            not Pessoa.objects
            .filter(
                localidade=(
                    localidade_antiga
                )
            )
            .exists()
            and
            not localidade_antiga
            .ruas
            .exists()
        ):
            localidade_antiga.delete()

            print(
                "  Localidade antiga removida."
            )

    pessoas_regiao_antiga = (
        Pessoa.objects
        .filter(
            regiao=regiao_antiga
        )
    )

    if (
        pessoas_regiao_antiga.exists()
    ):
        print()
        print(
            "ATENÇÃO:",
            pessoas_regiao_antiga.count(),
            "pessoa(s) ainda estão na região antiga."
        )

        for pessoa in (
            pessoas_regiao_antiga
        ):
            print(
                pessoa.id,
                pessoa.nome_completo,
                pessoa.localidade,
                pessoa.rua,
            )

        raise RuntimeError(
            "Ainda existem pessoas "
            "na região antiga."
        )

    if (
        not regiao_antiga
        .localidades
        .exists()
    ):
        regiao_antiga.delete()

        print()
        print(
            "Região PRESIDENTE FIGUEIREDO removida."
        )

    else:
        print()
        print(
            "A região antiga ainda possui "
            "localidades e não foi removida."
        )

    print()
    print(
        "Migração concluída."
    )


migrar()