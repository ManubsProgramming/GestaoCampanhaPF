const API_URL = "http://127.0.0.1:8000/api"

function getAccessToken() {
  return localStorage.getItem("access")
}

function getRefreshToken() {
  return localStorage.getItem("refresh")
}

function salvarTokens(access, refresh) {
  localStorage.setItem("access", access)

  if (refresh) {
    localStorage.setItem("refresh", refresh)
  }
}

function limparSessao() {
  localStorage.removeItem("access")
  localStorage.removeItem("refresh")
  localStorage.removeItem("usuario")
}

async function renovarAccessToken() {
  const refresh = getRefreshToken()

  if (!refresh) {
    return null
  }

  try {
    const response = await fetch(
      `${API_URL}/auth/refresh/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh,
        }),
      }
    )

    if (!response.ok) {
      limparSessao()
      return null
    }

    const data = await response.json()

    salvarTokens(
      data.access,
      data.refresh || refresh
    )

    return data.access
  } catch (error) {
    console.error(
      "Erro ao renovar token:",
      error
    )

    limparSessao()
    return null
  }
}

async function apiFetch(
  endpoint,
  options = {},
  tentarRenovar = true
) {
  const token = getAccessToken()

  const headers = {
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization =
      `Bearer ${token}`
  }

  if (
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers["Content-Type"] =
      headers["Content-Type"] ||
      "application/json"
  }

  let response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  )

  if (
    response.status === 401 &&
    tentarRenovar
  ) {
    const novoToken =
      await renovarAccessToken()

    if (novoToken) {
      const novosHeaders = {
        ...headers,
        Authorization:
          `Bearer ${novoToken}`,
      }

      response = await fetch(
        `${API_URL}${endpoint}`,
        {
          ...options,
          headers: novosHeaders,
        }
      )
    }
  }

  return response
}