from django.contrib.auth import get_user_model
from django.db.models import Count
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

        # Cards principais
        total_pessoas = pessoas.count()

        total_cadastradores = Usuario.objects.filter(
            tipo="CADASTRADOR",
            ativo=True,
        ).count()

        total_localidades = Localidade.objects.filter(
            pessoas__isnull=False
        ).distinct().count()

        total_ruas = Rua.objects.filter(
            pessoas__isnull=False
        ).distinct().count()

        # Cadastros por localidade
        cadastros_por_localidade = (
            Localidade.objects
            .annotate(total=Count("pessoas"))
            .filter(total__gt=0)
            .values(
                "id",
                "nome",
                "tipo",
                "total",
            )
            .order_by("-total")
        )

        # Cadastros por rua
        cadastros_por_rua = (
            Rua.objects
            .annotate(total=Count("pessoas"))
            .filter(total__gt=0)
            .values(
                "id",
                "nome",
                "localidade__nome",
                "total",
            )
            .order_by("-total")[:10]
        )

        # Ranking de cadastradores
        ranking_usuarios = (
            Usuario.objects
            .filter(tipo="CADASTRADOR")
            .annotate(
                total_cadastros=Count("pessoas_cadastradas")
            )
            .filter(total_cadastros__gt=0)
            .values(
                "id",
                "username",
                "first_name",
                "last_name",
                "total_cadastros",
            )
            .order_by("-total_cadastros")[:10]
        )

        dados = {
            "resumo": {
                "total_pessoas_cadastradas": total_pessoas,
                "total_usuarios_cadastradores": total_cadastradores,
                "total_localidades_com_cadastros": total_localidades,
                "total_ruas_com_cadastros": total_ruas,
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