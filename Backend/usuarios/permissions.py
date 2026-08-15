from rest_framework.permissions import BasePermission


class EhAdministrador(BasePermission):
    message = "Apenas administradores podem realizar esta ação."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.tipo == "ADMINISTRADOR"
        )


class EhAdministradorOuSomenteLeitura(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True

        return request.user.tipo == "ADMINISTRADOR"