const userSearchInput =
  document.querySelector(
    "#user-search-input"
  )

const userStatusFilter =
  document.querySelector(
    "#user-status-filter"
  )

const usersListContainer =
  document.querySelector(
    "#users-list"
  )

const visibleUsersTotal =
  document.querySelector(
    "#visible-users"
  )

const usersEmptyState =
  document.querySelector(
    "#users-empty-state"
  )


const totalUsers =
  document.querySelector(
    "#total-users"
  )

const activeUsers =
  document.querySelector(
    "#active-users"
  )

const inactiveUsers =
  document.querySelector(
    "#inactive-users"
  )


const rankingContainer =
  document.querySelector(
    "#user-ranking"
  )

const activityToday =
  document.querySelector(
    "#activity-today"
  )

const activityWeek =
  document.querySelector(
    "#activity-week"
  )

const activityMonth =
  document.querySelector(
    "#activity-month"
  )


const openUserModalButton =
  document.querySelector(
    "#open-user-modal"
  )

const closeUserModalButton =
  document.querySelector(
    "#close-user-modal"
  )

const cancelUserModalButton =
  document.querySelector(
    "#cancel-user-modal"
  )

const userModal =
  document.querySelector(
    "#user-modal"
  )

const newUserForm =
  document.querySelector(
    "#new-user-form"
  )


const firstNameInput =
  document.querySelector(
    "#new-user-first-name"
  )

const lastNameInput =
  document.querySelector(
    "#new-user-last-name"
  )

const usernameInput =
  document.querySelector(
    "#new-user-username"
  )

const emailInput =
  document.querySelector(
    "#new-user-email"
  )

const phoneInput =
  document.querySelector(
    "#new-user-phone"
  )

const typeInput =
  document.querySelector(
    "#new-user-type"
  )

const passwordInput =
  document.querySelector(
    "#new-user-password"
  )

const newUserMessage =
  document.querySelector(
    "#new-user-message"
  )

const saveUserButton =
  document.querySelector(
    "#save-user-button"
  )


const sidebar =
  document.querySelector(
    "#sidebar"
  )

const menuOverlay =
  document.querySelector(
    "#menu-overlay"
  )

const openMenuButton =
  document.querySelector(
    "#open-menu"
  )

const closeMenuButton =
  document.querySelector(
    "#close-menu"
  )

const loggedUser =
  document.querySelector(
    "#logged-user"
  )


let usuarios = []
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


function obterNome(usuario) {
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
    return "US"
  }

  if (partes.length === 1) {
    return partes[0]
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    partes[0][0] +
    partes[
      partes.length - 1
    ][0]
  ).toUpperCase()
}


/* =========================================
   MENU
========================================= */

function abrirMenu() {
  sidebar?.classList.add(
    "open"
  )

  menuOverlay?.classList.add(
    "visible"
  )

  document.body.style.overflow =
    "hidden"
}


function fecharMenu() {
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
   ADMINISTRADOR LOGADO
========================================= */

function preencherAdministrador(
  usuario
) {
  const nome =
    obterNome(usuario)

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

  document
    .querySelectorAll(
      ".sidebar-user-info span, .profile-info small"
    )
    .forEach(function (elemento) {
      elemento.textContent =
        "Administrador geral"
    })
}


/* =========================================
   BUSCAR USUÁRIOS
========================================= */

async function carregarUsuarios() {
  const response =
    await apiFetch(
      "/usuarios/"
    )

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error(
        "Somente administradores podem acessar usuários."
      )
    }

    throw new Error(
      "Não foi possível carregar os usuários."
    )
  }

  const dados =
    await response.json()

  usuarios =
    obterLista(dados)

  atualizarResumo()
  atualizarAtividade()
  renderizarRanking()
  aplicarFiltros()
}


/* =========================================
   RESUMO
========================================= */

function atualizarResumo() {
  const ativos =
    usuarios.filter(
      function (usuario) {
        return (
          usuario.ativo &&
          usuario.is_active
        )
      }
    )

  const inativos =
    usuarios.filter(
      function (usuario) {
        return (
          !usuario.ativo ||
          !usuario.is_active
        )
      }
    )

  if (totalUsers) {
    totalUsers.textContent =
      usuarios.length
  }

  if (activeUsers) {
    activeUsers.textContent =
      ativos.length
  }

  if (inactiveUsers) {
    inactiveUsers.textContent =
      inativos.length
  }
}


/* =========================================
   ATIVIDADE
========================================= */

function atualizarAtividade() {
  const cadastradores =
    usuarios.filter(
      function (usuario) {
        return (
          usuario.tipo ===
          "CADASTRADOR"
        )
      }
    )

  const hoje =
    cadastradores.reduce(
      function (total, usuario) {
        return (
          total +
          Number(
            usuario.cadastros_hoje || 0
          )
        )
      },
      0
    )

  const semana =
    cadastradores.reduce(
      function (total, usuario) {
        return (
          total +
          Number(
            usuario.cadastros_semana || 0
          )
        )
      },
      0
    )

  const mes =
    cadastradores.reduce(
      function (total, usuario) {
        return (
          total +
          Number(
            usuario.cadastros_mes || 0
          )
        )
      },
      0
    )

  activityToday.textContent =
    hoje

  activityWeek.textContent =
    semana

  activityMonth.textContent =
    mes
}


/* =========================================
   RANKING
========================================= */

function renderizarRanking() {
  rankingContainer.innerHTML =
    ""

  const ranking =
    usuarios
      .filter(
        function (usuario) {
          return (
            usuario.tipo ===
            "CADASTRADOR"
          )
        }
      )
      .sort(
        function (a, b) {
          return (
            Number(
              b.total_cadastros || 0
            )
            -
            Number(
              a.total_cadastros || 0
            )
          )
        }
      )

  if (!ranking.length) {
    rankingContainer.innerHTML = `
      <p>
        Nenhum cadastrador encontrado.
      </p>
    `

    return
  }

  ranking
    .slice(0, 10)
    .forEach(
      function (
        usuario,
        indice
      ) {
        const nome =
          obterNome(usuario)

        const iniciais =
          obterIniciais(nome)

        let classePosicao = ""

        if (indice === 0) {
          classePosicao =
            "first"
        }

        if (indice === 1) {
          classePosicao =
            "second"
        }

        if (indice === 2) {
          classePosicao =
            "third"
        }

        const link =
          document.createElement(
            "a"
          )

        link.className =
          "ranking-user-item"

        link.href =
          `usuario-detalhes.html?id=${usuario.id}`

        link.innerHTML = `
          <span
            class="
              position
              ${classePosicao}
            "
          >
            ${indice + 1}º
          </span>

          <span
            class="user-list-avatar"
          >
            ${escaparHtml(iniciais)}
          </span>

          <span
            class="ranking-user-data"
          >
            <strong>
              ${escaparHtml(nome)}
            </strong>

            <small>
              ${Number(
                usuario.total_cadastros || 0
              )}
              pessoas cadastradas
            </small>
          </span>

          <span
            class="ranking-number"
          >
            ${Number(
              usuario.total_cadastros || 0
            )}
          </span>

          <i
            data-lucide="chevron-right"
          ></i>
        `

        rankingContainer
          .appendChild(link)
      }
    )

  if (window.lucide) {
    window.lucide.createIcons()
  }
}


/* =========================================
   LISTA
========================================= */

function renderizarUsuarios(lista) {
  usersListContainer.innerHTML =
    ""

  visibleUsersTotal.textContent =
    lista.length

  if (!lista.length) {
    usersEmptyState
      ?.classList
      .add("visible")

    return
  }

  usersEmptyState
    ?.classList
    .remove("visible")

  lista.forEach(
    function (usuario) {
      const nome =
        obterNome(usuario)

      const iniciais =
        obterIniciais(nome)

      const ativo =
        Boolean(
          usuario.ativo &&
          usuario.is_active
        )

      const tipo =
        usuario.tipo ===
          "ADMINISTRADOR"
          ? "Administrador"
          : "Cadastrador"

      const card =
        document.createElement(
          "article"
        )

      card.className =
        "registered-user"

      card.dataset.name =
        nome

      card.dataset.status =
        ativo
          ? "Ativo"
          : "Inativo"

      card.innerHTML = `
        <span
          class="user-list-avatar"
        >
          ${escaparHtml(iniciais)}
        </span>

        <div
          class="registered-user-data"
        >
          <strong>
            ${escaparHtml(nome)}
          </strong>

          <span>
            ${
              usuario.email
                ? escaparHtml(
                    usuario.email
                  )
                : `@${escaparHtml(
                    usuario.username
                  )}`
            }
          </span>

          <small>
            ${tipo}
          </small>
        </div>

        <div
          class="user-registration-data"
        >
          <span>
            Pessoas cadastradas
          </span>

          <strong>
            ${Number(
              usuario.total_cadastros || 0
            )}
          </strong>
        </div>

        <span
          class="
            user-status
            ${
              ativo
                ? "active"
                : "inactive"
            }
          "
        >
          ${
            ativo
              ? "Ativo"
              : "Inativo"
          }
        </span>

        <a
          href="usuario-detalhes.html?id=${usuario.id}"
          class="user-details-button"
        >
          Ver detalhes

          <i
            data-lucide="arrow-right"
          ></i>
        </a>
      `

      usersListContainer
        .appendChild(card)
    }
  )

  if (window.lucide) {
    window.lucide.createIcons()
  }
}


/* =========================================
   FILTROS
========================================= */

function aplicarFiltros() {
  const pesquisa =
    normalizar(
      userSearchInput?.value
    )

  const statusSelecionado =
    userStatusFilter?.value ||
    ""

  const filtrados =
    usuarios.filter(
      function (usuario) {
        const nome =
          normalizar(
            obterNome(usuario)
          )

        const username =
          normalizar(
            usuario.username
          )

        const email =
          normalizar(
            usuario.email
          )

        const ativo =
          Boolean(
            usuario.ativo &&
            usuario.is_active
          )

        const status =
          ativo
            ? "Ativo"
            : "Inativo"

        const correspondePesquisa =
          !pesquisa ||
          nome.includes(pesquisa) ||
          username.includes(pesquisa) ||
          email.includes(pesquisa)

        const correspondeStatus =
          !statusSelecionado ||
          status ===
            statusSelecionado

        return (
          correspondePesquisa &&
          correspondeStatus
        )
      }
    )

  renderizarUsuarios(
    filtrados
  )
}


userSearchInput?.addEventListener(
  "input",
  aplicarFiltros
)


userStatusFilter?.addEventListener(
  "change",
  aplicarFiltros
)


/* =========================================
   MODAL NOVO USUÁRIO
========================================= */

function abrirModalUsuario() {
  newUserForm?.reset()

  if (newUserMessage) {
    newUserMessage.textContent =
      ""
  }

  userModal?.classList.add(
    "visible"
  )

  document.body.style.overflow =
    "hidden"

  setTimeout(
    function () {
      firstNameInput?.focus()
    },
    100
  )
}


function fecharModalUsuario() {
  userModal?.classList.remove(
    "visible"
  )

  document.body.style.overflow =
    ""
}


openUserModalButton?.addEventListener(
  "click",
  abrirModalUsuario
)


closeUserModalButton?.addEventListener(
  "click",
  fecharModalUsuario
)


cancelUserModalButton?.addEventListener(
  "click",
  fecharModalUsuario
)


userModal?.addEventListener(
  "click",
  function (event) {
    if (
      event.target ===
      userModal
    ) {
      fecharModalUsuario()
    }
  }
)


/* =========================================
   CADASTRAR USUÁRIO
========================================= */

newUserForm?.addEventListener(
  "submit",
  async function (event) {
    event.preventDefault()

    const dados = {
      first_name:
        firstNameInput
          .value
          .trim(),

      last_name:
        lastNameInput
          .value
          .trim(),

      username:
        usernameInput
          .value
          .trim(),

      email:
        emailInput
          .value
          .trim(),

      telefone:
        phoneInput
          .value
          .trim(),

      tipo:
        typeInput.value,

      password:
        passwordInput.value,
    }

    if (
      !dados.first_name ||
      !dados.username ||
      !dados.tipo ||
      !dados.password
    ) {
      newUserMessage.textContent =
        "Preencha todos os campos obrigatórios."

      return
    }

    if (
      dados.password.length < 8
    ) {
      newUserMessage.textContent =
        "A senha deve possuir pelo menos 8 caracteres."

      return
    }

    saveUserButton.disabled =
      true

    saveUserButton.textContent =
      "Salvando..."

    newUserMessage.textContent =
      ""

    if (
      window.SystemModal?.loading
    ) {
      SystemModal.loading.show(
        "Cadastrando usuário..."
      )
    }

    try {
      const response =
        await apiFetch(
          "/usuarios/",
          {
            method: "POST",

            body: JSON.stringify(
              dados
            ),
          }
        )

      if (!response.ok) {
        let erro = {}

        try {
          erro =
            await response.json()
        } catch {
          // sem json
        }

        const primeiraMensagem =
          Object.values(
            erro
          )[0]

        if (
          Array.isArray(
            primeiraMensagem
          )
        ) {
          throw new Error(
            primeiraMensagem[0]
          )
        }

        throw new Error(
          erro.detail ||
          "Não foi possível criar o usuário."
        )
      }

      fecharModalUsuario()

      await carregarUsuarios()

      if (
        window.SystemModal
      ) {
        await SystemModal.success(
          "O usuário foi cadastrado com sucesso.",
          "Usuário cadastrado"
        )
      } else {
        window.alert(
          "Usuário cadastrado com sucesso."
        )
      }

    } catch (error) {
      console.error(
        "Erro ao criar usuário:",
        error
      )

      newUserMessage.textContent =
        error.message

    } finally {
      if (
        window.SystemModal?.loading
      ) {
        SystemModal.loading.hide()
      }

      saveUserButton.disabled =
        false

      saveUserButton.textContent =
        "Salvar usuário"
    }
  }
)


/* =========================================
   TECLADO
========================================= */

document.addEventListener(
  "keydown",
  function (event) {
    if (
      event.key === "Escape" &&
      userModal
        ?.classList
        .contains("visible")
    ) {
      fecharModalUsuario()
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

    preencherAdministrador(
      usuarioAtual
    )

    await carregarUsuarios()

    if (window.lucide) {
      window.lucide.createIcons()
    }

  } catch (error) {
    console.error(
      "Erro ao iniciar usuários:",
      error
    )

    if (
      window.SystemModal
    ) {
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