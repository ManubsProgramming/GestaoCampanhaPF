from io import BytesIO

from django.conf import settings
from django.http import HttpResponse
from django.utils import timezone

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    ParagraphStyle,
    getSampleStyleSheet,
)
from reportlab.lib.units import cm
from reportlab.platypus import (
    Image,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from rest_framework.views import APIView

from usuarios.permissions import EhAdministrador

from .services import filtrar_pessoas


class ExportarPDFView(APIView):
    permission_classes = [EhAdministrador]

    def get(self, request):
        pessoas = filtrar_pessoas(request)

        buffer = BytesIO()

        documento = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=1.5 * cm,
            leftMargin=1.5 * cm,
            topMargin=1.2 * cm,
            bottomMargin=1.5 * cm,
        )

        elementos = []
        estilos = getSampleStyleSheet()

        estilo_titulo = ParagraphStyle(
            "Titulo",
            parent=estilos["Title"],
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=18,
            alignment=TA_CENTER,
            spaceAfter=4,
        )

        estilo_subtitulo = ParagraphStyle(
            "Subtitulo",
            parent=estilos["Normal"],
            fontName="Helvetica",
            fontSize=9,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#666666"),
            spaceAfter=10,
        )

        estilo_secao = ParagraphStyle(
            "Secao",
            parent=estilos["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=11,
        )

        estilo_texto = ParagraphStyle(
            "Texto",
            parent=estilos["Normal"],
            fontName="Helvetica",
            fontSize=8,
            leading=11,
        )

        estilo_rodape = ParagraphStyle(
            "Rodape",
            parent=estilos["Normal"],
            fontName="Helvetica",
            fontSize=7,
            textColor=colors.HexColor("#777777"),
            alignment=TA_RIGHT,
        )

        # --------------------------------------------------
        # LOGO
        # --------------------------------------------------

        caminho_logo = (
            settings.BASE_DIR
            / "static"
            / "imagens"
            / "logo.png"
        )

        if caminho_logo.exists():
            logo = Image(str(caminho_logo))

            logo.drawHeight = 5.5* cm
            logo.drawWidth = 4.8 * cm
            logo.hAlign = "CENTER"

            elementos.append(logo)
            elementos.append(
                Spacer(1, 0.15 * cm)
            )

        # --------------------------------------------------
        # CABEÇALHO
        # --------------------------------------------------

        elementos.append(
            Paragraph(
                "GESTÃO DE CADASTROS",
                estilo_titulo,
            )
        )

        elementos.append(
            Paragraph(
                "Relatório de Pessoas Cadastradas",
                estilo_subtitulo,
            )
        )

        # --------------------------------------------------
        # RESUMO
        # --------------------------------------------------

        elementos.append(
            self.criar_titulo_secao(
                "I. RESUMO DO RELATÓRIO",
                estilo_secao,
            )
        )

        resumo = [
            [
                Paragraph(
                    "<b>Total de pessoas cadastradas</b>",
                    estilo_texto,
                ),
                Paragraph(
                    str(pessoas.count()),
                    estilo_texto,
                ),
            ],
        ]

        data_inicio = request.query_params.get(
            "data_inicio"
        )
        data_fim = request.query_params.get(
            "data_fim"
        )

        if data_inicio or data_fim:
            periodo = (
                f"{data_inicio or 'Início'} "
                f"até "
                f"{data_fim or 'Hoje'}"
            )
        else:
            periodo = "Todos os períodos"

        resumo.append(
            [
                Paragraph(
                    "<b>Período</b>",
                    estilo_texto,
                ),
                Paragraph(
                    periodo,
                    estilo_texto,
                ),
            ]
        )

        regiao = request.query_params.get("regiao")
        localidade = request.query_params.get(
            "localidade"
        )
        rua = request.query_params.get("rua")
        cadastrador = request.query_params.get(
            "cadastrada_por"
        )

        if regiao:
            resumo.append(
                [
                    Paragraph(
                        "<b>Região ID</b>",
                        estilo_texto,
                    ),
                    Paragraph(
                        str(regiao),
                        estilo_texto,
                    ),
                ]
            )

        if localidade:
            resumo.append(
                [
                    Paragraph(
                        "<b>Localidade ID</b>",
                        estilo_texto,
                    ),
                    Paragraph(
                        str(localidade),
                        estilo_texto,
                    ),
                ]
            )

        if rua:
            resumo.append(
                [
                    Paragraph(
                        "<b>Rua ID</b>",
                        estilo_texto,
                    ),
                    Paragraph(
                        str(rua),
                        estilo_texto,
                    ),
                ]
            )

        if cadastrador:
            resumo.append(
                [
                    Paragraph(
                        "<b>Cadastrador ID</b>",
                        estilo_texto,
                    ),
                    Paragraph(
                        str(cadastrador),
                        estilo_texto,
                    ),
                ]
            )

        tabela_resumo = Table(
            resumo,
            colWidths=[
                6 * cm,
                12 * cm,
            ],
        )

        tabela_resumo.setStyle(
            TableStyle(
                [
                    (
                        "BOX",
                        (0, 0),
                        (-1, -1),
                        0.7,
                        colors.HexColor("#999999"),
                    ),
                    (
                        "INNERGRID",
                        (0, 0),
                        (-1, -1),
                        0.3,
                        colors.HexColor("#BBBBBB"),
                    ),
                    (
                        "BACKGROUND",
                        (0, 0),
                        (0, -1),
                        colors.HexColor("#F3F3F3"),
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "MIDDLE",
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                ]
            )
        )

        elementos.append(tabela_resumo)
        elementos.append(
            Spacer(1, 0.4 * cm)
        )

        # --------------------------------------------------
        # PESSOAS CADASTRADAS
        # --------------------------------------------------

        elementos.append(
            self.criar_titulo_secao(
                "II. PESSOAS CADASTRADAS",
                estilo_secao,
            )
        )

        elementos.append(
            Spacer(1, 0.15 * cm)
        )

        for indice, pessoa in enumerate(
            pessoas,
            start=1,
        ):
            nome_cadastrador = (
                pessoa.cadastrada_por.get_full_name()
                or pessoa.cadastrada_por.username
            )

            nascimento = ""

            if pessoa.data_nascimento:
                nascimento = (
                    pessoa.data_nascimento.strftime(
                        "%d/%m/%Y"
                    )
                )

            dados_pessoa = [
                [
                    Paragraph(
                        f"<b>{indice}. Nome completo</b>",
                        estilo_texto,
                    ),
                    Paragraph(
                        pessoa.nome_completo or "",
                        estilo_texto,
                    ),
                ],
                [
                    Paragraph(
                        "<b>CPF</b>",
                        estilo_texto,
                    ),
                    Paragraph(
                        pessoa.cpf or "",
                        estilo_texto,
                    ),
                ],
                [
                    Paragraph(
                        "<b>Data de nascimento</b>",
                        estilo_texto,
                    ),
                    Paragraph(
                        nascimento,
                        estilo_texto,
                    ),
                ],
                
                [
                    Paragraph(
                        "<b>Telefone</b>",
                        estilo_texto,
                    ),
                    Paragraph(
                        pessoa.telefone or "",
                        estilo_texto,
                    ),
                ],
                [
                    Paragraph(
                        "<b>Região</b>",
                        estilo_texto,
                    ),
                    Paragraph(
                        pessoa.regiao.nome or "",
                        estilo_texto,
                    ),
                ],
                [
                    Paragraph(
                        "<b>Localidade</b>",
                        estilo_texto,
                    ),
                    Paragraph(
                        (
                            f"{pessoa.localidade.nome} "
                            f"("
                            f"{pessoa.localidade.get_tipo_display()}"
                            f")"
                        ),
                        estilo_texto,
                    ),
                ],
                [
                    Paragraph(
                        "<b>Rua</b>",
                        estilo_texto,
                    ),
                    Paragraph(
                        pessoa.rua.nome or "",
                        estilo_texto,
                    ),
                ],
                [
                    Paragraph(
                        "<b>Número</b>",
                        estilo_texto,
                    ),
                    Paragraph(
                        pessoa.numero or "",
                        estilo_texto,
                    ),
                ],
                [
                    Paragraph(
                        "<b>Complemento</b>",
                        estilo_texto,
                    ),
                    Paragraph(
                        pessoa.complemento or "",
                        estilo_texto,
                    ),
                ],
                [
                    Paragraph(
                        "<b>Cadastrado por</b>",
                        estilo_texto,
                    ),
                    Paragraph(
                        nome_cadastrador,
                        estilo_texto,
                    ),
                ],
                [
                    Paragraph(
                        "<b>Status</b>",
                        estilo_texto,
                    ),
                    Paragraph(
                        pessoa.get_status_display(),
                        estilo_texto,
                    ),
                ],
                [
                    Paragraph(
                        "<b>Data do cadastro</b>",
                        estilo_texto,
                    ),
                    Paragraph(
                        pessoa.criado_em.strftime(
                            "%d/%m/%Y %H:%M"
                        ),
                        estilo_texto,
                    ),
                ],
            ]

            tabela_pessoa = Table(
                dados_pessoa,
                colWidths=[
                    5 * cm,
                    13 * cm,
                ],
            )

            tabela_pessoa.setStyle(
                TableStyle(
                    [
                        (
                            "BOX",
                            (0, 0),
                            (-1, -1),
                            0.7,
                            colors.HexColor("#8A8A8A"),
                        ),
                        (
                            "INNERGRID",
                            (0, 0),
                            (-1, -1),
                            0.3,
                            colors.HexColor("#C0C0C0"),
                        ),
                        (
                            "BACKGROUND",
                            (0, 0),
                            (0, -1),
                            colors.HexColor("#F4F4F4"),
                        ),
                        (
                            "VALIGN",
                            (0, 0),
                            (-1, -1),
                            "MIDDLE",
                        ),
                        (
                            "TOPPADDING",
                            (0, 0),
                            (-1, -1),
                            4,
                        ),
                        (
                            "BOTTOMPADDING",
                            (0, 0),
                            (-1, -1),
                            4,
                        ),
                        (
                            "LEFTPADDING",
                            (0, 0),
                            (-1, -1),
                            5,
                        ),
                        (
                            "RIGHTPADDING",
                            (0, 0),
                            (-1, -1),
                            5,
                        ),
                    ]
                )
            )

            bloco_pessoa = KeepTogether(
                [
                    tabela_pessoa,
                    Spacer(1, 0.25 * cm),
                ]
            )

            elementos.append(bloco_pessoa)

        # --------------------------------------------------
        # RODAPÉ FINAL
        # --------------------------------------------------

        gerado_em = timezone.localtime().strftime(
            "%d/%m/%Y %H:%M"
        )

        elementos.append(
            Spacer(1, 0.3 * cm)
        )

        elementos.append(
            Paragraph(
                f"Relatório gerado em {gerado_em}",
                estilo_rodape,
            )
        )

        documento.build(elementos)

        buffer.seek(0)

        response = HttpResponse(
            buffer.getvalue(),
            content_type="application/pdf",
        )

        response["Content-Disposition"] = (
            'attachment; '
            'filename="relatorio_pessoas_cadastradas.pdf"'
        )

        return response

    def criar_titulo_secao(
        self,
        texto,
        estilo,
    ):
        tabela = Table(
            [
                [
                    Paragraph(
                        texto,
                        estilo,
                    )
                ]
            ],
            colWidths=[
                18 * cm
            ],
        )

        tabela.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, -1),
                        colors.HexColor("#E6E6E6"),
                    ),
                    (
                        "BOX",
                        (0, 0),
                        (-1, -1),
                        0.7,
                        colors.HexColor("#777777"),
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        6,
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                ]
            )
        )

        return tabela