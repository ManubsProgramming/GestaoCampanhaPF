const sidebar =
  document.querySelector("#sidebar")

const menuOverlay =
  document.querySelector("#menu-overlay")

const openMenuButton =
  document.querySelector("#open-menu")

const closeMenuButton =
  document.querySelector("#close-menu")

const logoutButton =
  document.querySelector("#logout-button")

const loggedUser =
  document.querySelector("#logged-user")

const notificationButton =
  document.querySelector(".notification-button")


const auditTotal =
  document.querySelector("#audit-total")

const auditCreations =
  document.querySelector("#audit-creations")

const auditUpdates =
  document.querySelector("#audit-updates")

const auditDeactivations =
  document.querySelector("#audit-deactivations")


const searchInput =
  document.querySelector("#audit-search-input")

const actionFilter =
  document.querySelector("#audit-action-filter")

const entityFilter =
  document.querySelector("#audit-entity-filter")

const startDate =
  document.querySelector("#audit-start-date")

const endDate =
  document.querySelector("#audit-end-date")

const clearFiltersButton =
  document.querySelector("#clear-audit-filters")


const tableBody =
  document.querySelector("#audit-table-body")

const visibleTotal =
  document.querySelector("#audit-visible-total")

const emptyState =
  document.querySelector("#audit-empty-state")


let registros = []


function abrirMenu() {
  sidebar?.classList.add("open")
  menuOverlay?.classList.add("visible")

  document.body.style.overflow = "hidden"
}


function fecharMenu() {
  sidebar?.classList.remove("open")
  menuOverlay?.classList.remove("visible")

  document.body.style.overflow = ""
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


function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}


function obterNome(usuario) {
  if (!usuario) {
    return "Administrador"
  }

  return (
    usuario.nome_completo ||
    [
      usuario.first_name,
      usuario.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    usuario.username ||
    "Administrador"
  )
}


function obterIniciais(nome) {
  const partes =
    String(nome || "")
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


function preencherAdministrador(usuario) {
  const nome =
    obterNome(usuario)

  const iniciais =
    obterIniciais(nome)

  if (loggedUser) {
    loggedUser.textContent = nome
  }

  document
    .querySelectorAll(
      ".sidebar-user-info strong"
    )
    .forEach(function (elemento) {
      elemento.textContent = nome
    })

  document
    .querySelectorAll(
      ".user-avatar, .profile-avatar"
    )
    .forEach(function (elemento) {
      elemento.textContent = iniciais
    })
}


function obterLista(dados) {
  if (Array.isArray(dados)) {
    return dados
  }

  return dados?.results || []
}


async function carregarAuditoria() {
  const response =
    await apiFetch(
      "/auditoria/"
    )

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error(
        "Somente administradores podem consultar a auditoria."
      )
    }

    throw new Error(
      `Erro ao carregar auditoria: ${response.status}`
    )
  }

  const dados =
    await response.json()

  registros =
    obterLista(dados)

  preencherFiltroEntidades()
  atualizarResumo()
  aplicarFiltros()
}


function preencherFiltroEntidades() {
  const entidades =
    new Set(
      registros
        .map(function (registro) {
          return registro.entidade
        })
        .filter(Boolean)
    )

  entityFilter.innerHTML = `
    <option value="">
      Todas as entidades
    </option>
  `

  Array
    .from(entidades)
    .sort()
    .forEach(function (entidade) {
      const option =
        document.createElement("option")

      option.value = entidade
      option.textContent = entidade

      entityFilter.appendChild(
        option
      )
    })
}


function atualizarResumo() {
  auditTotal.textContent =
    registros.length

  auditCreations.textContent =
    registros.filter(
      function (registro) {
        return registro.acao === "CRIACAO"
      }
    ).length

  auditUpdates.textContent =
    registros.filter(
      function (registro) {
        return registro.acao === "ALTERACAO"
      }
    ).length

  auditDeactivations.textContent =
    registros.filter(
      function (registro) {
        return registro.acao === "DESATIVACAO"
      }
    ).length
}


function formatarDataHora(data) {
  if (!data) {
    return "-"
  }

  const valor =
    new Date(data)

  return valor.toLocaleString(
    "pt-BR"
  )
}


function obterClasseAcao(acao) {
  const mapa = {
    LOGIN: "login",
    LOGOUT: "logout",
    CRIACAO: "creation",
    ALTERACAO: "update",
    EXCLUSAO: "delete",
    ATIVACAO: "activation",
    DESATIVACAO: "deactivation",
    CONSULTA: "query",
  }

  return mapa[acao] || "default"
}


function renderizarRegistros(lista) {
  tableBody.innerHTML = ""

  visibleTotal.textContent =
    lista.length

  if (!lista.length) {
    emptyState.classList.add(
      "visible"
    )

    return
  }

  emptyState.classList.remove(
    "visible"
  )

  lista.forEach(
    function (registro) {
      const linha =
        document.createElement("tr")

      linha.innerHTML = `
        <td data-label="Data e hora">
          ${formatarDataHora(
            registro.criado_em
          )}
        </td>

        <td data-label="Usuário">
          <strong>
            ${
              registro.usuario_nome ||
              "Sistema"
            }
          </strong>
        </td>

        <td data-label="Ação">
          <span
            class="
              audit-action
              ${obterClasseAcao(
                registro.acao
              )}
            "
          >
            ${
              registro.acao_nome ||
              registro.acao
            }
          </span>
        </td>

        <td data-label="Entidade">
          ${registro.entidade || "-"}
        </td>

        <td data-label="Descrição">
          ${registro.descricao || "-"}
        </td>

        <td data-label="IP">
          ${registro.endereco_ip || "-"}
        </td>
      `

      tableBody.appendChild(
        linha
      )
    }
  )
}


function aplicarFiltros() {
  const busca =
    normalizar(
      searchInput.value
    )

  const acao =
    actionFilter.value

  const entidade =
    entityFilter.value

  const inicio =
    startDate.value

  const fim =
    endDate.value


  const filtrados =
    registros.filter(
      function (registro) {
        const textoBusca =
          normalizar(
            [
              registro.usuario_nome,
              registro.descricao,
              registro.entidade,
              registro.endereco_ip,
            ].join(" ")
          )

        const correspondeBusca =
          !busca ||
          textoBusca.includes(busca)

        const correspondeAcao =
          !acao ||
          registro.acao === acao

        const correspondeEntidade =
          !entidade ||
          registro.entidade === entidade


        let correspondeData = true

        if (registro.criado_em) {
          const dataRegistro =
            registro.criado_em.slice(
              0,
              10
            )

          if (
            inicio &&
            dataRegistro < inicio
          ) {
            correspondeData = false
          }

          if (
            fim &&
            dataRegistro > fim
          ) {
            correspondeData = false
          }
        }

        return (
          correspondeBusca &&
          correspondeAcao &&
          correspondeEntidade &&
          correspondeData
        )
      }
    )

  renderizarRegistros(
    filtrados
  )
}


searchInput?.addEventListener(
  "input",
  aplicarFiltros
)

actionFilter?.addEventListener(
  "change",
  aplicarFiltros
)

entityFilter?.addEventListener(
  "change",
  aplicarFiltros
)

startDate?.addEventListener(
  "change",
  aplicarFiltros
)

endDate?.addEventListener(
  "change",
  aplicarFiltros
)


clearFiltersButton?.addEventListener(
  "click",
  function () {
    searchInput.value = ""
    actionFilter.value = ""
    entityFilter.value = ""
    startDate.value = ""
    endDate.value = ""

    aplicarFiltros()

    searchInput.focus()
  }
)


logoutButton?.addEventListener(
  "click",
  function () {
    if (
      window.confirm(
        "Deseja realmente sair do sistema?"
      )
    ) {
      fazerLogout()
    }
  }
)


notificationButton?.addEventListener(
  "click",
  function () {
    window.alert(
      "Você não possui novas notificações no momento."
    )
  }
)


async function iniciarPagina() {
  try {
    const usuario =
      await buscarUsuarioLogado()

    if (
      !usuario ||
      usuario.tipo !==
        "ADMINISTRADOR"
    ) {
      window.location.href =
        "pessoas.html"

      return
    }

    preencherAdministrador(
      usuario
    )

    await carregarAuditoria()

    if (window.lucide) {
      window.lucide.createIcons()
    }

  } catch (error) {
    console.error(
      "Erro ao iniciar auditoria:",
      error
    )

    window.alert(
      error.message
    )

    window.location.href =
      "painel.html"
  }
}


document.addEventListener(
  "DOMContentLoaded",
  iniciarPagina
)