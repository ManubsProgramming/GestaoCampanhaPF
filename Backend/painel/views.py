from django.contrib.auth import get_user_model
from django.db.models import Count
from django.utils import timezone

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from pessoas.models import Pessoa
from regioes.models import Localidade, Rua


Usuario = get_user_model()


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Somente pessoas efetivamente cadastradas no sistema
        pessoas = Pessoa.objects.all()

        # ---------------------------------
        # CARDS PRINCIPAIS
        # ---------------------------------

        total_pessoas = pessoas.count()

        hoje = timezone.localdate()

        cadastros_hoje = pessoas.filter(
            criado_em__date=hoje
        ).count()

        total_cadastradores = Usuario.objects.filter(
            tipo="CADASTRADOR",
            ativo=True,
        ).count()

        total_localidades = (
            Localidade.objects
            .filter(
                pessoas__isnull=False
            )
            .distinct()
            .count()
        )

        total_ruas = (
            Rua.objects
            .filter(
                pessoas__isnull=False
            )
            .distinct()
            .count()
        )

        # ---------------------------------
        # REFERÊNCIA OFICIAL DO MUNICÍPIO
        # ---------------------------------

        populacao_estimada_municipio = 33291

        if populacao_estimada_municipio > 0:
            percentual_cobertura = round(
                (
                    total_pessoas
                    / populacao_estimada_municipio
                ) * 100,
                2,
            )
        else:
            percentual_cobertura = 0

        # ---------------------------------
        # CADASTROS POR LOCALIDADE
        # ---------------------------------

        cadastros_por_localidade = (
            Localidade.objects
            .annotate(
                total=Count("pessoas")
            )
            .filter(
                total__gt=0
            )
            .values(
                "id",
                "nome",
                "tipo",
                "total",
            )
            .order_by(
                "-total"
            )
        )

        # ---------------------------------
        # CADASTROS POR RUA
        # ---------------------------------

        cadastros_por_rua = (
            Rua.objects
            .annotate(
                total=Count("pessoas")
            )
            .filter(
                total__gt=0
            )
            .values(
                "id",
                "nome",
                "localidade__nome",
                "total",
            )
            .order_by(
                "-total"
            )[:10]
        )

        # ---------------------------------
        # RANKING DE CADASTRADORES
        # ---------------------------------

        ranking_usuarios = (
            Usuario.objects
            .filter(
                tipo="CADASTRADOR"
            )
            .annotate(
                total_cadastros=Count(
                    "pessoas_cadastradas"
                )
            )
            .filter(
                total_cadastros__gt=0
            )
            .values(
                "id",
                "username",
                "first_name",
                "last_name",
                "total_cadastros",
            )
            .order_by(
                "-total_cadastros"
            )[:10]
        )

        # ---------------------------------
        # RESPOSTA
        # ---------------------------------

        dados = {
            "resumo": {
                "total_pessoas_cadastradas": total_pessoas,
                "cadastros_hoje": cadastros_hoje,
                "total_usuarios_cadastradores": total_cadastradores,
                "total_localidades_com_cadastros": total_localidades,
                "total_ruas_com_cadastros": total_ruas,
            },

            "referencia_municipio": {
                "municipio": "Presidente Figueiredo",
                "populacao_estimada": populacao_estimada_municipio,
                "ano_referencia": 2025,
                "fonte": "IBGE",
                "percentual_cobertura_cadastros": percentual_cobertura,
                "observacao": (
                    "Indicador comparativo entre pessoas cadastradas "
                    "no sistema e a estimativa oficial do município. "
                    "Não representa população de bairros, comunidades "
                    "ou ruas."
                ),
            },

            "cadastros_por_localidade": list(
                cadastros_por_localidade
            ),

            "cadastros_por_rua": list(
                cadastros_por_rua
            ),

            "quem_mais_cadastrou": list(
                ranking_usuarios
            ),
        }

        return Response(dados)