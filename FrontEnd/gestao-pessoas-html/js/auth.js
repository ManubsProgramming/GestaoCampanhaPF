async function fazerLogin(
  username,
  password
) {
  const response = await fetch(
    `${API_URL}/auth/login/`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    }
  )

  if (!response.ok) {
    let mensagem =
      "Usuário ou senha inválidos."

    try {
      const erro =
        await response.json()

      if (erro.detail) {
        mensagem = erro.detail
      }
    } catch {
      // mantém mensagem padrão
    }

    throw new Error(mensagem)
  }

  const data =
    await response.json()

  salvarTokens(
    data.access,
    data.refresh
  )

  const usuario =
    await buscarUsuarioLogado()

  localStorage.setItem(
    "usuario",
    JSON.stringify(usuario)
  )

  return usuario
}

async function buscarUsuarioLogado() {
  const response = await apiFetch(
    "/usuarios/me/"
  )

  if (!response.ok) {
    throw new Error(
      "Não foi possível carregar o usuário logado."
    )
  }

  return response.json()
}

function getUsuarioLogado() {
  const usuario =
    localStorage.getItem("usuario")

  if (!usuario) {
    return null
  }

  try {
    return JSON.parse(usuario)
  } catch {
    return null
  }
}

function estaAutenticado() {
  return Boolean(
    getAccessToken() ||
    getRefreshToken()
  )
}

function fazerLogout() {
  limparSessao()

  window.location.href =
    "index.html"
}