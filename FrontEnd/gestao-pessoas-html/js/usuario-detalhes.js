const detailsPageParameters =
  new URLSearchParams(
    window.location.search
  )

const selectedUserId =
  detailsPageParameters.get("id")


const detailsAvatar =
  document.querySelector("#details-avatar")

const detailsName =
  document.querySelector("#details-name")

const detailsEmail =
  document.querySelector("#details-email")

const detailsStatus =
  document.querySelector("#details-status")

const totalRegistrations =
  document.querySelector("#total-registrations")

const todayRegistrations =
  document.querySelector("#today-registrations")

const weekRegistrations =
  document.querySelector("#week-registrations")

const monthRegistrations =
  document.querySelector("#month-registrations")

const neighborhoodChart =
  document.querySelector("#user-neighborhood-chart")

const userStreetList =
  document.querySelector("#user-street-list")

const detailsSearchInput =
  document.querySelector("#details-search-input")

const detailsTableBody =
  document.querySelector("#details-table-body")

const visibleRegisteredPeople =
  document.querySelector("#visible-registered-people")

const detailsEmptyState =
  document.querySelector("#details-empty-state")

const editUserButton =
  document.querySelector("#edit-user-button")

const logoutButton =
  document.querySelector("#logout-button")

const loggedUser =
  document.querySelector("#logged-user")

const notificationButton =
  document.querySelector(".notification-button")


let usuarioDetalhado = null
let pessoasDoUsuario = []


function obterLista(dados) {
  if (Array.isArray(dados)) {
    return dados
  }

  return dados?.results || []
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
    partes[partes.length - 1][0]
  ).toUpperCase()
}


function normalizeDetailsText(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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


function formatarTelefone(telefone) {
  if (!telefone) {
    return "-"
  }

  const numeros =
    telefone.replace(/\D/g, "")

  if (numeros.length === 11) {
    return numeros.replace(
      /^(\d{2})(\d{5})(\d{4})$/,
      "($1) $2-$3"
    )
  }

  return telefone
}


function nomeLocalidade(pessoa) {
  return (
    pessoa.localidade_nome ||
    "-"
  )
}


function nomeRua(pessoa) {
  return (
    pessoa.rua_nome ||
    "-"
  )
}


async function carregarUsuario() {
  if (!selectedUserId) {
    throw new Error(
      "Usuário não informado."
    )
  }

  const response =
    await apiFetch(
      `/usuarios/${selectedUserId}/`
    )

  if (!response.ok) {
    throw new Error(
      "Usuário não encontrado."
    )
  }

  usuarioDetalhado =
    await response.json()

  carregarPerfil()
}


function carregarPerfil() {
  const nome =
    obterNome(
      usuarioDetalhado
    )

  const ativo =
    Boolean(
      usuarioDetalhado.ativo &&
      usuarioDetalhado.is_active
    )

  document.title =
    `${nome} | Gestão de Cadastros`

  detailsAvatar.textContent =
    obterIniciais(nome)

  detailsName.textContent =
    nome

  detailsEmail.textContent =
    usuarioDetalhado.email ||
    `@${usuarioDetalhado.username}`

  detailsStatus.textContent =
    ativo
      ? "Ativo"
      : "Inativo"

  detailsStatus.className =
    ativo
      ? "details-status active"
      : "details-status inactive"
}


async function carregarPessoas() {
  const response =
    await apiFetch(
      `/pessoas/?cadastrada_por=${selectedUserId}`
    )

  if (!response.ok) {
    throw new Error(
      "Não foi possível carregar os cadastros."
    )
  }

  const dados =
    await response.json()

  pessoasDoUsuario =
    obterLista(dados)

  carregarEstatisticas()
  carregarLocalidades()
  carregarRuas()

  renderizarPessoas(
    pessoasDoUsuario
  )
}


function carregarEstatisticas() {
  const agora =
    new Date()

  const seteDias =
    7 *
    24 *
    60 *
    60 *
    1000

  const hoje =
    pessoasDoUsuario.filter(
      function (pessoa) {
        if (!pessoa.criado_em) {
          return false
        }

        const data =
          new Date(
            pessoa.criado_em
          )

        return (
          data.getDate() ===
            agora.getDate() &&
          data.getMonth() ===
            agora.getMonth() &&
          data.getFullYear() ===
            agora.getFullYear()
        )
      }
    ).length

  const semana =
    pessoasDoUsuario.filter(
      function (pessoa) {
        if (!pessoa.criado_em) {
          return false
        }

        const data =
          new Date(
            pessoa.criado_em
          )

        const diferenca =
          agora.getTime() -
          data.getTime()

        return (
          diferenca >= 0 &&
          diferenca <= seteDias
        )
      }
    ).length

  const mes =
    pessoasDoUsuario.filter(
      function (pessoa) {
        if (!pessoa.criado_em) {
          return false
        }

        const data =
          new Date(
            pessoa.criado_em
          )

        return (
          data.getMonth() ===
            agora.getMonth() &&
          data.getFullYear() ===
            agora.getFullYear()
        )
      }
    ).length

  totalRegistrations.textContent =
    pessoasDoUsuario.length

  todayRegistrations.textContent =
    hoje

  weekRegistrations.textContent =
    semana

  monthRegistrations.textContent =
    mes
}


function carregarLocalidades() {
  const contagem = {}

  pessoasDoUsuario.forEach(
    function (pessoa) {
      const nome =
        nomeLocalidade(pessoa)

      contagem[nome] =
        (contagem[nome] || 0) + 1
    }
  )

  const lista =
    Object.entries(contagem)
      .sort(
        (a, b) =>
          b[1] - a[1]
      )

  neighborhoodChart.innerHTML =
    ""

  if (!lista.length) {
    neighborhoodChart.innerHTML =
      "<p>Nenhum cadastro.</p>"

    return
  }

  const maior =
    lista[0][1]

  lista.forEach(
    function ([nome, total]) {
      const percentual =
        Math.round(
          (total / maior) * 100
        )

      const item =
        document.createElement("div")

      item.className =
        "details-bar-item"

      item.innerHTML = `
        <div>
          <span>
            ${nome}
          </span>

          <strong>
            ${total}
          </strong>
        </div>

        <div class="details-bar-track">
          <div
            class="details-bar-fill"
            style="width: ${percentual}%"
          ></div>
        </div>
      `

      neighborhoodChart.appendChild(
        item
      )
    }
  )
}


function carregarRuas() {
  const contagem = {}

  pessoasDoUsuario.forEach(
    function (pessoa) {
      const rua =
        nomeRua(pessoa)

      const localidade =
        nomeLocalidade(pessoa)

      const chave =
        `${rua}|||${localidade}`

      contagem[chave] =
        (contagem[chave] || 0) + 1
    }
  )

  const lista =
    Object.entries(contagem)
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .slice(0, 10)

  userStreetList.innerHTML =
    ""

  if (!lista.length) {
    userStreetList.innerHTML =
      "<p>Nenhum cadastro.</p>"

    return
  }

  lista.forEach(
    function ([chave, total]) {
      const [
        rua,
        localidade,
      ] = chave.split("|||")

      const item =
        document.createElement("div")

      item.innerHTML = `
        <span>
          <strong>
            ${rua}
          </strong>

          <small>
            ${localidade}
          </small>
        </span>

        <b>
          ${total}
        </b>
      `

      userStreetList.appendChild(
        item
      )
    }
  )
}


function renderizarPessoas(lista) {
  detailsTableBody.innerHTML =
    ""

  visibleRegisteredPeople.textContent =
    lista.length

  if (!lista.length) {
    detailsEmptyState.classList.add(
      "visible"
    )

    return
  }

  detailsEmptyState.classList.remove(
    "visible"
  )

  lista.forEach(function (pessoa) {
    const ativo =
      pessoa.status === "ATIVO"

    const linha =
      document.createElement("tr")

    linha.dataset.person =
      pessoa.nome_completo

    linha.innerHTML = `
      <td data-label="Nome">
        <strong>
          ${pessoa.nome_completo}
        </strong>
      </td>

      <td data-label="Telefone">
        ${
          formatarTelefone(
            pessoa.telefone
          )
        }
      </td>

      <td data-label="Localidade">
        ${
          nomeLocalidade(pessoa)
        }
      </td>

      <td data-label="Rua">
        ${
          nomeRua(pessoa)
        }
      </td>

      <td data-label="Data">
        ${
          formatarData(
            pessoa.criado_em
          )
        }
      </td>

      <td data-label="Status">
        <span
          class="
            person-status
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
      </td>
    `

    detailsTableBody.appendChild(
      linha
    )
  })
}


function filtrarPessoas() {
  const pesquisa =
    normalizeDetailsText(
      detailsSearchInput.value
    )

  const filtradas =
    pessoasDoUsuario.filter(
      function (pessoa) {
        return normalizeDetailsText(
          pessoa.nome_completo
        ).includes(
          pesquisa
        )
      }
    )

  renderizarPessoas(
    filtradas
  )
}


detailsSearchInput?.addEventListener(
  "input",
  filtrarPessoas
)


editUserButton?.addEventListener(
  "click",
  async function () {
    const novoNome =
      window.prompt(
        "Nome:",
        usuarioDetalhado.first_name || ""
      )

    if (novoNome === null) {
      return
    }

    const novoSobrenome =
      window.prompt(
        "Sobrenome:",
        usuarioDetalhado.last_name || ""
      )

    if (novoSobrenome === null) {
      return
    }

    const novoEmail =
      window.prompt(
        "E-mail:",
        usuarioDetalhado.email || ""
      )

    if (novoEmail === null) {
      return
    }

    try {
      const response =
        await apiFetch(
          `/usuarios/${selectedUserId}/`,
          {
            method: "PATCH",

            body: JSON.stringify({
              first_name:
                novoNome.trim(),

              last_name:
                novoSobrenome.trim(),

              email:
                novoEmail.trim(),
            }),
          }
        )

      if (!response.ok) {
        const erro =
          await response.json()

        throw new Error(
          erro.detail ||
          "Não foi possível atualizar."
        )
      }

      usuarioDetalhado =
        await response.json()

      carregarPerfil()

      window.alert(
        "Usuário atualizado com sucesso."
      )

    } catch (error) {
      console.error(error)

      window.alert(
        error.message
      )
    }
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
    const usuarioLogado =
      await buscarUsuarioLogado()

    if (
      !usuarioLogado ||
      usuarioLogado.tipo !==
        "ADMINISTRADOR"
    ) {
      window.location.href =
        "pessoas.html"

      return
    }

    if (loggedUser) {
      loggedUser.textContent =
        obterNome(
          usuarioLogado
        )
    }

    if (!selectedUserId) {
      window.alert(
        "Usuário não informado."
      )

      window.location.href =
        "usuarios.html"

      return
    }

    await carregarUsuario()
    await carregarPessoas()

    if (window.lucide) {
      window.lucide.createIcons()
    }

  } catch (error) {
    console.error(
      "Erro ao iniciar detalhes:",
      error
    )

    window.alert(
      error.message
    )

    window.location.href =
      "usuarios.html"
  }
}


document.addEventListener(
  "DOMContentLoaded",
  iniciarPagina
)