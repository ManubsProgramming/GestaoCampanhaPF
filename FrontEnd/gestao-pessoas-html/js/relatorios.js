const reportPeriod =
  document.querySelector("#report-period")

const reportStartDate =
  document.querySelector("#report-start-date")

const reportEndDate =
  document.querySelector("#report-end-date")

const startDateField =
  document.querySelector("#start-date-field")

const endDateField =
  document.querySelector("#end-date-field")

const reportRegion =
  document.querySelector("#report-region")

const reportNeighborhood =
  document.querySelector("#report-neighborhood")

const reportStreet =
  document.querySelector("#report-street")

const reportUser =
  document.querySelector("#report-user")

const reportSearchInput =
  document.querySelector("#report-search-input")


const reportTableBody =
  document.querySelector("#report-table-body")

const reportVisibleTotal =
  document.querySelector("#report-visible-total")

const reportEmptyState =
  document.querySelector("#report-empty-state")


const reportTotal =
  document.querySelector("#report-total")

const reportNeighborhoodTotal =
  document.querySelector(
    "#report-neighborhood-total"
  )

const reportStreetTotal =
  document.querySelector(
    "#report-street-total"
  )

const reportUserTotal =
  document.querySelector(
    "#report-user-total"
  )


const localityChart =
  document.querySelector(
    "#report-locality-chart"
  )

const userChart =
  document.querySelector(
    "#report-user-chart"
  )


const clearReportFilters =
  document.querySelector(
    "#clear-report-filters"
  )

const exportExcelButton =
  document.querySelector("#export-excel")

const exportPdfButton =
  document.querySelector("#export-pdf")


const sidebar =
  document.querySelector("#sidebar")

const menuOverlay =
  document.querySelector("#menu-overlay")

const openMenuButton =
  document.querySelector("#open-menu")

const closeMenuButton =
  document.querySelector("#close-menu")

const loggedUser =
  document.querySelector("#logged-user")


let regioes = []
let localidades = []
let ruas = []
let usuarios = []

let pessoas = []
let relatorio = null

let usuarioAtual = null


/* =========================================
   AUXILIARES
========================================= */

function obterLista(dados) {
  if (Array.isArray(dados)) {
    return dados
  }

  return dados?.results || []
}


function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
}


function escaparHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}


function formatarDataISO(data) {
  const ano =
    data.getFullYear()

  const mes =
    String(
      data.getMonth() + 1
    ).padStart(2, "0")

  const dia =
    String(
      data.getDate()
    ).padStart(2, "0")

  return `${ano}-${mes}-${dia}`
}


function formatarData(data) {
  if (!data) {
    return "-"
  }

  return new Date(data)
    .toLocaleDateString(
      "pt-BR"
    )
}


function obterNomeUsuario(usuario) {
  return (
    usuario?.nome_completo ||
    [
      usuario?.first_name,
      usuario?.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    usuario?.username ||
    "Usuário"
  )
}


function obterIniciais(nome) {
  const partes =
    String(nome || "")
      .trim()
      .split(" ")
      .filter(Boolean)

  if (!partes.length) {
    return "AD"
  }

  if (partes.length === 1) {
    return partes[0]
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    partes[0][0] +
    partes[partes.length - 1][0]
  ).toUpperCase()
}


/* =========================================
   MENU
========================================= */

function abrirMenu() {
  sidebar?.classList.add("open")

  menuOverlay?.classList.add(
    "visible"
  )

  document.body.style.overflow =
    "hidden"
}


function fecharMenu() {
  sidebar?.classList.remove("open")

  menuOverlay?.classList.remove(
    "visible"
  )

  document.body.style.overflow =
    ""
}


openMenuButton?.addEventListener(
  "click",
  abrirMenu
)

closeMenuButton?.addEventListener(
  "click",
  fecharMenu
)

menuOverlay?.addEventListener(
  "click",
  fecharMenu
)


/* =========================================
   USUÁRIO LOGADO
========================================= */

function preencherUsuarioLogado(
  usuario
) {
  const nome =
    obterNomeUsuario(usuario)

  const iniciais =
    obterIniciais(nome)


  if (loggedUser) {
    loggedUser.textContent =
      nome
  }


  document
    .querySelectorAll(
      ".sidebar-user-info strong"
    )
    .forEach(function (elemento) {
      elemento.textContent =
        nome
    })


  document
    .querySelectorAll(
      ".user-avatar, .profile-avatar"
    )
    .forEach(function (elemento) {
      elemento.textContent =
        iniciais
    })
}


/* =========================================
   CARREGAR OPÇÕES
========================================= */

async function carregarOpcoes() {
  const [
    respostaRegioes,
    respostaLocalidades,
    respostaRuas,
    respostaUsuarios,
  ] = await Promise.all([
    apiFetch("/regioes/"),
    apiFetch("/localidades/"),
    apiFetch("/ruas/"),
    apiFetch("/usuarios/"),
  ])


  if (
    !respostaRegioes.ok ||
    !respostaLocalidades.ok ||
    !respostaRuas.ok ||
    !respostaUsuarios.ok
  ) {
    throw new Error(
      "Não foi possível carregar os filtros do relatório."
    )
  }


  regioes =
    obterLista(
      await respostaRegioes.json()
    )

  localidades =
    obterLista(
      await respostaLocalidades.json()
    )

  ruas =
    obterLista(
      await respostaRuas.json()
    )

  usuarios =
    obterLista(
      await respostaUsuarios.json()
    )


  preencherRegioes()
  preencherLocalidades()
  preencherRuas()
  preencherUsuarios()
}


/* =========================================
   SELECT REGIÕES
========================================= */

function preencherRegioes() {
  reportRegion.innerHTML = `
    <option value="">
      Todas as regiões
    </option>
  `


  regioes.forEach(
    function (regiao) {
      const option =
        document.createElement(
          "option"
        )

      option.value =
        regiao.id

      option.textContent =
        regiao.nome

      reportRegion.appendChild(
        option
      )
    }
  )
}


/* =========================================
   LOCALIDADES
========================================= */

function preencherLocalidades() {
  const regiaoId =
    reportRegion.value


  const lista =
    localidades.filter(
      function (localidade) {
        return (
          !regiaoId ||
          Number(
            localidade.regiao
          ) ===
          Number(regiaoId)
        )
      }
    )


  const valorAtual =
    reportNeighborhood.value


  reportNeighborhood.innerHTML = `
    <option value="">
      Todas as localidades
    </option>
  `


  lista.forEach(
    function (localidade) {
      const option =
        document.createElement(
          "option"
        )

      option.value =
        localidade.id

      option.textContent =
        `${
          localidade.nome
        } (${
          localidade.tipo_nome ||
          localidade.tipo
        })`

      reportNeighborhood
        .appendChild(option)
    }
  )


  const aindaExiste =
    lista.some(
      item =>
        String(item.id) ===
        String(valorAtual)
    )


  if (aindaExiste) {
    reportNeighborhood.value =
      valorAtual
  }
}


/* =========================================
   RUAS
========================================= */

function preencherRuas() {
  const localidadeId =
    reportNeighborhood.value

  const regiaoId =
    reportRegion.value


  let lista = ruas


  if (localidadeId) {
    lista =
      ruas.filter(
        rua =>
          Number(rua.localidade) ===
          Number(localidadeId)
      )

  } else if (regiaoId) {
    lista =
      ruas.filter(
        rua =>
          Number(rua.regiao_id) ===
          Number(regiaoId)
      )
  }


  const valorAtual =
    reportStreet.value


  reportStreet.innerHTML = `
    <option value="">
      Todas as ruas
    </option>
  `


  lista.forEach(
    function (rua) {
      const option =
        document.createElement(
          "option"
        )

      option.value =
        rua.id

      option.textContent =
        rua.nome

      reportStreet
        .appendChild(option)
    }
  )


  if (
    lista.some(
      item =>
        String(item.id) ===
        String(valorAtual)
    )
  ) {
    reportStreet.value =
      valorAtual
  }
}


/* =========================================
   USUÁRIOS
========================================= */

function preencherUsuarios() {
  reportUser.innerHTML = `
    <option value="">
      Todos os usuários
    </option>
  `


  usuarios
    .filter(
      function (usuario) {
        return (
          usuario.tipo ===
          "CADASTRADOR"
        )
      }
    )
    .forEach(
      function (usuario) {
        const option =
          document.createElement(
            "option"
          )

        option.value =
          usuario.id

        option.textContent =
          obterNomeUsuario(
            usuario
          )

        reportUser.appendChild(
          option
        )
      }
    )
}


/* =========================================
   PERÍODO
========================================= */

function obterDatasPeriodo() {
  const periodo =
    reportPeriod.value


  if (!periodo) {
    return {
      inicio: "",
      fim: "",
    }
  }


  if (
    periodo ===
    "personalizado"
  ) {
    return {
      inicio:
        reportStartDate.value,

      fim:
        reportEndDate.value,
    }
  }


  const hoje =
    new Date()

  const fim =
    formatarDataISO(hoje)


  if (periodo === "hoje") {
    return {
      inicio: fim,
      fim,
    }
  }


  if (periodo === "semana") {
    const inicio =
      new Date(hoje)

    inicio.setDate(
      hoje.getDate() -
      hoje.getDay()
    )

    return {
      inicio:
        formatarDataISO(
          inicio
        ),

      fim,
    }
  }


  if (periodo === "mes") {
    const inicio =
      new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        1
      )

    return {
      inicio:
        formatarDataISO(
          inicio
        ),

      fim,
    }
  }


  return {
    inicio: "",
    fim: "",
  }
}


/* =========================================
   PARÂMETROS
========================================= */

function montarParametros() {
  const params =
    new URLSearchParams()

  const datas =
    obterDatasPeriodo()


  if (datas.inicio) {
    params.set(
      "data_inicio",
      datas.inicio
    )
  }


  if (datas.fim) {
    params.set(
      "data_fim",
      datas.fim
    )
  }


  if (reportRegion.value) {
    params.set(
      "regiao",
      reportRegion.value
    )
  }


  if (
    reportNeighborhood.value
  ) {
    params.set(
      "localidade",
      reportNeighborhood.value
    )
  }


  if (reportStreet.value) {
    params.set(
      "rua",
      reportStreet.value
    )
  }


  if (reportUser.value) {
    params.set(
      "cadastrada_por",
      reportUser.value
    )
  }


  return params
}


/* =========================================
   CARREGAR RELATÓRIO
========================================= */

async function carregarRelatorio() {
  const params =
    montarParametros()

  const query =
    params.toString()


  const [
    respostaRelatorio,
    respostaPessoas,
  ] = await Promise.all([
    apiFetch(
      `/relatorios/cadastros/${
        query ? `?${query}` : ""
      }`
    ),

    apiFetch(
      `/pessoas/${
        query ? `?${query}` : ""
      }`
    ),
  ])


  if (!respostaRelatorio.ok) {
    throw new Error(
      "Não foi possível carregar o relatório."
    )
  }


  if (!respostaPessoas.ok) {
    throw new Error(
      "Não foi possível carregar o relatório detalhado."
    )
  }


  relatorio =
    await respostaRelatorio.json()


  pessoas =
    obterLista(
      await respostaPessoas.json()
    )


  atualizarResumo()
  renderizarGraficos()
  filtrarPesquisa()
}


/* =========================================
   RESUMO
========================================= */

function atualizarResumo() {
  const localidadesComCadastro =
    relatorio
      ?.cadastros_por_localidade
      ?.length || 0

  const ruasComCadastro =
    relatorio
      ?.cadastros_por_rua
      ?.length || 0

  const usuariosComCadastro =
    relatorio
      ?.pessoas_cadastradas_por_usuario
      ?.length || 0


  reportTotal.textContent =
    relatorio
      ?.resumo
      ?.total_pessoas_cadastradas ||
    0


  reportNeighborhoodTotal
    .textContent =
    localidadesComCadastro


  reportStreetTotal.textContent =
    ruasComCadastro


  reportUserTotal.textContent =
    usuariosComCadastro
}


/* =========================================
   GRÁFICOS
========================================= */

function criarGrafico(
  container,
  dados,
  obterNome,
  classeCor
) {
  container.innerHTML = ""


  if (!dados?.length) {
    container.innerHTML = `
      <p>
        Nenhum dado encontrado.
      </p>
    `

    return
  }


  const maior =
    Math.max(
      ...dados.map(
        item =>
          Number(item.total || 0)
      )
    )


  dados
    .slice(0, 10)
    .forEach(
      function (item) {
        const total =
          Number(item.total || 0)

        const percentual =
          maior
            ? Math.round(
                (
                  total /
                  maior
                ) * 100
              )
            : 0


        const elemento =
          document.createElement(
            "div"
          )

        elemento.className =
          "report-bar-item"


        elemento.innerHTML = `
          <div>
            <span>
              ${escaparHtml(
                obterNome(item)
              )}
            </span>

            <strong>
              ${total}
              cadastradas
            </strong>
          </div>

          <div
            class="report-bar-track"
          >
            <div
              class="
                report-bar-fill
                ${classeCor}
              "
              style="
                width:
                ${percentual}%
              "
            ></div>
          </div>
        `


        container.appendChild(
          elemento
        )
      }
    )
}


function renderizarGraficos() {
  criarGrafico(
    localityChart,

    relatorio
      ?.cadastros_por_localidade ||
      [],

    function (item) {
      const tipo =
        item.localidade__tipo ===
        "COMUNIDADE"
          ? "Comunidade"
          : "Bairro"

      return (
        `${item.localidade__nome} - ${tipo}`
      )
    },

    "blue"
  )


  criarGrafico(
    userChart,

    relatorio
      ?.pessoas_cadastradas_por_usuario ||
      [],

    function (item) {
      const nome =
        [
          item.cadastrada_por__first_name,
          item.cadastrada_por__last_name,
        ]
          .filter(Boolean)
          .join(" ")
          .trim()

      return (
        nome ||
        item.cadastrada_por__username ||
        "Usuário"
      )
    },

    "green"
  )
}


/* =========================================
   TABELA
========================================= */

function renderizarPessoas(lista) {
  reportTableBody.innerHTML =
    ""


  reportVisibleTotal.textContent =
    lista.length


  reportEmptyState
    .classList
    .toggle(
      "visible",
      lista.length === 0
    )


  lista.forEach(
    function (pessoa) {
      const linha =
        document.createElement(
          "tr"
        )


      linha.innerHTML = `
        <td data-label="Nome">
          ${escaparHtml(
            pessoa.nome_completo
          )}
        </td>

        <td data-label="Telefone">
          ${escaparHtml(
            pessoa.telefone || "-"
          )}
        </td>

        <td data-label="Região">
          ${escaparHtml(
            pessoa.regiao_nome || "-"
          )}
        </td>

        <td data-label="Localidade">
          ${escaparHtml(
            pessoa.localidade_nome ||
            "-"
          )}
        </td>

        <td data-label="Rua">
          ${escaparHtml(
            pessoa.rua_nome || "-"
          )}
        </td>

        <td data-label="Cadastrado por">
          ${escaparHtml(
            pessoa.cadastrada_por_nome ||
            "-"
          )}
        </td>

        <td data-label="Data">
          ${formatarData(
            pessoa.criado_em
          )}
        </td>
      `


      reportTableBody
        .appendChild(linha)
    }
  )
}


/* =========================================
   PESQUISA LOCAL
========================================= */

function filtrarPesquisa() {
  const busca =
    normalizar(
      reportSearchInput.value
    )


  if (!busca) {
    renderizarPessoas(
      pessoas
    )

    return
  }


  const filtradas =
    pessoas.filter(
      function (pessoa) {
        return normalizar(
          [
            pessoa.nome_completo,
            pessoa.telefone,
            pessoa.cpf,
            pessoa.titulo_eleitor,
          ].join(" ")
        ).includes(
          busca
        )
      }
    )


  renderizarPessoas(
    filtradas
  )
}


/* =========================================
   FILTROS
========================================= */

async function aplicarFiltros() {
  try {
    if (
      window.SystemModal?.loading
    ) {
      SystemModal.loading.show(
        "Atualizando relatório..."
      )
    }

    await carregarRelatorio()

  } catch (error) {
    console.error(error)

    if (window.SystemModal) {
      await SystemModal.alert({
        title:
          "Erro no relatório",

        message:
          error.message,

        type:
          "warning",
      })
    }

  } finally {
    window.SystemModal
      ?.loading
      .hide()
  }
}


reportPeriod?.addEventListener(
  "change",
  function () {
    const personalizado =
      reportPeriod.value ===
      "personalizado"


    startDateField.classList.toggle(
      "hidden",
      !personalizado
    )


    endDateField.classList.toggle(
      "hidden",
      !personalizado
    )


    if (!personalizado) {
      reportStartDate.value =
        ""

      reportEndDate.value =
        ""

      aplicarFiltros()
    }
  }
)


reportStartDate?.addEventListener(
  "change",
  aplicarFiltros
)


reportEndDate?.addEventListener(
  "change",
  aplicarFiltros
)


reportRegion?.addEventListener(
  "change",
  async function () {
    reportNeighborhood.value =
      ""

    reportStreet.value =
      ""

    preencherLocalidades()
    preencherRuas()

    await aplicarFiltros()
  }
)


reportNeighborhood
  ?.addEventListener(
    "change",
    async function () {
      reportStreet.value =
        ""

      preencherRuas()

      await aplicarFiltros()
    }
  )


reportStreet?.addEventListener(
  "change",
  aplicarFiltros
)


reportUser?.addEventListener(
  "change",
  aplicarFiltros
)


reportSearchInput
  ?.addEventListener(
    "input",
    filtrarPesquisa
  )


/* =========================================
   LIMPAR
========================================= */

clearReportFilters
  ?.addEventListener(
    "click",
    async function () {
      reportPeriod.value =
        ""

      reportStartDate.value =
        ""

      reportEndDate.value =
        ""

      reportRegion.value =
        ""

      reportNeighborhood.value =
        ""

      reportStreet.value =
        ""

      reportUser.value =
        ""

      reportSearchInput.value =
        ""


      startDateField
        .classList
        .add("hidden")

      endDateField
        .classList
        .add("hidden")


      preencherLocalidades()
      preencherRuas()


      await aplicarFiltros()
    }
  )


/* =========================================
   DOWNLOAD AUTENTICADO
========================================= */

async function baixarArquivo(
  endpoint,
  nomePadrao
) {
  const token =
    getAccessToken()


  const response =
    await fetch(
      `${API_URL}${endpoint}`,
      {
        headers: token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {},
      }
    )


  if (!response.ok) {
    throw new Error(
      "Não foi possível gerar o arquivo."
    )
  }


  const blob =
    await response.blob()


  const contentDisposition =
    response.headers.get(
      "Content-Disposition"
    )


  let nomeArquivo =
    nomePadrao


  const resultado =
    contentDisposition
      ?.match(
        /filename="?([^"]+)"?/
      )


  if (resultado?.[1]) {
    nomeArquivo =
      resultado[1]
  }


  const url =
    URL.createObjectURL(
      blob
    )


  const link =
    document.createElement(
      "a"
    )


  link.href =
    url

  link.download =
    nomeArquivo


  document.body.appendChild(
    link
  )


  link.click()
  link.remove()


  URL.revokeObjectURL(
    url
  )
}


/* =========================================
   EXCEL
========================================= */

exportExcelButton
  ?.addEventListener(
    "click",
    async function () {
      try {
        const params =
          montarParametros()

        const query =
          params.toString()


        SystemModal?.loading.show(
          "Gerando arquivo Excel..."
        )


      await baixarArquivo(
         `/relatorios/exportar/excel/${
          query
              ? `?${query}`
            : ""
           }`,

          "relatorio_pessoas_cadastradas.xlsx"
        )

      } catch (error) {
        console.error(error)

        if (window.SystemModal) {
          await SystemModal.alert({
            title:
              "Erro na exportação",

            message:
              error.message,

            type:
              "warning",
          })
        }

      } finally {
        SystemModal
          ?.loading
          .hide()
      }
    }
  )


/* =========================================
   PDF
========================================= */

exportPdfButton
  ?.addEventListener(
    "click",
    async function () {
      try {
        const params =
          montarParametros()

        const query =
          params.toString()


        SystemModal?.loading.show(
          "Gerando arquivo PDF..."
        )


        await baixarArquivo(
          `/relatorios/exportar/pdf/${
            query
              ? `?${query}`
              : ""
          }`,

          "relatorio_pessoas_cadastradas.pdf"
        )

      } catch (error) {
        console.error(error)

        if (window.SystemModal) {
          await SystemModal.alert({
            title:
              "Erro na exportação",

            message:
              error.message,

            type:
              "warning",
          })
        }

      } finally {
        SystemModal
          ?.loading
          .hide()
      }
    }
  )


/* =========================================
   INICIAR
========================================= */

async function iniciarPagina() {
  try {
    usuarioAtual =
      await buscarUsuarioLogado()


    if (
      !usuarioAtual ||
      usuarioAtual.tipo !==
        "ADMINISTRADOR"
    ) {
      window.location.href =
        "pessoas.html"

      return
    }


    preencherUsuarioLogado(
      usuarioAtual
    )


    await carregarOpcoes()

    await carregarRelatorio()


    if (window.lucide) {
      window.lucide.createIcons()
    }


  } catch (error) {
    console.error(
      "Erro ao iniciar relatórios:",
      error
    )


    if (window.SystemModal) {
      await SystemModal.alert({
        title:
          "Não foi possível carregar",

        message:
          error.message,

        type:
          "warning",
      })
    }
  }
}


document.addEventListener(
  "DOMContentLoaded",
  iniciarPagina
)