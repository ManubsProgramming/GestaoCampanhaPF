from pessoas.models import Pessoa


def filtrar_pessoas(request):
    pessoas = Pessoa.objects.select_related(
        "regiao",
        "localidade",
        "rua",
        "cadastrada_por",
    ).all()

    data_inicio = request.query_params.get("data_inicio")
    data_fim = request.query_params.get("data_fim")
    regiao = request.query_params.get("regiao")
    localidade = request.query_params.get("localidade")
    rua = request.query_params.get("rua")
    cadastrada_por = request.query_params.get("cadastrada_por")

    if data_inicio:
        pessoas = pessoas.filter(
            criado_em__date__gte=data_inicio
        )

    if data_fim:
        pessoas = pessoas.filter(
            criado_em__date__lte=data_fim
        )

    if regiao:
        pessoas = pessoas.filter(
            regiao_id=regiao
        )

    if localidade:
        pessoas = pessoas.filter(
            localidade_id=localidade
        )

    if rua:
        pessoas = pessoas.filter(
            rua_id=rua
        )

    if cadastrada_por:
        pessoas = pessoas.filter(
            cadastrada_por_id=cadastrada_por
        )

    return pessoas