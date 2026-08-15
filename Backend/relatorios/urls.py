from django.urls import path

from .views import RelatorioCadastrosView
from .views_excel import ExportarExcelView
from .views_pdf import ExportarPDFView


urlpatterns = [
    path(
        "cadastros/",
        RelatorioCadastrosView.as_view(),
        name="relatorio-cadastros",
    ),

    path(
        "exportar/excel/",
        ExportarExcelView.as_view(),
        name="exportar-excel",
    ),

    path(
        "exportar/pdf/",
        ExportarPDFView.as_view(),
        name="exportar-pdf",
    ),
]