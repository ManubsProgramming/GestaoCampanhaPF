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

const loggedUserType =
  document.querySelector("#logged-user-type")

const welcomeUser =
  document.querySelector("#welcome-user")

const sidebarUserName =
  document.querySelector("#sidebar-user-name")

const sidebarUserType =
  document.querySelector("#sidebar-user-type")

const sidebarAvatar =
  document.querySelector("#sidebar-avatar")

const profileAvatar =
  document.querySelector("#profile-avatar")

const notificationButton =
  document.querySelector(
    ".notification-button"
  )


/* =========================================
   MENU MOBILE
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
   USUÁRIO
========================================= */

function obterNomeUsuario(usuario) {
  if (!usuario) {
    return "Administrador"
  }

  const nomeCompleto = [
    usuario.first_name,
    usuario.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim()

  if (nomeCompleto) {
    return nomeCompleto
  }

  return (
    usuario.username ||
    "Administrador"
  )
}


function obterIniciais(nome) {
  if (!nome) {
    return "AD"
  }

  const palavras =
    nome
      .trim()
      .split(" ")
      .filter(Boolean)

  if (!palavras.length) {
    return "AD"
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


function preencherUsuario(usuario) {
  const nome =
    obterNomeUsuario(usuario)

  const iniciais =
    obterIniciais(nome)

  const tipo =
    usuario.tipo ===
    "ADMINISTRADOR"
      ? "Administrador geral"
      : "Cadastrador"


  if (loggedUser) {
    loggedUser.textContent =
      nome
  }

  if (welcomeUser) {
    welcomeUser.textContent =
      nome
  }

  if (sidebarUserName) {
    sidebarUserName.textContent =
      nome
  }

  if (loggedUserType) {
    loggedUserType.textContent =
      tipo
  }

  if (sidebarUserType) {
    sidebarUserType.textContent =
      tipo
  }

  if (sidebarAvatar) {
    sidebarAvatar.textContent =
      iniciais
  }

  if (profileAvatar) {
    profileAvatar.textContent =
      iniciais
  }
}


/* =========================================
   FUNÇÃO AUXILIAR
========================================= */

function definirTexto(
  id,
  valor
) {
  const elemento =
    document.getElementById(
      id
    )

  if (elemento) {
    elemento.textContent =
      valor
  }
}


/* =========================================
   RESUMO
========================================= */

function preencherResumo(
  resumo
) {
  if (!resumo) {
    return
  }

  definirTexto(
    "total-pessoas",
    resumo
      .total_pessoas_cadastradas
  )

  definirTexto(
    "cadastros-hoje",
    resumo.cadastros_hoje
  )

  definirTexto(
    "total-cadastradores",
    resumo
      .total_usuarios_cadastradores
  )

  definirTexto(
    "total-localidades",
    resumo
      .total_localidades_com_cadastros
  )

  definirTexto(
    "total-ruas",
    resumo
      .total_ruas_com_cadastros
  )

  definirTexto(
    "populacao-pessoas-cadastradas",
    Number(
      resumo
        .total_pessoas_cadastradas
    ).toLocaleString(
      "pt-BR"
    )
  )
}


/* =========================================
   POPULAÇÃO MUNICÍPIO
========================================= */

function preencherReferenciaMunicipio(
  referencia
) {
  if (!referencia) {
    return
  }

  definirTexto(
    "populacao-estimada",
    Number(
      referencia
        .populacao_estimada
    ).toLocaleString(
      "pt-BR"
    )
  )

  definirTexto(
    "percentual-cobertura",
    `${
      referencia
        .percentual_cobertura_cadastros
    }%`
  )

  definirTexto(
    "fonte-populacao",
    `${
      referencia.fonte
    } ${
      referencia
        .ano_referencia
    }`
  )

  definirTexto(
    "observacao-populacao",
    referencia.observacao
  )
}


/* =========================================
   LOCALIDADES
========================================= */

function preencherLocalidades(
  localidades
) {
  const container =
    document.querySelector(
      "#lista-localidades"
    )

  if (!container) {
    return
  }

  container.innerHTML = ""

  if (
    !localidades ||
    localidades.length === 0
  ) {
    container.innerHTML =
      `
        <p>
          Nenhum cadastro por
          localidade.
        </p>
      `

    return
  }

  const maior =
    Math.max(
      ...localidades.map(
        function (
          localidade
        ) {
          return (
            localidade.total
          )
        }
      )
    ) || 1


  localidades.forEach(
    function (
      localidade
    ) {
      const porcentagem =
        (
          localidade.total
          / maior
        ) * 100


      const item =
        document.createElement(
          "div"
        )

      item.className =
        "bar-item"


      item.innerHTML = `
        <div
          class="bar-information"
        >
          <span>
            ${localidade.nome}
          </span>

          <strong>
            ${localidade.total}
            cadastradas
          </strong>
        </div>

        <div
          class="bar-track"
        >
          <div
            class="bar-fill"
            style="
              width:
              ${porcentagem}%
            "
          ></div>
        </div>
      `

      container.appendChild(
        item
      )
    }
  )
}


/* =========================================
   RUAS
========================================= */

function preencherRuas(
  ruas
) {
  const container =
    document.querySelector(
      "#lista-ruas"
    )

  if (!container) {
    return
  }

  container.innerHTML = ""

  if (
    !ruas ||
    ruas.length === 0
  ) {
    container.innerHTML =
      `
        <p>
          Nenhuma rua com
          cadastros.
        </p>
      `

    return
  }


  ruas.forEach(
    function (rua) {

      const item =
        document.createElement(
          "div"
        )

      item.className =
        "street-item"


      item.innerHTML = `
        <div>
          <strong>
            ${rua.nome}
          </strong>

          <span>
            ${
              rua
                .localidade__nome
              || ""
            }
          </span>
        </div>

        <b>
          ${rua.total}
        </b>
      `

      container.appendChild(
        item
      )
    }
  )
}


/* =========================================
   RANKING
========================================= */

function preencherRanking(
  usuarios
) {
  const container =
    document.querySelector(
      "#ranking-cadastradores"
    )

  if (!container) {
    return
  }

  container.innerHTML = ""

  if (
    !usuarios ||
    usuarios.length === 0
  ) {
    container.innerHTML =
      `
        <p>
          Nenhum cadastrador
          no ranking.
        </p>
      `

    return
  }


  usuarios.forEach(
    function (
      usuario,
      indice
    ) {

      const nome =
        obterNomeUsuario(
          usuario
        )

      const iniciais =
        obterIniciais(
          nome
        )


      const item =
        document.createElement(
          "a"
        )

      item.href =
        `usuario-detalhes.html?id=${usuario.id}`

      item.className =
        "ranking-item"


      let classePosicao =
        ""

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


      item.innerHTML = `
        <span
          class="
            ranking-position
            ${classePosicao}
          "
        >
          ${indice + 1}º
        </span>

        <span
          class="ranking-avatar"
        >
          ${iniciais}
        </span>

        <span
          class="ranking-user"
        >
          <strong>
            ${nome}
          </strong>

          <small>
            ${
              usuario
                .total_cadastros
            }
            pessoas cadastradas
          </small>
        </span>

        <i
          data-lucide="
            chevron-right
          "
        ></i>
      `

      container.appendChild(
        item
      )
    }
  )


  if (window.lucide) {
    window.lucide.createIcons()
  }
}


/* =========================================
   CARREGAR DASHBOARD
========================================= */

async function carregarPainel() {
  try {

    const usuario =
      await buscarUsuarioLogado()


    if (!usuario) {
      throw new Error(
        "Usuário não autenticado."
      )
    }


    if (
      usuario.tipo !==
      "ADMINISTRADOR"
    ) {
      window.location.href =
        "pessoas.html"

      return
    }


    preencherUsuario(
      usuario
    )


    const response =
      await apiFetch(
        "/painel/dashboard/"
      )


    if (!response.ok) {
      throw new Error(
        `Erro ao carregar dashboard: ${response.status}`
      )
    }


    const dados =
      await response.json()


    console.log(
      "Dashboard recebido:",
      dados
    )


    preencherResumo(
      dados.resumo
    )


    preencherReferenciaMunicipio(
      dados
        .referencia_municipio
    )


    preencherLocalidades(
      dados
        .cadastros_por_localidade
    )


    preencherRuas(
      dados
        .cadastros_por_rua
    )


    preencherRanking(
      dados
        .quem_mais_cadastrou
    )

  } catch (error) {

    console.error(
      "Erro no painel:",
      error
    )


    limparSessao()


    window.location.href =
      "index.html"
  }
}


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


    if (!confirmar) {
      return
    }


    fazerLogout()
  }
)


/* =========================================
   NOTIFICAÇÕES
========================================= */

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
   FECHAR MENU MOBILE
========================================= */

document
  .querySelectorAll(
    ".sidebar-link"
  )
  .forEach(
    function (link) {

      link.addEventListener(
        "click",
        function () {

          if (
            window.innerWidth
            < 1024
          ) {
            closeMenu()
          }

        }
      )

    }
  )


/* =========================================
   INICIAR
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  carregarPainel
)


if (window.lucide) {
  window.lucide.createIcons()
}