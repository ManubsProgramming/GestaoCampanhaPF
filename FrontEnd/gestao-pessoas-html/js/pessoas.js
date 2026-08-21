/* =========================================
   ELEMENTOS DA PÁGINA
========================================= */

const sidebar =
  document.querySelector("#sidebar")

const menuOverlay =
  document.querySelector("#menu-overlay")

const openMenuButton =
  document.querySelector("#open-menu")

const closeMenuButton =
  document.querySelector("#close-menu")

const logoutButton =
  document.querySelector(".logout-button")

const loggedUser =
  document.querySelector("#logged-user")

const notificationButton =
  document.querySelector(".notification-button")

const searchInput =
  document.querySelector("#people-search")

const neighborhoodFilter =
  document.querySelector("#neighborhood-filter")

const streetFilter =
  document.querySelector("#street-filter")

const userFilter =
  document.querySelector("#user-filter")

const periodFilter =
  document.querySelector("#period-filter")

const clearFiltersButton =
  document.querySelector("#clear-filters")

const tableBody =
  document.querySelector("#people-table-body")

const emptyState =
  document.querySelector("#empty-state")

const visibleTotal =
  document.querySelector("#visible-total")

const peopleTotal =
  document.querySelector("#people-total")

const activePeopleTotal =
  document.querySelector("#active-people-total")

const todayPeopleTotal =
  document.querySelector("#today-people-total")


let pessoas = []
let usuarioAtual = null


/* =========================================
   MENU LATERAL
========================================= */

function abrirMenu() {
  sidebar?.classList.add("open")
  menuOverlay?.classList.add("visible")

  document.body.style.overflow =
    "hidden"
}


function fecharMenu() {
  sidebar?.classList.remove("open")
  menuOverlay?.classList.remove("visible")

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


document.addEventListener(
  "keydown",
  function (event) {
    if (event.key === "Escape") {
      fecharMenu()
    }
  }
)


window.addEventListener(
  "resize",
  function () {
    if (window.innerWidth >= 1024) {
      fecharMenu()
    }
  }
)


/* =========================================
   FUNÇÕES AUXILIARES
========================================= */

function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
}


function escaparHtml(texto) {
  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}


function formatarData(data) {
  if (!data) {
    return "-"
  }

  const valor =
    new Date(data)

  if (
    Number.isNaN(
      valor.getTime()
    )
  ) {
    return "-"
  }

  return valor.toLocaleDateString(
    "pt-BR"
  )
}


function formatarTelefone(telefone) {
  if (!telefone) {
    return "-"
  }

  const numeros =
    String(telefone).replace(
      /\D/g,
      ""
    )

  if (numeros.length === 11) {
    return numeros.replace(
      /^(\d{2})(\d{5})(\d{4})$/,
      "($1) $2-$3"
    )
  }

  if (numeros.length === 10) {
    return numeros.replace(
      /^(\d{2})(\d{4})(\d{4})$/,
      "($1) $2-$3"
    )
  }

  return telefone
}


function obterNomeUsuario(usuario) {
  if (!usuario) {
    return ""
  }

  const nomeCompleto = [
    usuario.first_name,
    usuario.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim()

  return (
    nomeCompleto ||
    usuario.nome_completo ||
    usuario.username ||
    ""
  )
}


function obterIniciais(nome) {
  const palavras =
    String(nome || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)

  if (!palavras.length) {
    return "PS"
  }

  if (palavras.length === 1) {
    return palavras[0]
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    palavras[0][0] +
    palavras[palavras.length - 1][0]
  ).toUpperCase()
}


function nomeLocalidade(pessoa) {
  return (
    pessoa.localidade_nome ||
    pessoa.localidade?.nome ||
    pessoa.bairro_nome ||
    pessoa.bairro?.nome ||
    ""
  )
}


function nomeRua(pessoa) {
  return (
    pessoa.rua_nome ||
    pessoa.rua?.nome ||
    ""
  )
}


function nomeCadastrador(pessoa) {
  return (
    pessoa.cadastrada_por_nome ||
    pessoa.cadastrada_por_username ||
    pessoa.cadastrada_por?.nome_completo ||
    pessoa.cadastrada_por?.username ||
    pessoa.cadastrada_por_nome_completo ||
    ""
  )
}


/* =========================================
   MODAIS
========================================= */

async function mostrarAviso({
  title,
  message,
  type = "info",
}) {
  if (window.SystemModal) {
    await window.SystemModal.alert({
      title,
      message,
      confirmText: "Entendi",
      type,
    })

    return
  }

  window.alert(message)
}


async function pedirConfirmacao({
  title,
  message,
  confirmText = "Confirmar",
  type = "danger",
}) {
  if (window.SystemModal) {
    return window.SystemModal.confirm({
      title,
      message,
      confirmText,
      cancelText: "Cancelar",
      type,
    })
  }

  return window.confirm(message)
}


/* =========================================
   USUÁRIO LOGADO
========================================= */

function preencherUsuario(usuario) {
  const nome =
    obterNomeUsuario(usuario)

  const iniciais =
    obterIniciais(nome)

  if (loggedUser) {
    loggedUser.textContent =
      nome
  }

  const sidebarName =
    document.querySelector(
      ".sidebar-user-info strong"
    )

  if (sidebarName) {
    sidebarName.textContent =
      nome
  }

  const tipoTexto =
    usuario.tipo === "ADMINISTRADOR"
      ? "Administrador geral"
      : "Cadastrador"

  document
    .querySelectorAll(
      ".sidebar-user-info span, .profile-info small"
    )
    .forEach(
      function (elemento) {
        elemento.textContent =
          tipoTexto
      }
    )

  document
    .querySelectorAll(
      ".user-avatar, .profile-avatar"
    )
    .forEach(
      function (elemento) {
        elemento.textContent =
          iniciais
      }
    )

  if (
    usuario.tipo === "CADASTRADOR"
  ) {
    document
      .querySelectorAll(
        "[data-admin-only]"
      )
      .forEach(
        function (elemento) {
          elemento.style.display =
            "none"
        }
      )

    const userFilterField =
      userFilter?.closest(
        ".filter-field"
      )

    if (userFilterField) {
      userFilterField.style.display =
        "none"
    }
  }
}


/* =========================================
   CARREGAR PESSOAS
========================================= */

async function carregarPessoas() {
  const response =
    await apiFetch("/pessoas/")

  if (!response.ok) {
    throw new Error(
      `Erro ao carregar pessoas: ${response.status}`
    )
  }

  const dados =
    await response.json()

  pessoas =
    Array.isArray(dados)
      ? dados
      : dados.results || []

  preencherFiltros()
  aplicarFiltros()
}


/* =========================================
   OPÇÕES DOS FILTROS
========================================= */

function adicionarOpcao(
  select,
  valor,
  texto
) {
  if (!select) {
    return
  }

  const option =
    document.createElement(
      "option"
    )

  option.value =
    valor

  option.textContent =
    texto

  select.appendChild(option)
}


function preencherFiltros() {
  const localidadeAtual =
    neighborhoodFilter?.value || ""

  const ruaAtual =
    streetFilter?.value || ""

  const usuarioSelecionado =
    userFilter?.value || ""

  const localidades =
    new Set()

  const ruas =
    new Set()

  const usuarios =
    new Set()

  pessoas.forEach(
    function (pessoa) {
      const localidade =
        nomeLocalidade(pessoa)

      const rua =
        nomeRua(pessoa)

      const cadastrador =
        nomeCadastrador(pessoa)

      if (localidade) {
        localidades.add(localidade)
      }

      if (rua) {
        ruas.add(rua)
      }

      if (cadastrador) {
        usuarios.add(cadastrador)
      }
    }
  )

  if (neighborhoodFilter) {
    neighborhoodFilter.innerHTML = `
      <option value="">
        Todas as localidades
      </option>
    `

    Array
      .from(localidades)
      .sort(
        function (a, b) {
          return a.localeCompare(
            b,
            "pt-BR"
          )
        }
      )
      .forEach(
        function (localidade) {
          adicionarOpcao(
            neighborhoodFilter,
            localidade,
            localidade
          )
        }
      )

    if (
      localidades.has(
        localidadeAtual
      )
    ) {
      neighborhoodFilter.value =
        localidadeAtual
    }
  }

  if (streetFilter) {
    streetFilter.innerHTML = `
      <option value="">
        Todas as ruas
      </option>
    `

    Array
      .from(ruas)
      .sort(
        function (a, b) {
          return a.localeCompare(
            b,
            "pt-BR"
          )
        }
      )
      .forEach(
        function (rua) {
          adicionarOpcao(
            streetFilter,
            rua,
            rua
          )
        }
      )

    if (ruas.has(ruaAtual)) {
      streetFilter.value =
        ruaAtual
    }
  }

  if (
    userFilter &&
    usuarioAtual?.tipo ===
      "ADMINISTRADOR"
  ) {
    userFilter.innerHTML = `
      <option value="">
        Todos os usuários
      </option>
    `

    Array
      .from(usuarios)
      .sort(
        function (a, b) {
          return a.localeCompare(
            b,
            "pt-BR"
          )
        }
      )
      .forEach(
        function (usuario) {
          adicionarOpcao(
            userFilter,
            usuario,
            usuario
          )
        }
      )

    if (
      usuarios.has(
        usuarioSelecionado
      )
    ) {
      userFilter.value =
        usuarioSelecionado
    }
  }
}


/* =========================================
   FILTRO POR PERÍODO
========================================= */

function correspondePeriodo(
  pessoa,
  periodo
) {
  if (!periodo) {
    return true
  }

  if (!pessoa.criado_em) {
    return false
  }

  const cadastro =
    new Date(
      pessoa.criado_em
    )

  const agora =
    new Date()

  if (periodo === "hoje") {
    return (
      cadastro.getDate() ===
        agora.getDate() &&
      cadastro.getMonth() ===
        agora.getMonth() &&
      cadastro.getFullYear() ===
        agora.getFullYear()
    )
  }

  if (periodo === "semana") {
    const seteDias =
      7 * 24 * 60 * 60 * 1000

    return (
      agora.getTime() -
        cadastro.getTime() <=
      seteDias
    )
  }

  if (periodo === "mes") {
    return (
      cadastro.getMonth() ===
        agora.getMonth() &&
      cadastro.getFullYear() ===
        agora.getFullYear()
    )
  }

  return true
}


/* =========================================
   APLICAR FILTROS
========================================= */

function aplicarFiltros() {
  const pesquisa =
    normalizarTexto(
      searchInput?.value
    )

  const localidadeSelecionada =
    neighborhoodFilter?.value || ""

  const ruaSelecionada =
    streetFilter?.value || ""

  const usuarioSelecionado =
    userFilter?.value || ""

  const periodoSelecionado =
    periodFilter?.value || ""

  const filtradas =
    pessoas.filter(
      function (pessoa) {
        const textoPesquisa =
          normalizarTexto(
            [
              pessoa.nome_completo,
              pessoa.telefone,
              pessoa.cpf,
              pessoa.titulo_eleitor,
            ].join(" ")
          )

        const atendePesquisa =
          !pesquisa ||
          textoPesquisa.includes(
            pesquisa
          )

        const atendeLocalidade =
          !localidadeSelecionada ||
          nomeLocalidade(pessoa) ===
            localidadeSelecionada

        const atendeRua =
          !ruaSelecionada ||
          nomeRua(pessoa) ===
            ruaSelecionada

        const atendeUsuario =
          !usuarioSelecionado ||
          nomeCadastrador(pessoa) ===
            usuarioSelecionado

        const atendePeriodo =
          correspondePeriodo(
            pessoa,
            periodoSelecionado
          )

        return (
          atendePesquisa &&
          atendeLocalidade &&
          atendeRua &&
          atendeUsuario &&
          atendePeriodo
        )
      }
    )

  renderizarTabela(filtradas)
  atualizarResumo(filtradas)
}


/* =========================================
   RESUMO
========================================= */

function atualizarResumo(filtradas) {
  const ativos =
    pessoas.filter(
      function (pessoa) {
        return pessoa.status === "ATIVO"
      }
    ).length

  const hoje =
    pessoas.filter(
      function (pessoa) {
        return correspondePeriodo(
          pessoa,
          "hoje"
        )
      }
    ).length

  if (peopleTotal) {
    peopleTotal.textContent =
      pessoas.length
  }

  if (activePeopleTotal) {
    activePeopleTotal.textContent =
      ativos
  }

  if (todayPeopleTotal) {
    todayPeopleTotal.textContent =
      hoje
  }

  if (visibleTotal) {
    visibleTotal.textContent =
      filtradas.length
  }
}


/* =========================================
   RENDERIZAR TABELA
========================================= */

function renderizarTabela(lista) {
  if (!tableBody) {
    return
  }

  tableBody.innerHTML = ""

  if (!lista.length) {
    emptyState?.classList.add(
      "visible"
    )

    if (window.lucide) {
      window.lucide.createIcons()
    }

    return
  }

  emptyState?.classList.remove(
    "visible"
  )

  lista.forEach(
    function (pessoa) {
      const nome =
        pessoa.nome_completo || "-"

      const nomeSeguro =
        escaparHtml(nome)

      const iniciais =
        escaparHtml(
          obterIniciais(nome)
        )

      const telefone =
        escaparHtml(
          formatarTelefone(
            pessoa.telefone
          )
        )

      const localidade =
        escaparHtml(
          nomeLocalidade(pessoa) || "-"
        )

      const rua =
        escaparHtml(
          nomeRua(pessoa) || "-"
        )

      const cadastrador =
        escaparHtml(
          nomeCadastrador(pessoa) || "-"
        )

      const statusAtivo =
        pessoa.status === "ATIVO"

      const tr =
        document.createElement("tr")

      tr.dataset.id =
        pessoa.id

      tr.innerHTML = `
        <td data-label="Nome">
          <div class="person-name">
            <span class="person-avatar">
              ${iniciais}
            </span>

            <strong data-person-name>
              ${nomeSeguro}
            </strong>
          </div>
        </td>

        <td data-label="Telefone">
          ${telefone}
        </td>

        <td data-label="Localidade">
          ${localidade}
        </td>

        <td data-label="Rua">
          ${rua}
        </td>

        <td data-label="Data do cadastro">
          ${formatarData(
            pessoa.criado_em
          )}
        </td>

        <td data-label="Cadastrado por">
          ${cadastrador}
        </td>

        <td data-label="Status">
          <span
            class="status ${
              statusAtivo
                ? "active"
                : "inactive"
            }"
          >
            ${
              statusAtivo
                ? "Ativo"
                : "Inativo"
            }
          </span>
        </td>

        <td data-label="Ações">
          <div class="table-actions">
            <button
              type="button"
              title="Visualizar"
              data-action="view"
              aria-label="Visualizar ${nomeSeguro}"
            >
              <i data-lucide="eye"></i>
            </button>

            <button
              type="button"
              title="Editar"
              data-action="edit"
              aria-label="Editar ${nomeSeguro}"
            >
              <i data-lucide="pencil"></i>
            </button>

            <button
              type="button"
              class="delete-person"
              title="Excluir"
              data-action="delete"
              aria-label="Excluir ${nomeSeguro}"
            >
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </td>
      `

      tableBody.appendChild(tr)
    }
  )

  if (window.lucide) {
    window.lucide.createIcons()
  }
}


/* =========================================
   VISUALIZAR PESSOA
========================================= */

async function visualizarPessoa(
  pessoaId
) {
  const pessoa =
    pessoas.find(
      function (item) {
        return (
          String(item.id) ===
          String(pessoaId)
        )
      }
    )

  if (!pessoa) {
    return
  }

  const mensagem = [
    `Nome: ${pessoa.nome_completo || "-"}`,
    `CPF: ${pessoa.cpf || "-"}`,
    `Telefone: ${formatarTelefone(
      pessoa.telefone
    )}`,
    `Localidade: ${
      nomeLocalidade(pessoa) || "-"
    }`,
    `Rua: ${nomeRua(pessoa) || "-"}`,
    `Cadastrado por: ${
      nomeCadastrador(pessoa) || "-"
    }`,
  ].join("\n")

  await mostrarAviso({
    title: "Detalhes da pessoa",
    message: mensagem,
    type: "info",
  })
}


/* =========================================
   EXCLUIR PESSOA
========================================= */

async function excluirPessoa(
  pessoaId
) {
  const pessoa =
    pessoas.find(
      function (item) {
        return (
          String(item.id) ===
          String(pessoaId)
        )
      }
    )

  if (!pessoa) {
    return
  }

  const confirmou =
    await pedirConfirmacao({
      title: "Excluir pessoa cadastrada?",
      message:
        `Deseja excluir o cadastro de ` +
        `${pessoa.nome_completo}? ` +
        "Essa ação não poderá ser desfeita.",
      confirmText: "Sim, excluir",
      type: "danger",
    })

  if (!confirmou) {
    return
  }

  try {
    if (window.SystemModal?.loading) {
      window.SystemModal.loading.show(
        "Excluindo cadastro..."
      )
    }

    const response =
      await apiFetch(
        `/pessoas/${pessoaId}/`,
        {
          method: "DELETE",
        }
      )

    if (!response.ok) {
      throw new Error(
        `Erro ao excluir: ${response.status}`
      )
    }

    pessoas =
      pessoas.filter(
        function (item) {
          return (
            String(item.id) !==
            String(pessoaId)
          )
        }
      )

    preencherFiltros()
    aplicarFiltros()

    if (window.SystemModal?.loading) {
      window.SystemModal.loading.hide()
    }

    await mostrarAviso({
      title: "Cadastro excluído",
      message:
        "A pessoa cadastrada foi excluída com sucesso.",
      type: "success",
    })
  } catch (error) {
    console.error(
      "Erro ao excluir pessoa:",
      error
    )

    if (window.SystemModal?.loading) {
      window.SystemModal.loading.hide()
    }

    await mostrarAviso({
      title: "Não foi possível excluir",
      message:
        "O cadastro não pôde ser excluído. Tente novamente.",
      type: "danger",
    })
  }
}


/* =========================================
   AÇÕES DA TABELA
========================================= */

tableBody?.addEventListener(
  "click",
  async function (event) {
    const botao =
      event.target.closest(
        "button[data-action]"
      )

    if (!botao) {
      return
    }

    const linha =
      botao.closest("tr")

    const pessoaId =
      linha?.dataset.id

    if (!pessoaId) {
      return
    }

    const acao =
      botao.dataset.action

    if (acao === "view") {
      await visualizarPessoa(
        pessoaId
      )

      return
    }

    if (acao === "edit") {
      window.location.href =
        `novo-cadastro.html?id=${pessoaId}`

      return
    }

    if (acao === "delete") {
      await excluirPessoa(
        pessoaId
      )
    }
  }
)


/* =========================================
   EVENTOS DOS FILTROS
========================================= */

searchInput?.addEventListener(
  "input",
  aplicarFiltros
)


neighborhoodFilter?.addEventListener(
  "change",
  aplicarFiltros
)


streetFilter?.addEventListener(
  "change",
  aplicarFiltros
)


userFilter?.addEventListener(
  "change",
  aplicarFiltros
)


periodFilter?.addEventListener(
  "change",
  aplicarFiltros
)


clearFiltersButton?.addEventListener(
  "click",
  function () {
    if (searchInput) {
      searchInput.value = ""
    }

    if (neighborhoodFilter) {
      neighborhoodFilter.value = ""
    }

    if (streetFilter) {
      streetFilter.value = ""
    }

    if (userFilter) {
      userFilter.value = ""
    }

    if (periodFilter) {
      periodFilter.value = ""
    }

    aplicarFiltros()
    searchInput?.focus()
  }
)


/* =========================================
   NOTIFICAÇÕES
========================================= */

notificationButton?.addEventListener(
  "click",
  async function () {
    await mostrarAviso({
      title: "Notificações",
      message:
        "Você não possui novas notificações no momento.",
      type: "info",
    })
  }
)


/* =========================================
   LOGOUT
========================================= */

logoutButton?.addEventListener(
  "click",
  async function () {
    const confirmou =
      await pedirConfirmacao({
        title: "Sair do sistema?",
        message:
          "Deseja realmente sair do sistema?",
        confirmText: "Sim, sair",
        type: "warning",
      })

    if (confirmou) {
      fazerLogout()
    }
  }
)


/* =========================================
   INICIAR PÁGINA
========================================= */

async function iniciarPagina() {
  try {
    /*
     * =========================
     * USUÁRIO
     * =========================
     */

    usuarioAtual =
      await buscarUsuarioLogado();

    if (!usuarioAtual) {
      limparSessao();

      window.location.href =
        "index.html";

      return;
    }

    preencherUsuario(
      usuarioAtual
    );


    /*
     * =========================
     * PESSOAS
     * =========================
     */

    try {
      await carregarPessoas();

    } catch (error) {
      console.error(
        "Erro ao carregar pessoas:",
        error
      );

      await mostrarAviso({
        title:
          "Não foi possível carregar",

        message:
          "Não foi possível carregar a lista de pessoas cadastradas. Tente atualizar a página.",

        type:
          "warning"
      });
    }


    /*
     * =========================
     * LIBERA A PÁGINA
     * =========================
     */

    document.body.classList.remove(
      "auth-loading"
    );

    document.body.classList.add(
      "auth-ready"
    );

    if (window.lucide) {
      window.lucide.createIcons();
    }

  } catch (error) {
    console.error(
      "Erro de autenticação:",
      error
    );

    /*
     * Só limpa a sessão se
     * realmente não conseguiu
     * identificar o usuário.
     */

    limparSessao();

    window.location.href =
      "index.html";
  }
}


document.addEventListener(
  "DOMContentLoaded",
  iniciarPagina
);