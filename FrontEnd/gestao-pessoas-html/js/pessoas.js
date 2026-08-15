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
  document.querySelector(
    ".notification-button"
  )


const searchInput =
  document.querySelector(
    "#people-search"
  )

const neighborhoodFilter =
  document.querySelector(
    "#neighborhood-filter"
  )

const streetFilter =
  document.querySelector(
    "#street-filter"
  )

const userFilter =
  document.querySelector(
    "#user-filter"
  )

const periodFilter =
  document.querySelector(
    "#period-filter"
  )

const clearFiltersButton =
  document.querySelector(
    "#clear-filters"
  )


const tableBody =
  document.querySelector(
    "#people-table-body"
  )

const emptyState =
  document.querySelector(
    "#empty-state"
  )

const visibleTotal =
  document.querySelector(
    "#visible-total"
  )

const peopleTotal =
  document.querySelector(
    "#people-total"
  )


let pessoas = []
let usuarioAtual = null


/* =========================================
   MENU
========================================= */

function openMenu() {
  sidebar?.classList.add("open")

  menuOverlay?.classList.add(
    "visible"
  )

  document.body.style.overflow =
    "hidden"
}


function closeMenu() {
  sidebar?.classList.remove(
    "open"
  )

  menuOverlay?.classList.remove(
    "visible"
  )

  document.body.style.overflow =
    ""
}


openMenuButton?.addEventListener(
  "click",
  openMenu
)


closeMenuButton?.addEventListener(
  "click",
  closeMenu
)


menuOverlay?.addEventListener(
  "click",
  closeMenu
)


document.addEventListener(
  "keydown",
  function (event) {
    if (event.key === "Escape") {
      closeMenu()
    }
  }
)


window.addEventListener(
  "resize",
  function () {
    if (
      window.innerWidth >= 1024
    ) {
      closeMenu()
    }
  }
)


/* =========================================
   AUXILIARES
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


function formatarData(data) {
  if (!data) {
    return "-"
  }

  return new Date(
    data
  ).toLocaleDateString(
    "pt-BR"
  )
}


function formatarTelefone(
  telefone
) {
  if (!telefone) {
    return "-"
  }

  const numeros =
    telefone.replace(
      /\D/g,
      ""
    )

  if (
    numeros.length === 11
  ) {
    return numeros.replace(
      /^(\d{2})(\d{5})(\d{4})$/,
      "($1) $2-$3"
    )
  }

  return telefone
}


function obterNomeUsuario(
  usuario
) {
  if (!usuario) {
    return ""
  }

  const nome = [
    usuario.first_name,
    usuario.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim()

  return (
    nome ||
    usuario.username ||
    ""
  )
}


function obterIniciais(nome) {
  const palavras =
    String(nome || "")
      .trim()
      .split(" ")
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
    palavras[
      palavras.length - 1
    ][0]
  ).toUpperCase()
}


/* =========================================
   CAMPOS DA API
========================================= */

function nomeLocalidade(
  pessoa
) {
  return (
    pessoa.localidade_nome ||
    pessoa.localidade?.nome ||
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


function nomeCadastrador(
  pessoa
) {
  return (
    pessoa.cadastrada_por_nome ||
    pessoa.cadastrada_por_username ||
    pessoa.cadastrada_por?.username ||
    pessoa.cadastrada_por_nome_completo ||
    ""
  )
}


/* =========================================
   PERFIL
========================================= */

function preencherUsuario(
  usuario
) {
  const nome =
    obterNomeUsuario(usuario)

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
    usuario.tipo ===
    "ADMINISTRADOR"
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


  const iniciais =
    obterIniciais(nome)


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


  /*
   * Cadastrador não precisa
   * visualizar menu administrativo.
   */

  if (
    usuario.tipo ===
    "CADASTRADOR"
  ) {
    document
      .querySelectorAll(
        'a[href="painel.html"], ' +
        'a[href="usuarios.html"], ' +
        'a[href="regioes.html"], ' +
        'a[href="relatorios.html"], ' +
        'a[href="configuracoes.html"], ' +
        'a[href="auditoria.html"]'
      )
      .forEach(
        function (link) {
          link.style.display =
            "none"
        }
      )


    if (userFilter) {
      const campoUsuario =
        userFilter.closest(
          ".filter-field"
        )

      if (campoUsuario) {
        campoUsuario.style.display =
          "none"
      }
    }
  }
}


/* =========================================
   CARREGAR PESSOAS
========================================= */

async function carregarPessoas() {
  const response =
    await apiFetch(
      "/pessoas/"
    )


  if (!response.ok) {
    throw new Error(
      `Erro ao carregar pessoas: ${response.status}`
    )
  }


  const dados =
    await response.json()


  /*
   * Funciona tanto se a API
   * retornar array direto quanto
   * se futuramente houver paginação DRF.
   */

  pessoas =
    Array.isArray(dados)
      ? dados
      : (
        dados.results ||
        []
      )


  preencherFiltros()
  aplicarFiltros()
}


/* =========================================
   FILTROS
========================================= */

function adicionarOpcao(
  select,
  valor,
  texto
) {
  const option =
    document.createElement(
      "option"
    )

  option.value =
    valor

  option.textContent =
    texto

  select.appendChild(
    option
  )
}


function preencherFiltros() {
  const localidades =
    new Set()

  const ruas =
    new Set()

  const usuarios =
    new Set()


  pessoas.forEach(
    function (pessoa) {
      const localidade =
        nomeLocalidade(
          pessoa
        )

      const rua =
        nomeRua(
          pessoa
        )

      const cadastrador =
        nomeCadastrador(
          pessoa
        )


      if (localidade) {
        localidades.add(
          localidade
        )
      }

      if (rua) {
        ruas.add(
          rua
        )
      }

      if (cadastrador) {
        usuarios.add(
          cadastrador
        )
      }
    }
  )


  if (neighborhoodFilter) {
    neighborhoodFilter.innerHTML =
      `
        <option value="">
          Todas as localidades
        </option>
      `

    Array
      .from(localidades)
      .sort()
      .forEach(
        function (localidade) {
          adicionarOpcao(
            neighborhoodFilter,
            localidade,
            localidade
          )
        }
      )
  }


  if (streetFilter) {
    streetFilter.innerHTML =
      `
        <option value="">
          Todas as ruas
        </option>
      `

    Array
      .from(ruas)
      .sort()
      .forEach(
        function (rua) {
          adicionarOpcao(
            streetFilter,
            rua,
            rua
          )
        }
      )
  }


  if (
    userFilter &&
    usuarioAtual?.tipo ===
      "ADMINISTRADOR"
  ) {
    userFilter.innerHTML =
      `
        <option value="">
          Todos os usuários
        </option>
      `

    Array
      .from(usuarios)
      .sort()
      .forEach(
        function (usuario) {
          adicionarOpcao(
            userFilter,
            usuario,
            usuario
          )
        }
      )
  }
}


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
        agora.getDate()
      &&
      cadastro.getMonth() ===
        agora.getMonth()
      &&
      cadastro.getFullYear() ===
        agora.getFullYear()
    )
  }


  if (periodo === "semana") {
    const seteDias =
      7 *
      24 *
      60 *
      60 *
      1000

    return (
      agora.getTime() -
      cadastro.getTime()
      <= seteDias
    )
  }


  if (periodo === "mes") {
    return (
      cadastro.getMonth() ===
        agora.getMonth()
      &&
      cadastro.getFullYear() ===
        agora.getFullYear()
    )
  }


  return true
}


function aplicarFiltros() {
  const pesquisa =
    normalizarTexto(
      searchInput?.value
    )

  const localidadeSelecionada =
    neighborhoodFilter?.value ||
    ""

  const ruaSelecionada =
    streetFilter?.value ||
    ""

  const usuarioSelecionado =
    userFilter?.value ||
    ""

  const periodoSelecionado =
    periodFilter?.value ||
    ""


  const filtradas =
    pessoas.filter(
      function (pessoa) {
        const nome =
          normalizarTexto(
            pessoa.nome_completo
          )

        const telefone =
          normalizarTexto(
            pessoa.telefone
          )

        const cpf =
          normalizarTexto(
            pessoa.cpf
          )

        const titulo =
          normalizarTexto(
            pessoa.titulo_eleitor
          )


        const atendePesquisa =
          !pesquisa ||
          nome.includes(
            pesquisa
          ) ||
          telefone.includes(
            pesquisa
          ) ||
          cpf.includes(
            pesquisa
          ) ||
          titulo.includes(
            pesquisa
          )


        const atendeLocalidade =
          !localidadeSelecionada ||
          nomeLocalidade(
            pessoa
          ) ===
          localidadeSelecionada


        const atendeRua =
          !ruaSelecionada ||
          nomeRua(
            pessoa
          ) ===
          ruaSelecionada


        const atendeUsuario =
          !usuarioSelecionado ||
          nomeCadastrador(
            pessoa
          ) ===
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


  renderizarTabela(
    filtradas
  )

  atualizarResumo(
    filtradas
  )
}


/* =========================================
   RESUMO
========================================= */

function atualizarResumo(
  filtradas
) {
  if (peopleTotal) {
    peopleTotal.textContent =
      pessoas.length
  }

  if (visibleTotal) {
    visibleTotal.textContent =
      filtradas.length
  }


  const ativos =
    pessoas.filter(
      function (pessoa) {
        return (
          pessoa.status ===
          "ATIVO"
        )
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


  /*
   * Segundo e terceiro cards
   * do seu HTML atual.
   */

  const cards =
    document.querySelectorAll(
      ".people-summary article strong"
    )


  if (cards[1]) {
    cards[1].textContent =
      ativos
  }

  if (cards[2]) {
    cards[2].textContent =
      hoje
  }
}


/* =========================================
   TABELA
========================================= */

function renderizarTabela(
  lista
) {
  if (!tableBody) {
    return
  }


  tableBody.innerHTML =
    ""


  if (!lista.length) {
    emptyState?.classList.add(
      "visible"
    )

    return
  }


  emptyState?.classList.remove(
    "visible"
  )


  lista.forEach(
    function (pessoa) {
      const nome =
        pessoa.nome_completo ||
        "-"

      const iniciais =
        obterIniciais(nome)

      const localidade =
        nomeLocalidade(
          pessoa
        ) || "-"

      const rua =
        nomeRua(
          pessoa
        ) || "-"

      const cadastrador =
        nomeCadastrador(
          pessoa
        ) || "-"

      const statusAtivo =
        pessoa.status ===
        "ATIVO"


      const tr =
        document.createElement(
          "tr"
        )

      tr.dataset.id =
        pessoa.id


      tr.innerHTML = `
        <td data-label="Nome">
          <div class="person-name">
            <span class="person-avatar">
              ${iniciais}
            </span>

            <strong>
              ${nome}
            </strong>
          </div>
        </td>

        <td data-label="Telefone">
          ${formatarTelefone(
            pessoa.telefone
          )}
        </td>

        <td data-label="Localidade">
          ${localidade}
        </td>

        <td data-label="Rua">
          ${rua}
        </td>

        <td data-label="Data">
          ${formatarData(
            pessoa.criado_em
          )}
        </td>

        <td data-label="Cadastrado por">
          ${cadastrador}
        </td>

        <td data-label="Status">
          <span
            class="
              status
              ${
                statusAtivo
                  ? "active"
                  : "inactive"
              }
            "
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
              aria-label="Visualizar ${nome}"
            >
              <i data-lucide="eye"></i>
            </button>

            <button
              type="button"
              title="Editar"
              data-action="edit"
              aria-label="Editar ${nome}"
            >
              <i data-lucide="pencil"></i>
            </button>

          </div>
        </td>
      `


      tableBody.appendChild(
        tr
      )
    }
  )


  if (window.lucide) {
    window.lucide.createIcons()
  }
}


/* =========================================
   EVENTOS DOS FILTROS
========================================= */

searchInput?.addEventListener(
  "input",
  aplicarFiltros
)


neighborhoodFilter
  ?.addEventListener(
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


clearFiltersButton
  ?.addEventListener(
    "click",
    function () {
      searchInput.value =
        ""

      neighborhoodFilter.value =
        ""

      streetFilter.value =
        ""

      if (userFilter) {
        userFilter.value =
          ""
      }

      periodFilter.value =
        ""

      aplicarFiltros()

      searchInput.focus()
    }
  )


/* =========================================
   AÇÕES
========================================= */

tableBody?.addEventListener(
  "click",
  function (event) {
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
      /*
       * Depois podemos criar
       * pessoa-detalhes.html.
       */

      const pessoa =
        pessoas.find(
          function (item) {
            return (
              String(item.id) ===
              String(pessoaId)
            )
          }
        )


      if (pessoa) {
        window.alert(
          [
            pessoa.nome_completo,
            `CPF: ${pessoa.cpf}`,
            `Telefone: ${
              formatarTelefone(
                pessoa.telefone
              )
            }`,
            `Localidade: ${
              nomeLocalidade(
                pessoa
              )
            }`,
            `Rua: ${
              nomeRua(
                pessoa
              )
            }`,
          ].join("\n")
        )
      }

      return
    }


    if (acao === "edit") {
      window.location.href =
        `novo-cadastro.html?id=${pessoaId}`
    }
  }
)


/* =========================================
   LOGOUT
========================================= */

logoutButton?.addEventListener(
  "click",
  function () {
    const confirmar =
      window.confirm(
        "Deseja realmente sair do sistema?"
      )

    if (confirmar) {
      fazerLogout()
    }
  }
)


notificationButton
  ?.addEventListener(
    "click",
    function () {
      window.alert(
        "Você não possui novas notificações no momento."
      )
    }
  )


/* =========================================
   INICIALIZAÇÃO
========================================= */

async function iniciarPagina() {
  try {
    usuarioAtual =
      await buscarUsuarioLogado()


    if (!usuarioAtual) {
      throw new Error(
        "Usuário não autenticado."
      )
    }


    preencherUsuario(
      usuarioAtual
    )


    await carregarPessoas()


  } catch (error) {
    console.error(
      "Erro ao iniciar página de pessoas:",
      error
    )


    limparSessao()


    window.location.href =
      "index.html"
  }
}


document.addEventListener(
  "DOMContentLoaded",
  iniciarPagina
)


if (window.lucide) {
  window.lucide.createIcons()
}