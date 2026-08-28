from django.db.models import Count

from rest_framework.response import Response
from rest_framework.views import APIView

from usuarios.permissions import EhAdministrador

from .services import filtrar_pessoas


class RelatorioCadastrosView(APIView):
    permission_classes = [EhAdministrador]

    def get(self, request):
        pessoas = filtrar_pessoas(request)

        data_inicio = request.query_params.get("data_inicio")
        data_fim = request.query_params.get("data_fim")
        regiao = request.query_params.get("regiao")
        localidade = request.query_params.get("localidade")
        rua = request.query_params.get("rua")
        cadastrada_por = request.query_params.get("cadastrada_por")

        total_pessoas = pessoas.count()

        por_regiao = (
            pessoas
            .values(
                "regiao_id",
                "regiao__nome",
            )
            .annotate(
                total=Count("id")
            )
            .order_by("-total")
        )

        por_localidade = (
            pessoas
            .values(
                "localidade_id",
                "localidade__nome",
                "localidade__tipo",
            )
            .annotate(
                total=Count("id")
            )
            .order_by("-total")
        )

        por_rua = (
            pessoas
            .values(
                "rua_id",
                "rua__nome",
                "localidade__nome",
            )
            .annotate(
                total=Count("id")
            )
            .order_by("-total")
        )

        por_usuario = (
            pessoas
            .values(
                "cadastrada_por_id",
                "cadastrada_por__username",
                "cadastrada_por__first_name",
                "cadastrada_por__last_name",
            )
            .annotate(
                total=Count("id")
            )
            .order_by("-total")
        )
        por_municipio_eleitoral = (
            pessoas
            .exclude(municipio_eleitoral="")
            .values(
                 "municipio_eleitoral"
            )
            .annotate(
             total=Count("id")
            )
            .order_by("-total")
        )

        por_zona_eleitoral = (
           pessoas
           .exclude(zona_eleitoral="")
           .values(
            "zona_eleitoral"
           )
           .annotate(
            total=Count("id")
           )
           .order_by("-total")
        )

        por_secao_eleitoral = (
           pessoas
           .exclude(secao_eleitoral="")
           .values(
            "secao_eleitoral"
           )
            .annotate(
             total=Count("id")
            )
            .order_by("-total")
        )

        dados = {
            "filtros": {
                "data_inicio": data_inicio,
                "data_fim": data_fim,
                "regiao": regiao,
                "localidade": localidade,
                "rua": rua,
                "cadastrada_por": cadastrada_por,
            },

            "resumo": {
                "total_pessoas_cadastradas": total_pessoas,
            },

            "cadastros_por_regiao": list(
                por_regiao
            ),

            "cadastros_por_localidade": list(
                por_localidade
            ),

            "cadastros_por_rua": list(
                por_rua
            ),

            "pessoas_cadastradas_por_usuario": list(
                por_usuario
            ),
            "cadastros_por_municipio_eleitoral": list(
             por_municipio_eleitoral
            ),

             "cadastros_por_zona_eleitoral": list(
              por_zona_eleitoral
            ),

              "cadastros_por_secao_eleitoral": list(
               por_secao_eleitoral
            ),
        }

        return Response(dados)