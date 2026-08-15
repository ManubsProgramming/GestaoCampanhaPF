const loginForm = document.querySelector("#login-form")
const usuarioInput = document.querySelector("#usuario")
const senhaInput = document.querySelector("#senha")
const loginButton = document.querySelector("#login-button")
const loginMessage = document.querySelector("#login-message")
const passwordToggle = document.querySelector("#password-toggle")
const forgotPassword = document.querySelector("#forgot-password")


function mostrarMensagem(mensagem, tipo = "error") {
  loginMessage.textContent = mensagem
  loginMessage.className = `login-message ${tipo}`
}


function limparMensagem() {
  loginMessage.textContent = ""
  loginMessage.className = "login-message"
}


function definirCarregando(carregando) {
  loginButton.disabled = carregando
  usuarioInput.disabled = carregando
  senhaInput.disabled = carregando

  loginButton.textContent =
    carregando
      ? "Entrando..."
      : "Entrar"
}


passwordToggle.addEventListener(
  "click",
  function () {
    const senhaVisivel =
      senhaInput.type === "text"

    senhaInput.type =
      senhaVisivel
        ? "password"
        : "text"

    passwordToggle.textContent =
      senhaVisivel
        ? "Mostrar"
        : "Ocultar"

    passwordToggle.setAttribute(
      "aria-label",
      senhaVisivel
        ? "Mostrar senha"
        : "Ocultar senha"
    )
  }
)


forgotPassword.addEventListener(
  "click",
  function () {
    mostrarMensagem(
      "Entre em contato com o administrador para recuperar sua senha.",
      "error"
    )
  }
)


loginForm.addEventListener(
  "submit",
  async function (event) {
    event.preventDefault()

    limparMensagem()

    const usuario =
      usuarioInput.value.trim()

    const senha =
      senhaInput.value

    if (!usuario || !senha) {
      mostrarMensagem(
        "Preencha o usuário e a senha para continuar.",
        "error"
      )

      return
    }

    definirCarregando(true)

    try {
      const usuarioLogado =
        await fazerLogin(
          usuario,
          senha
        )

      mostrarMensagem(
        "Login realizado com sucesso.",
        "success"
      )

      if (
        usuarioLogado.tipo ===
        "ADMINISTRADOR"
      ) {
        window.location.href =
          "painel.html"

        return
      }

      if (
        usuarioLogado.tipo ===
        "CADASTRADOR"
      ) {
        window.location.href =
          "pessoas.html"

        return
      }

      limparSessao()

      mostrarMensagem(
        "Seu usuário não possui um perfil válido.",
        "error"
      )
    } catch (error) {
      console.error(
        "Erro ao fazer login:",
        error
      )

      mostrarMensagem(
        error.message ||
        "Não foi possível realizar o login.",
        "error"
      )
    } finally {
      definirCarregando(false)
    }
  }
)