from .models import RegistroAuditoria


def obter_ip(request):
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")

    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    return request.META.get("REMOTE_ADDR")


def registrar_auditoria(
    request,
    acao,
    entidade,
    entidade_id=None,
    descricao="",
    dados_extras=None,
):
    usuario = None

    if request.user and request.user.is_authenticated:
        usuario = request.user

    RegistroAuditoria.objects.create(
        usuario=usuario,
        acao=acao,
        entidade=entidade,
        entidade_id=entidade_id,
        descricao=descricao,
        endereco_ip=obter_ip(request),
        dados_extras=dados_extras or {},
    )