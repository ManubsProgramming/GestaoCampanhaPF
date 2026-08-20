import re

import requests
from bs4 import BeautifulSoup

from django.core.management.base import (
    BaseCommand,
)
from django.db import transaction

from regioes.models import (
    Localidade,
    Regiao,
    Rua,
)


URL_LOGRADOUROS = (
    "https://www.presidentefigueiredo.am.gov.br/ceps/"
)


BAIRROS_URBANOS = [
    "Aida Mendonça",
    "Galo da Serra",
    "Morada do Sol",
    "Honório Roldão",
    "Centro",
    "Tancredo Neves",
    "José Dutra",
    "Sol Nascente",
    "Orquídeas",
    "Vale das Nascentes",
    "Galo da Serra II",
]


COMUNIDADES_RURAIS = [
    "Urubuí I",
    "Urubuí II",
    "Boa União",
    "Micad",
    "Jardim Floresta",
    "Rumo Certo",
    "Nova Jerusalém",
    "Boa Esperança",
    "Santo Antonio do Abonari",
    "Cristo Rei",
    "São Jose do Uatumã",
    "São Miguel",
    "São Francisco",
    "Nova União",
    "Marcos Freire",
    "Maruaga",
    "Condomínio Bosque das Águas",
    "Urubuí",
    "Área Rural de Presidente Figueiredo",
]


DISTRITOS = [
    "Balbina",
    "Pitinga",
]


# Nomes que aparecem de forma diferente
# na tabela oficial de logradouros.
ALIASES = {
    "aida mendoca":
        "Aida Mendonça",

    "aida mendonca":
        "Aida Mendonça",

    "jose dutra":
        "José Dutra",

    "jose dutra mutirao":
        "José Dutra",

    "comunidade maruaga":
        "Maruaga",

    "vila balbina":
        "Balbina",
}


def normalizar(texto):
    """
    Normalização simples para comparar
    nomes vindos da página da Prefeitura.
    """

    texto = str(
        texto or ""
    ).strip().lower()

    substituicoes = {
        "á": "a",
        "à": "a",
        "ã": "a",
        "â": "a",
        "é": "e",
        "ê": "e",
        "í": "i",
        "ó": "o",
        "ô": "o",
        "õ": "o",
        "ú": "u",
        "ç": "c",
    }

    for antigo, novo in (
        substituicoes.items()
    ):
        texto = texto.replace(
            antigo,
            novo,
        )

    texto = re.sub(
        r"\s+",
        " ",
        texto,
    )

    return texto.strip()


class Command(BaseCommand):

    help = (
        "Importa regiões, localidades e "
        "logradouros oficiais de "
        "Presidente Figueiredo."
    )

    @transaction.atomic
    def handle(
        self,
        *args,
        **options,
    ):
        self.stdout.write(
            "Iniciando importação..."
        )

        # =========================
        # REGIÕES
        # =========================

        zona_urbana, _ = (
            Regiao.objects
            .get_or_create(
                nome="Zona Urbana",
                defaults={
                    "ativa": True,
                },
            )
        )

        zona_rural, _ = (
            Regiao.objects
            .get_or_create(
                nome="Zona Rural",
                defaults={
                    "ativa": True,
                },
            )
        )

        regiao_distritos, _ = (
            Regiao.objects
            .get_or_create(
                nome="Distritos",
                defaults={
                    "ativa": True,
                },
            )
        )

        # =========================
        # BAIRROS
        # =========================

        localidades = {}

        for nome in BAIRROS_URBANOS:

            localidade, criada = (
                Localidade.objects
                .get_or_create(
                    regiao=zona_urbana,
                    nome=nome,
                    tipo=(
                        Localidade
                        .Tipo
                        .BAIRRO
                    ),
                    defaults={
                        "ativa": True,
                    },
                )
            )

            localidades[
                normalizar(nome)
            ] = localidade

            if criada:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Bairro criado: {nome}"
                    )
                )

        # =========================
        # COMUNIDADES
        # =========================

        for nome in COMUNIDADES_RURAIS:

            localidade, criada = (
                Localidade.objects
                .get_or_create(
                    regiao=zona_rural,
                    nome=nome,
                    tipo=(
                        Localidade
                        .Tipo
                        .COMUNIDADE
                    ),
                    defaults={
                        "ativa": True,
                    },
                )
            )

            localidades[
                normalizar(nome)
            ] = localidade

            if criada:
                self.stdout.write(
                    self.style.SUCCESS(
                        "Comunidade criada: "
                        f"{nome}"
                    )
                )

        # =========================
        # DISTRITOS
        # =========================

        for nome in DISTRITOS:

            localidade, criada = (
                Localidade.objects
                .get_or_create(
                    regiao=regiao_distritos,
                    nome=nome,
                    tipo=(
                        Localidade
                        .Tipo
                        .DISTRITO
                    ),
                    defaults={
                        "ativa": True,
                    },
                )
            )

            localidades[
                normalizar(nome)
            ] = localidade

            if criada:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Distrito criado: {nome}"
                    )
                )

        # =========================
        # ALIASES
        # =========================

        for apelido, nome_real in (
            ALIASES.items()
        ):

            chave_real = normalizar(
                nome_real
            )

            localidade = localidades.get(
                chave_real
            )

            if localidade:
                localidades[
                    normalizar(apelido)
                ] = localidade

        # =========================
        # LOGRADOUROS
        # =========================

        self.stdout.write(
            "Consultando relação oficial "
            "de logradouros..."
        )

        try:
            response = requests.get(
                URL_LOGRADOUROS,
                timeout=30,
                headers={
                    "User-Agent": (
                        "GestaoCampanhaPF/1.0"
                    )
                },
            )

            response.raise_for_status()

        except requests.RequestException as erro:

            self.stderr.write(
                self.style.ERROR(
                    "Não foi possível consultar "
                    "a página da Prefeitura: "
                    f"{erro}"
                )
            )

            return

        soup = BeautifulSoup(
            response.text,
            "html.parser",
        )

        tabela = soup.find("table")

        if not tabela:

            self.stderr.write(
                self.style.ERROR(
                    "A tabela de logradouros "
                    "não foi encontrada."
                )
            )

            return

        ruas_criadas = 0
        ruas_existentes = 0
        ignoradas = []

        linhas = tabela.find_all("tr")

        for linha in linhas[1:]:

            colunas = linha.find_all(
                [
                    "td",
                    "th",
                ]
            )

            if len(colunas) < 3:
                continue

            logradouro = (
                colunas[0]
                .get_text(
                    " ",
                    strip=True,
                )
            )

            bairro_original = (
                colunas[2]
                .get_text(
                    " ",
                    strip=True,
                )
            )

            if not logradouro:
                continue

            chave_bairro = normalizar(
                bairro_original
            )

            nome_alias = ALIASES.get(
                chave_bairro
            )

            if nome_alias:
                chave_bairro = normalizar(
                    nome_alias
                )

            localidade = localidades.get(
                chave_bairro
            )

            # Não inventamos uma associação.
            # Se o bairro da tabela não estiver
            # mapeado, apenas registramos para
            # revisão manual.
            if not localidade:

                ignoradas.append(
                    (
                        logradouro,
                        bairro_original,
                    )
                )

                continue

            rua, criada = (
                Rua.objects
                .get_or_create(
                    localidade=localidade,
                    nome=logradouro,
                    defaults={
                        "ativa": True,
                    },
                )
            )

            if criada:
                ruas_criadas += 1
            else:
                ruas_existentes += 1

        # =========================
        # RESULTADO
        # =========================

        self.stdout.write("")

        self.stdout.write(
            self.style.SUCCESS(
                "Importação concluída."
            )
        )

        self.stdout.write(
            f"Ruas criadas: "
            f"{ruas_criadas}"
        )

        self.stdout.write(
            f"Ruas que já existiam: "
            f"{ruas_existentes}"
        )

        if ignoradas:

            self.stdout.write("")

            self.stdout.write(
                self.style.WARNING(
                    "Logradouros não importados "
                    "porque a localidade precisa "
                    "ser conferida:"
                )
            )

            bairros_ignorados = sorted(
                {
                    bairro
                    for _, bairro
                    in ignoradas
                }
            )

            for bairro in (
                bairros_ignorados
            ):
                self.stdout.write(
                    f"  - {bairro}"
                ) 