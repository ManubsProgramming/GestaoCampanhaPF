const registrationForm =
  document.querySelector("#registration-form")

const fullNameInput =
  document.querySelector("#full-name")

const cpfInput =
  document.querySelector("#cpf")

const birthDateInput =
  document.querySelector("#birth-date")

const voterTitleInput =
  document.querySelector("#voter-title")

const phoneInput =
  document.querySelector("#phone")

const regionSelect =
  document.querySelector("#region")

const neighborhoodSelect =
  document.querySelector("#neighborhood")

const streetSelect =
  document.querySelector("#street")

const numberInput =
  document.querySelector("#number")

const complementInput =
  document.querySelector("#complement")

const observationsInput =
  document.querySelector("#observations")

const characterTotal =
  document.querySelector("#character-total")

const registeredBy =
  document.querySelector("#registered-by")

const saveButton =
  document.querySelector("#save-button")

const successModal =
  document.querySelector("#success-modal")

const newRegistrationButton =
  document.querySelector("#new-registration-button")

const validateCpfButton =
  document.querySelector("#validate-cpf-button")

const cpfConfirmed =
  document.querySelector("#cpf-confirmed")

const cpfValidationStatus =
  document.querySelector("#cpf-validation-status")


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


let usuarioAtual = null


/* =====================================================
   MENU MOBILE
===================================================== */

function openMenu() {
  sidebar?.classList.add("open")
  menuOverlay?.classList.add("visible")

  document.body.style.overflow = "hidden"
}


function closeMenu() {
  sidebar?.classList.remove("open")
  menuOverlay?.classList.remove("visible")

  document.body.style.overflow = ""
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


window.addEventListener(
  "resize",
  function () {
    if (window.innerWidth >= 1024) {
      closeMenu()
    }
  }
)


/* =====================================================
   USUÁRIO LOGADO
===================================================== */

function obterNomeUsuario(usuario) {
  if (!usuario) {
    return "Usuário"
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
    usuario.username ||
    "Usuário"
  )
}


function obterIniciais(nome) {
  const palavras = String(nome || "")
    .trim()
    .split(" ")
    .filter(Boolean)

  if (palavras.length === 0) {
    return "US"
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


function preencherUsuario(usuario) {
  const nome =
    obterNomeUsuario(usuario)

  const iniciais =
    obterIniciais(nome)

  const tipo =
    usuario.tipo === "ADMINISTRADOR"
      ? "Administrador geral"
      : "Cadastrador"

  if (registeredBy) {
    registeredBy.textContent = nome
  }

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
      ".sidebar-user-info span, .profile-info small"
    )
    .forEach(function (elemento) {
      elemento.textContent = tipo
    })

  document
    .querySelectorAll(
      ".user-avatar, .profile-avatar"
    )
    .forEach(function (elemento) {
      elemento.textContent = iniciais
    })
}


/* =====================================================
   MENU DO CADASTRADOR
===================================================== */

function configurarMenuPorPerfil(usuario) {
  if (
    usuario.tipo !== "CADASTRADOR"
  ) {
    return
  }

  const linksAdministrador = [
    'a[href="painel.html"]',
    'a[href="usuarios.html"]',
    'a[href="regioes.html"]',
    'a[href="relatorios.html"]',
    'a[href="auditoria.html"]',
    'a[href="configuracoes.html"]',
  ]

  document
    .querySelectorAll(
      linksAdministrador.join(", ")
    )
    .forEach(function (link) {
      link.style.display = "none"
    })
}


/* =====================================================
   TELEFONE
===================================================== */

phoneInput?.addEventListener(
  "input",
  function () {
    let numeros =
      phoneInput.value.replace(
        /\D/g,
        ""
      )

    numeros =
      numeros.slice(0, 11)

    if (numeros.length > 7) {
      phoneInput.value =
        numeros.replace(
          /^(\d{2})(\d{5})(\d{0,4})/,
          "($1) $2-$3"
        )

      return
    }

    if (numeros.length > 2) {
      phoneInput.value =
        numeros.replace(
          /^(\d{2})(\d{0,5})/,
          "($1) $2"
        )

      return
    }

    if (numeros.length > 0) {
      phoneInput.value =
        `(${numeros}`

      return
    }

    phoneInput.value = ""
  }
)


/* =====================================================
   CPF
===================================================== */

cpfInput?.addEventListener(
  "input",
  function () {
    let numeros =
      cpfInput.value.replace(
        /\D/g,
        ""
      )

    numeros =
      numeros.slice(0, 11)

    cpfInput.value =
      numeros
        .replace(
          /(\d{3})(\d)/,
          "$1.$2"
        )
        .replace(
          /(\d{3})(\d)/,
          "$1.$2"
        )
        .replace(
          /(\d{3})(\d{1,2})$/,
          "$1-$2"
        )

    resetarConfirmacaoCpf()
  }
)


birthDateInput?.addEventListener(
  "change",
  resetarConfirmacaoCpf
)


function resetarConfirmacaoCpf() {
  if (cpfConfirmed) {
    cpfConfirmed.checked = false
  }

  if (cpfValidationStatus) {
    cpfValidationStatus.textContent =
      "CPF ainda não conferido."

    cpfValidationStatus.classList.remove(
      "confirmed"
    )
  }
}


/* =====================================================
   ABRIR CONSULTA DA RECEITA
===================================================== */

validateCpfButton?.addEventListener(
  "click",
  function () {
    const cpf =
      cpfInput.value.replace(
        /\D/g,
        ""
      )

    const nascimento =
      birthDateInput.value

    if (cpf.length !== 11) {
      window.alert(
        "Informe um CPF com 11 dígitos antes de consultar."
      )

      cpfInput.focus()
      return
    }

    if (!nascimento) {
      window.alert(
        "Informe a data de nascimento antes de consultar."
      )

      birthDateInput.focus()
      return
    }

    sessionStorage.setItem(
      "cpfEmValidacao",
      cpf
    )

    sessionStorage.setItem(
      "nascimentoEmValidacao",
      nascimento
    )

    window.open(
      "https://servicos.receita.fazenda.gov.br/servicos/cpf/consultasituacao/consultapublica.asp",
      "_blank",
      "noopener,noreferrer"
    )
  }
)


cpfConfirmed?.addEventListener(
  "change",
  function () {
    if (cpfConfirmed.checked) {
      cpfValidationStatus.textContent =
        "Consulta realizada e CPF conferido."

      cpfValidationStatus.classList.add(
        "confirmed"
      )

      return
    }

    cpfValidationStatus.textContent =
      "CPF ainda não conferido."

    cpfValidationStatus.classList.remove(
      "confirmed"
    )
  }
)


/* =====================================================
   OBSERVAÇÕES
===================================================== */

observationsInput?.addEventListener(
  "input",
  function () {
    if (characterTotal) {
      characterTotal.textContent =
        observationsInput.value.length
    }
  }
)


/* =====================================================
   FUNÇÃO AUXILIAR PARA RESULTADOS PAGINADOS
===================================================== */

function obterLista(dados) {
  if (Array.isArray(dados)) {
    return dados
  }

  if (
    dados &&
    Array.isArray(dados.results)
  ) {
    return dados.results
  }

  return []
}


/* =====================================================
   REGIÕES
===================================================== */

async function carregarRegioes() {
  regionSelect.disabled = true

  regionSelect.innerHTML = `
    <option value="">
      Carregando regiões...
    </option>
  `

  const response =
    await apiFetch(
      "/regioes/"
    )

  if (!response.ok) {
    throw new Error(
      "Não foi possível carregar as regiões."
    )
  }

  const dados =
    await response.json()

  const regioes =
    obterLista(dados)

  regionSelect.innerHTML = `
    <option value="">
      Selecione a região
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

      regionSelect.appendChild(
        option
      )
    }
  )

  regionSelect.disabled = false
}


/* =====================================================
   LOCALIDADES
===================================================== */

async function carregarLocalidades(
  regiaoId
) {
  neighborhoodSelect.disabled =
    true

  streetSelect.disabled =
    true

  neighborhoodSelect.innerHTML = `
    <option value="">
      Carregando localidades...
    </option>
  `

  streetSelect.innerHTML = `
    <option value="">
      Selecione primeiro a localidade
    </option>
  `

  if (!regiaoId) {
    neighborhoodSelect.innerHTML = `
      <option value="">
        Selecione primeiro a região
      </option>
    `

    return
  }

  const response =
    await apiFetch(
      `/localidades/?regiao=${regiaoId}`
    )

  if (!response.ok) {
    throw new Error(
      "Não foi possível carregar as localidades."
    )
  }

  const dados =
    await response.json()

  const localidades =
    obterLista(dados)

  neighborhoodSelect.innerHTML = `
    <option value="">
      Selecione a localidade
    </option>
  `

  localidades.forEach(
    function (localidade) {
      const option =
        document.createElement(
          "option"
        )

      option.value =
        localidade.id

      const tipo =
        localidade.tipo_display ||
        localidade.tipo_nome ||
        localidade.tipo ||
        ""

      if (tipo) {
        option.textContent =
          `${localidade.nome} - ${tipo}`
      } else {
        option.textContent =
          localidade.nome
      }

      neighborhoodSelect.appendChild(
        option
      )
    }
  )

  neighborhoodSelect.disabled =
    false
}


/* =====================================================
   RUAS
===================================================== */

async function carregarRuas(
  localidadeId
) {
  streetSelect.disabled = true

  streetSelect.innerHTML = `
    <option value="">
      Carregando ruas...
    </option>
  `

  if (!localidadeId) {
    streetSelect.innerHTML = `
      <option value="">
        Selecione primeiro a localidade
      </option>
    `

    return
  }

  const response =
    await apiFetch(
      `/ruas/?localidade=${localidadeId}`
    )

  if (!response.ok) {
    throw new Error(
      "Não foi possível carregar as ruas."
    )
  }

  const dados =
    await response.json()

  const ruas =
    obterLista(dados)

  streetSelect.innerHTML = `
    <option value="">
      Selecione a rua
    </option>
  `

  ruas.forEach(
    function (rua) {
      const option =
        document.createElement(
          "option"
        )

      option.value =
        rua.id

      option.textContent =
        rua.nome

      streetSelect.appendChild(
        option
      )
    }
  )

  streetSelect.disabled = false
}


regionSelect?.addEventListener(
  "change",
  async function () {
    try {
      await carregarLocalidades(
        regionSelect.value
      )
    } catch (error) {
      console.error(error)

      window.alert(
        error.message
      )
    }
  }
)


neighborhoodSelect?.addEventListener(
  "change",
  async function () {
    try {
      await carregarRuas(
        neighborhoodSelect.value
      )
    } catch (error) {
      console.error(error)

      window.alert(
        error.message
      )
    }
  }
)


/* =====================================================
   LIMPAR ERROS
===================================================== */

function clearFieldErrors() {
  registrationForm
    ?.querySelectorAll(
      ".invalid"
    )
    .forEach(
      function (campo) {
        campo.classList.remove(
          "invalid"
        )
      }
    )

  registrationForm
    ?.querySelectorAll(
      ".field-error"
    )
    .forEach(
      function (erro) {
        erro.textContent = ""

        erro.classList.remove(
          "visible"
        )
      }
    )
}


function mostrarErroCampo(
  campo,
  mensagem
) {
  if (!campo) {
    return
  }

  campo.classList.add(
    "invalid"
  )

  const formField =
    campo.closest(
      ".form-field"
    )

  const erro =
    formField?.querySelector(
      ".field-error"
    )

  if (erro) {
    erro.textContent =
      mensagem

    erro.classList.add(
      "visible"
    )
  }
}


/* =====================================================
   VALIDAR FORMULÁRIO
===================================================== */

function validarFormulario() {
  clearFieldErrors()

  let valido = true
  let primeiroErro = null

  const obrigatorios =
    Array.from(
      registrationForm
        .querySelectorAll(
          "[required]"
        )
    )

  obrigatorios.forEach(
    function (campo) {
      if (
        !String(
          campo.value
        ).trim()
      ) {
        valido = false

        mostrarErroCampo(
          campo,
          "Este campo é obrigatório."
        )

        if (!primeiroErro) {
          primeiroErro =
            campo
        }
      }
    }
  )

  const cpf =
    cpfInput.value.replace(
      /\D/g,
      ""
    )

  if (cpf.length !== 11) {
    valido = false

    mostrarErroCampo(
      cpfInput,
      "Digite um CPF com 11 dígitos."
    )

    if (!primeiroErro) {
      primeiroErro =
        cpfInput
    }
  }

  const telefone =
    phoneInput.value.replace(
      /\D/g,
      ""
    )

  if (telefone.length < 10) {
    valido = false

    mostrarErroCampo(
      phoneInput,
      "Digite um telefone válido."
    )

    if (!primeiroErro) {
      primeiroErro =
        phoneInput
    }
  }

  if (
    cpfConfirmed &&
    !cpfConfirmed.checked
  ) {
    valido = false

    window.alert(
      "Consulte o CPF na Receita Federal e confirme a conferência antes de salvar."
    )
  }

  if (primeiroErro) {
    primeiroErro.focus()
  }

  return valido
}


/* =====================================================
   MONTAR DADOS PARA O DJANGO
===================================================== */

function montarDadosCadastro() {
  return {
    nome_completo:
      fullNameInput.value.trim(),

    cpf:
      cpfInput.value.replace(
        /\D/g,
        ""
      ),

    data_nascimento:
      birthDateInput.value,

    titulo_eleitor:
      voterTitleInput
        ?.value
        .replace(/\D/g, "")
      || "",

    telefone:
      phoneInput.value.replace(
        /\D/g,
        ""
      ),

    regiao:
      Number(
        regionSelect.value
      ),

    localidade:
      Number(
        neighborhoodSelect.value
      ),

    rua:
      Number(
        streetSelect.value
      ),

    numero:
      numberInput.value.trim(),

    complemento:
      complementInput
        ?.value
        .trim()
      || "",

    observacoes:
      observationsInput
        ?.value
        .trim()
      || "",

    status:
      "ATIVO",

    status_verificacao_cpf:
      cpfConfirmed?.checked
        ? "CONSULTADO"
        : "NAO_VERIFICADO",

    status_verificacao_titulo:
      "NAO_VERIFICADO",
  }
}


/* =====================================================
   ERROS DO BACKEND
===================================================== */

function mostrarErrosBackend(
  erros
) {
  const campos = {
    nome_completo:
      fullNameInput,

    cpf:
      cpfInput,

    data_nascimento:
      birthDateInput,

    titulo_eleitor:
      voterTitleInput,

    telefone:
      phoneInput,

    regiao:
      regionSelect,

    localidade:
      neighborhoodSelect,

    rua:
      streetSelect,

    numero:
      numberInput,

    complemento:
      complementInput,

    observacoes:
      observationsInput,
  }

  Object.entries(
    erros
  ).forEach(
    function (
      [nomeCampo, mensagens]
    ) {
      const campo =
        campos[nomeCampo]

      const mensagem =
        Array.isArray(mensagens)
          ? mensagens.join(" ")
          : String(mensagens)

      if (campo) {
        mostrarErroCampo(
          campo,
          mensagem
        )
      } else {
        console.error(
          nomeCampo,
          mensagem
        )
      }
    }
  )
}


/* =====================================================
   SALVAR NO BANCO
===================================================== */

async function salvarCadastro() {
  const dados =
    montarDadosCadastro()

  console.log(
    "Dados enviados:",
    dados
  )

  const response =
    await apiFetch(
      "/pessoas/",
      {
        method: "POST",

        body:
          JSON.stringify(
            dados
          ),
      }
    )

  if (response.status === 201) {
    return response.json()
  }

  let erros = {}

  try {
    erros =
      await response.json()
  } catch {
    throw new Error(
      "Não foi possível salvar o cadastro."
    )
  }

  console.error(
    "Erro retornado pelo backend:",
    erros
  )

  if (response.status === 400) {
    mostrarErrosBackend(
      erros
    )

    throw new Error(
      "Verifique os campos informados."
    )
  }

  if (response.status === 401) {
    throw new Error(
      "Sua sessão expirou. Entre novamente."
    )
  }

  if (response.status === 403) {
    throw new Error(
      "Você não possui permissão para cadastrar."
    )
  }

  throw new Error(
    erros.detail ||
    "Não foi possível salvar o cadastro."
  )
}


/* =====================================================
   SUBMIT
===================================================== */

registrationForm?.addEventListener(
  "submit",
  async function (event) {
    event.preventDefault()

    if (!validarFormulario()) {
      return
    }

    saveButton.disabled = true

    const textoBotao =
      saveButton.querySelector(
        "span"
      )

    if (textoBotao) {
      textoBotao.textContent =
        "Salvando..."
    }

    try {
      await salvarCadastro()

      sessionStorage.removeItem(
        "cpfEmValidacao"
      )

      sessionStorage.removeItem(
        "nascimentoEmValidacao"
      )

      if (successModal) {
        successModal.classList.add(
          "visible"
        )

        document.body.style.overflow =
          "hidden"
      } else {
        window.alert(
          "Cadastro realizado com sucesso."
        )
      }
    } catch (error) {
      console.error(
        "Erro ao cadastrar:",
        error
      )

      window.alert(
        error.message
      )
    } finally {
      saveButton.disabled = false

      if (textoBotao) {
        textoBotao.textContent =
          "Salvar cadastro"
      }
    }
  }
)


/* =====================================================
   NOVO CADASTRO APÓS SUCESSO
===================================================== */

newRegistrationButton?.addEventListener(
  "click",
  function () {
    registrationForm.reset()

    neighborhoodSelect.innerHTML = `
      <option value="">
        Selecione primeiro a região
      </option>
    `

    streetSelect.innerHTML = `
      <option value="">
        Selecione primeiro a localidade
      </option>
    `

    neighborhoodSelect.disabled =
      true

    streetSelect.disabled =
      true

    if (characterTotal) {
      characterTotal.textContent =
        "0"
    }

    resetarConfirmacaoCpf()

    clearFieldErrors()

    successModal?.classList.remove(
      "visible"
    )

    document.body.style.overflow =
      ""

    fullNameInput.focus()
  }
)


/* =====================================================
   LOGOUT
===================================================== */

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


/* =====================================================
   NOTIFICAÇÕES
===================================================== */

notificationButton?.addEventListener(
  "click",
  function () {
    window.alert(
      "Você não possui novas notificações no momento."
    )
  }
)


/* =====================================================
   ESC
===================================================== */

document.addEventListener(
  "keydown",
  function (event) {
    if (
      event.key === "Escape" &&
      successModal
        ?.classList
        .contains("visible")
    ) {
      successModal.classList.remove(
        "visible"
      )

      document.body.style.overflow =
        ""
    }

    if (
      event.key === "Escape"
    ) {
      closeMenu()
    }
  }
)


/* =====================================================
   INICIAR PÁGINA
===================================================== */

async function iniciarPagina() {
  try {
    usuarioAtual =
      await buscarUsuarioLogado()

    if (!usuarioAtual) {
      throw new Error(
        "Usuário não autenticado."
      )
    }

    if (
      usuarioAtual.tipo !==
        "ADMINISTRADOR" &&
      usuarioAtual.tipo !==
        "CADASTRADOR"
    ) {
      throw new Error(
        "Perfil sem permissão."
      )
    }

    preencherUsuario(
      usuarioAtual
    )

    configurarMenuPorPerfil(
      usuarioAtual
    )

    await carregarRegioes()

    if (window.lucide) {
      window.lucide.createIcons()
    }
  } catch (error) {
    console.error(
      "Erro ao iniciar página:",
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