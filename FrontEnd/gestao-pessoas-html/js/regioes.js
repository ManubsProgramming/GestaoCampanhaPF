const locationsTree =
  document.querySelector("#locations-tree")

const locationSearchInput =
  document.querySelector("#location-search")

const locationsEmptyState =
  document.querySelector("#locations-empty-state")

const expandAllButton =
  document.querySelector("#expand-all")

const collapseAllButton =
  document.querySelector("#collapse-all")


const regionsTotal =
  document.querySelector("#regions-total")

const localitiesTotal =
  document.querySelector("#localities-total")

const streetsTotal =
  document.querySelector("#streets-total")


const openLocationModalButton =
  document.querySelector("#open-location-modal")

const closeLocationModalButton =
  document.querySelector("#close-location-modal")

const cancelLocationModalButton =
  document.querySelector("#cancel-location-modal")

const locationModal =
  document.querySelector("#location-modal")

const locationForm =
  document.querySelector("#location-form")

const locationTypeSelect =
  document.querySelector("#location-type")

const parentLocationField =
  document.querySelector("#parent-location-field")

const parentLocationLabel =
  document.querySelector("#parent-location-label")

const parentLocationSelect =
  document.querySelector("#parent-location")

const locationNameInput =
  document.querySelector("#location-name")

const locationMessage =
  document.querySelector("#location-message")

const saveLocationButton =
  document.querySelector("#save-location-button")


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


function escaparHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
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
    partes[partes.length - 1][0]
  ).toUpperCase()
}


function atualizarIcones() {
  if (window.lucide) {
    window.lucide.createIcons()
  }
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

function preencherUsuario(usuario) {
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
}


/* =========================================
   CARREGAR BANCO
========================================= */

async function carregarTudo() {
  const [
    respostaRegioes,
    respostaLocalidades,
    respostaRuas,
  ] = await Promise.all([
    apiFetch("/regioes/"),
    apiFetch("/localidades/"),
    apiFetch("/ruas/"),
  ])

  if (
    !respostaRegioes.ok ||
    !respostaLocalidades.ok ||
    !respostaRuas.ok
  ) {
    throw new Error(
      "Não foi possível carregar a organização territorial."
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

  atualizarResumo()

  renderizarArvore()
}


/* =========================================
   RESUMO
========================================= */

function atualizarResumo() {
  regionsTotal.textContent =
    regioes.length

  localitiesTotal.textContent =
    localidades.length

  streetsTotal.textContent =
    ruas.length
}


/* =========================================
   ÁRVORE
========================================= */

function renderizarArvore() {
  locationsTree.innerHTML = ""

  if (!regioes.length) {
    locationsEmptyState
      .classList
      .add("visible")

    return
  }

  locationsEmptyState
    .classList
    .remove("visible")


  regioes.forEach(
    function (regiao) {
      const locais =
        localidades.filter(
          function (localidade) {
            return (
              Number(localidade.regiao) ===
              Number(regiao.id)
            )
          }
        )


      const artigo =
        document.createElement(
          "article"
        )

      artigo.className =
        "region-item"

      artigo.dataset.id =
        regiao.id


      const textoPesquisa = [
        regiao.nome,

        ...locais.map(
          function (localidade) {
            return localidade.nome
          }
        ),

        ...ruas
          .filter(
            function (rua) {
              return locais.some(
                function (localidade) {
                  return (
                    Number(rua.localidade) ===
                    Number(localidade.id)
                  )
                }
              )
            }
          )
          .map(
            function (rua) {
              return rua.nome
            }
          ),
      ].join(" ")


      artigo.dataset.search =
        textoPesquisa


      artigo.innerHTML = `
        <div class="region-row">

          <button
            class="tree-toggle region-toggle"
            type="button"
            aria-expanded="false"
          >
            <i
              data-lucide="chevron-right"
            ></i>
          </button>

          <span
            class="tree-icon region-icon"
          >
            <i data-lucide="map"></i>
          </span>

          <div class="tree-information">

            <strong>
              ${escaparHtml(regiao.nome)}
            </strong>

            <span>
              ${locais.length}
              ${
                locais.length === 1
                  ? "localidade cadastrada"
                  : "localidades cadastradas"
              }
            </span>

          </div>

          <div class="people-count">

            <strong>
              ${Number(
                regiao.total_pessoas || 0
              )}
            </strong>

            <span>
              pessoas cadastradas
            </span>

          </div>

          <div class="tree-actions">

            <button
              class="add-locality"
              data-region-id="${regiao.id}"
              type="button"
              title="Adicionar localidade"
            >
              <i data-lucide="plus"></i>
            </button>

            <button
              class="edit-region"
              data-region-id="${regiao.id}"
              type="button"
              title="Editar região"
            >
              <i data-lucide="pencil"></i>
            </button>

            <button
              class="delete-region"
              data-region-id="${regiao.id}"
              type="button"
              title="Excluir região"
            >
              <i data-lucide="trash-2"></i>
            </button>

          </div>

        </div>

        <div class="region-children">
          ${criarHtmlLocalidades(locais)}
        </div>
      `


      locationsTree.appendChild(
        artigo
      )
    }
  )


  atualizarIcones()
}


/* =========================================
   LOCALIDADES
========================================= */

function criarHtmlLocalidades(lista) {
  if (!lista.length) {
    return `
      <div class="neighborhood-item">
        <div class="neighborhood-row">
          <div class="tree-information">
            <span>
              Nenhuma localidade cadastrada
            </span>
          </div>
        </div>
      </div>
    `
  }


  return lista
    .map(
      function (localidade) {
        const ruasLocal =
          ruas.filter(
            function (rua) {
              return (
                Number(rua.localidade) ===
                Number(localidade.id)
              )
            }
          )


        const tipo =
          localidade.tipo_nome ||
          (
            localidade.tipo === "COMUNIDADE"
              ? "Comunidade"
              : "Bairro"
          )


        return `
          <article
            class="neighborhood-item"
            data-localidade-id="${localidade.id}"
          >

            <div class="neighborhood-row">

              <button
                class="tree-toggle neighborhood-toggle"
                type="button"
                aria-expanded="false"
              >
                <i
                  data-lucide="chevron-right"
                ></i>
              </button>

              <span
                class="tree-icon neighborhood-icon"
              >
                <i data-lucide="map-pin"></i>
              </span>

              <div class="tree-information">

                <strong>
                  ${escaparHtml(localidade.nome)}
                </strong>

                <span>
                  ${escaparHtml(tipo)}
                  •
                  ${ruasLocal.length}
                  ${
                    ruasLocal.length === 1
                      ? "rua"
                      : "ruas"
                  }
                </span>

              </div>

              <div class="people-count">

                <strong>
                  ${Number(
                    localidade.total_pessoas || 0
                  )}
                </strong>

                <span>
                  pessoas cadastradas
                </span>

              </div>

              <div class="tree-actions">

                <button
                  class="add-street"
                  data-localidade-id="${localidade.id}"
                  type="button"
                  title="Adicionar rua"
                >
                  <i data-lucide="plus"></i>
                </button>

                <button
                  class="edit-locality"
                  data-localidade-id="${localidade.id}"
                  type="button"
                  title="Editar localidade"
                >
                  <i data-lucide="pencil"></i>
                </button>

                <button
                  class="delete-locality"
                  data-localidade-id="${localidade.id}"
                  type="button"
                  title="Excluir localidade"
                >
                  <i data-lucide="trash-2"></i>
                </button>

              </div>

            </div>

            <div class="neighborhood-children">
              ${criarHtmlRuas(ruasLocal)}
            </div>

          </article>
        `
      }
    )
    .join("")
}


/* =========================================
   RUAS
========================================= */

function criarHtmlRuas(lista) {
  if (!lista.length) {
    return `
      <div class="street-row">
        <div class="tree-information">
          <span>
            Nenhuma rua cadastrada
          </span>
        </div>
      </div>
    `
  }


  return lista
    .map(
      function (rua) {
        return `
          <div
            class="street-row"
            data-rua-id="${rua.id}"
          >

            <span class="street-line"></span>

            <span
              class="tree-icon street-icon"
            >
              <i data-lucide="route"></i>
            </span>

            <div class="tree-information">

              <strong>
                ${escaparHtml(rua.nome)}
              </strong>

              <span>
                Rua cadastrada no sistema
              </span>

            </div>

            <div class="people-count">

              <strong>
                ${Number(
                  rua.total_pessoas || 0
                )}
              </strong>

              <span>
                pessoas cadastradas
              </span>

            </div>

            <div class="tree-actions">

              <button
                class="edit-street"
                data-rua-id="${rua.id}"
                type="button"
                title="Editar rua"
              >
                <i data-lucide="pencil"></i>
              </button>

              <button
                class="delete-street"
                data-rua-id="${rua.id}"
                type="button"
                title="Excluir rua"
              >
                <i data-lucide="trash-2"></i>
              </button>

            </div>

          </div>
        `
      }
    )
    .join("")
}


/* =========================================
   EXPANDIR
========================================= */

function trocarToggle(
  botao,
  aberto
) {
  botao.innerHTML =
    aberto
      ? '<i data-lucide="chevron-down"></i>'
      : '<i data-lucide="chevron-right"></i>'

  botao.setAttribute(
    "aria-expanded",
    String(aberto)
  )

  atualizarIcones()
}


locationsTree?.addEventListener(
  "click",
  async function (event) {
    const botao =
      event.target.closest("button")

    if (!botao) {
      return
    }


    if (
      botao.classList.contains(
        "region-toggle"
      )
    ) {
      const artigo =
        botao.closest(".region-item")

      const filhos =
        artigo.querySelector(
          ":scope > .region-children"
        )

      const abrir =
        !filhos.classList.contains(
          "open"
        )

      filhos.classList.toggle(
        "open",
        abrir
      )

      trocarToggle(
        botao,
        abrir
      )

      return
    }


    if (
      botao.classList.contains(
        "neighborhood-toggle"
      )
    ) {
      const artigo =
        botao.closest(
          ".neighborhood-item"
        )

      const filhos =
        artigo.querySelector(
          ":scope > .neighborhood-children"
        )

      const abrir =
        !filhos.classList.contains(
          "open"
        )

      filhos.classList.toggle(
        "open",
        abrir
      )

      trocarToggle(
        botao,
        abrir
      )

      return
    }


    await tratarAcao(
      botao
    )
  }
)


/* =========================================
   PESQUISA
========================================= */

function filtrarArvore() {
  const busca =
    normalizar(
      locationSearchInput.value
    )

  let visiveis = 0


  document
    .querySelectorAll(".region-item")
    .forEach(
      function (item) {
        const texto =
          normalizar(
            item.dataset.search
          )

        const mostrar =
          !busca ||
          texto.includes(busca)

        item.hidden =
          !mostrar

        if (mostrar) {
          visiveis += 1
        }
      }
    )


  locationsEmptyState
    .classList
    .toggle(
      "visible",
      visiveis === 0
    )
}


locationSearchInput?.addEventListener(
  "input",
  filtrarArvore
)


/* =========================================
   EXPANDIR TUDO
========================================= */

expandAllButton?.addEventListener(
  "click",
  function () {
    document
      .querySelectorAll(
        ".region-children, .neighborhood-children"
      )
      .forEach(
        function (elemento) {
          elemento.classList.add(
            "open"
          )
        }
      )

    document
      .querySelectorAll(
        ".tree-toggle"
      )
      .forEach(
        function (botao) {
          trocarToggle(
            botao,
            true
          )
        }
      )
  }
)


collapseAllButton?.addEventListener(
  "click",
  function () {
    document
      .querySelectorAll(
        ".region-children, .neighborhood-children"
      )
      .forEach(
        function (elemento) {
          elemento.classList.remove(
            "open"
          )
        }
      )

    document
      .querySelectorAll(
        ".tree-toggle"
      )
      .forEach(
        function (botao) {
          trocarToggle(
            botao,
            false
          )
        }
      )
  }
)


/* =========================================
   MODAL
========================================= */

function abrirModal(
  tipo = "",
  parentId = ""
) {
  locationForm.reset()

  locationMessage.textContent = ""

  locationTypeSelect.value =
    tipo

  atualizarPais(
    tipo
  )

  if (parentId) {
    parentLocationSelect.value =
      String(parentId)
  }

  locationModal.classList.add(
    "visible"
  )

  document.body.style.overflow =
    "hidden"
}


function fecharModal() {
  locationModal.classList.remove(
    "visible"
  )

  document.body.style.overflow =
    ""
}


openLocationModalButton?.addEventListener(
  "click",
  function () {
    abrirModal()
  }
)


closeLocationModalButton?.addEventListener(
  "click",
  fecharModal
)


cancelLocationModalButton?.addEventListener(
  "click",
  fecharModal
)


/* =========================================
   PAIS
========================================= */

function atualizarPais(tipo) {
  parentLocationSelect.innerHTML = `
    <option value="">
      Selecione
    </option>
  `


  if (
    !tipo ||
    tipo === "REGIAO"
  ) {
    parentLocationField.classList.add(
      "hidden"
    )

    parentLocationSelect.required =
      false

    return
  }


  parentLocationField.classList.remove(
    "hidden"
  )

  parentLocationSelect.required =
    true


  if (
    tipo === "BAIRRO" ||
    tipo === "COMUNIDADE"
  ) {
    parentLocationLabel.textContent =
      "Região"

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

        parentLocationSelect
          .appendChild(option)
      }
    )

    return
  }


  if (tipo === "RUA") {
    parentLocationLabel.textContent =
      "Localidade"

    localidades.forEach(
      function (localidade) {
        const option =
          document.createElement(
            "option"
          )

        option.value =
          localidade.id

        option.textContent =
          `${localidade.nome} - ${localidade.regiao_nome}`

        parentLocationSelect
          .appendChild(option)
      }
    )
  }
}


locationTypeSelect?.addEventListener(
  "change",
  function () {
    atualizarPais(
      locationTypeSelect.value
    )
  }
)


/* =========================================
   CADASTRAR
========================================= */

locationForm?.addEventListener(
  "submit",
  async function (event) {
    event.preventDefault()


    const tipo =
      locationTypeSelect.value

    const nome =
      locationNameInput
        .value
        .trim()

    const pai =
      parentLocationSelect.value


    if (!tipo || !nome) {
      locationMessage.textContent =
        "Preencha os campos obrigatórios."

      return
    }


    let endpoint
    let dados


    if (tipo === "REGIAO") {
      endpoint =
        "/regioes/"

      dados = {
        nome,
        ativa: true,
      }

    } else if (
      tipo === "BAIRRO" ||
      tipo === "COMUNIDADE"
    ) {
      endpoint =
        "/localidades/"

      dados = {
        regiao:
          Number(pai),

        nome,

        tipo,

        ativa: true,
      }

    } else {
      endpoint =
        "/ruas/"

      dados = {
        localidade:
          Number(pai),

        nome,

        ativa: true,
      }
    }


    saveLocationButton.disabled =
      true

    saveLocationButton.textContent =
      "Salvando..."


    try {
      window.SystemModal
        ?.loading
        .show(
          "Salvando local..."
        )


      const response =
        await apiFetch(
          endpoint,
          {
            method: "POST",

            body:
              JSON.stringify(
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
          // sem JSON
        }


        const primeira =
          Object.values(
            erro
          )[0]


        throw new Error(
          Array.isArray(primeira)
            ? primeira[0]
            : (
              erro.detail ||
              "Não foi possível salvar."
            )
        )
      }


      fecharModal()

      await carregarTudo()


      if (window.SystemModal) {
        await SystemModal.success(
          "Local cadastrado com sucesso.",
          "Cadastro realizado"
        )
      }


    } catch (error) {
      console.error(error)

      locationMessage.textContent =
        error.message

    } finally {
      window.SystemModal
        ?.loading
        .hide()

      saveLocationButton.disabled =
        false

      saveLocationButton.textContent =
        "Salvar local"
    }
  }
)


/* =========================================
   AÇÕES
========================================= */

async function tratarAcao(botao) {

  if (
    botao.classList.contains(
      "add-locality"
    )
  ) {
    abrirModal(
      "BAIRRO",
      botao.dataset.regionId
    )

    return
  }


  if (
    botao.classList.contains(
      "add-street"
    )
  ) {
    abrirModal(
      "RUA",
      botao.dataset.localidadeId
    )

    return
  }


  if (
    botao.classList.contains(
      "edit-region"
    )
  ) {
    await editarRegiao(
      botao.dataset.regionId
    )

    return
  }


  if (
    botao.classList.contains(
      "edit-locality"
    )
  ) {
    await editarLocalidade(
      botao.dataset.localidadeId
    )

    return
  }


  if (
    botao.classList.contains(
      "edit-street"
    )
  ) {
    await editarRua(
      botao.dataset.ruaId
    )

    return
  }


  if (
    botao.classList.contains(
      "delete-region"
    )
  ) {
    await excluirRegistro(
      "/regioes/",
      botao.dataset.regionId,
      "região"
    )

    return
  }


  if (
    botao.classList.contains(
      "delete-locality"
    )
  ) {
    await excluirRegistro(
      "/localidades/",
      botao.dataset.localidadeId,
      "localidade"
    )

    return
  }


  if (
    botao.classList.contains(
      "delete-street"
    )
  ) {
    await excluirRegistro(
      "/ruas/",
      botao.dataset.ruaId,
      "rua"
    )
  }
}


/* =========================================
   EDITAR
========================================= */

async function solicitarNovoNome(
  titulo,
  atual
) {
  const nome =
    window.prompt(
      titulo,
      atual
    )

  if (
    nome === null ||
    !nome.trim()
  ) {
    return null
  }

  return nome.trim()
}


async function editarRegiao(id) {
  const regiao =
    regioes.find(
      item =>
        Number(item.id) ===
        Number(id)
    )

  if (!regiao) {
    return
  }


  const nome =
    await solicitarNovoNome(
      "Novo nome da região:",
      regiao.nome
    )

  if (!nome) {
    return
  }


  await atualizarRegistro(
    `/regioes/${id}/`,
    {
      nome,
    }
  )
}


async function editarLocalidade(id) {
  const localidade =
    localidades.find(
      item =>
        Number(item.id) ===
        Number(id)
    )

  if (!localidade) {
    return
  }


  const nome =
    await solicitarNovoNome(
      "Novo nome da localidade:",
      localidade.nome
    )

  if (!nome) {
    return
  }


  await atualizarRegistro(
    `/localidades/${id}/`,
    {
      nome,
    }
  )
}


async function editarRua(id) {
  const rua =
    ruas.find(
      item =>
        Number(item.id) ===
        Number(id)
    )

  if (!rua) {
    return
  }


  const nome =
    await solicitarNovoNome(
      "Novo nome da rua:",
      rua.nome
    )

  if (!nome) {
    return
  }


  await atualizarRegistro(
    `/ruas/${id}/`,
    {
      nome,
    }
  )
}


async function atualizarRegistro(
  endpoint,
  dados
) {
  try {
    const response =
      await apiFetch(
        endpoint,
        {
          method: "PATCH",

          body:
            JSON.stringify(
              dados
            ),
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


    await carregarTudo()


    if (window.SystemModal) {
      await SystemModal.success(
        "Alteração salva com sucesso."
      )
    }


  } catch (error) {
    console.error(error)

    if (window.SystemModal) {
      await SystemModal.alert({
        title: "Erro",
        message: error.message,
        type: "warning",
      })
    }
  }
}


/* =========================================
   EXCLUIR
========================================= */

async function excluirRegistro(
  base,
  id,
  tipo
) {
  let confirmado = true


  if (window.SystemModal) {
    confirmado =
      await SystemModal.confirm({
        title:
          `Excluir ${tipo}?`,

        message:
          `Deseja realmente excluir esta ${tipo}?`,

        confirmText:
          "Sim, excluir",

        cancelText:
          "Cancelar",

        type:
          "danger",
      })
  }


  if (!confirmado) {
    return
  }


  try {
    const response =
      await apiFetch(
        `${base}${id}/`,
        {
          method: "DELETE",
        }
      )


    if (!response.ok) {
      let erro = {}

      try {
        erro =
          await response.json()
      } catch {
        // sem JSON
      }


      throw new Error(
        erro.detail ||
        (
          "Não foi possível excluir. " +
          "O local pode estar sendo utilizado em cadastros."
        )
      )
    }


    await carregarTudo()


    if (window.SystemModal) {
      await SystemModal.success(
        "Registro excluído com sucesso."
      )
    }


  } catch (error) {
    console.error(error)

    if (window.SystemModal) {
      await SystemModal.alert({
        title:
          "Não foi possível excluir",

        message:
          error.message,

        type:
          "warning",
      })
    }
  }
}


/* =========================================
   INICIAR
========================================= */

async function iniciarPagina() {
  try {
    usuarioAtual =
      await buscarUsuarioLogado()


    if (!usuarioAtual) {
      window.location.href =
        "index.html"

      return
    }


    preencherUsuario(
      usuarioAtual
    )


    await carregarTudo()


    atualizarIcones()


  } catch (error) {
    console.error(
      "Erro ao carregar regiões:",
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