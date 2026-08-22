const API_URL =
  "https://gestaocampanhapf-production.up.railway.app/api";


/* =========================================
   ACCESS TOKEN
========================================= */

function getAccessToken() {
  return localStorage.getItem(
    "access"
  );
}


/* =========================================
   REFRESH TOKEN
========================================= */

function getRefreshToken() {
  return localStorage.getItem(
    "refresh"
  );
}


/* =========================================
   SALVAR TOKENS
========================================= */

function salvarTokens(
  access,
  refresh
) {
  if (access) {
    localStorage.setItem(
      "access",
      access
    );
  }

  if (refresh) {
    localStorage.setItem(
      "refresh",
      refresh
    );
  }
}


/* =========================================
   LIMPAR SESSÃO
========================================= */

function limparSessao() {
  localStorage.removeItem(
    "access"
  );

  localStorage.removeItem(
    "refresh"
  );

  localStorage.removeItem(
    "usuario"
  );
}


/* =========================================
   RENOVAR ACCESS TOKEN
========================================= */

async function renovarAccessToken() {
  const refresh =
    getRefreshToken();

  if (!refresh) {
    return null;
  }

  try {
    const response =
      await fetch(
        `${API_URL}/auth/refresh/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              refresh,
            }),
        }
      );


    /*
     * Se o servidor respondeu,
     * mas rejeitou o token,
     * aí sim tratamos como
     * sessão inválida.
     */

    if (!response.ok) {
      if (
        response.status === 401 ||
        response.status === 403
      ) {
        limparSessao();
      }

      return null;
    }


    const data =
      await response.json();


    /*
     * Como ROTATE_REFRESH_TOKENS
     * está ativo no Django,
     * o backend pode devolver
     * um novo refresh.
     */

    salvarTokens(
      data.access,
      data.refresh || refresh
    );


    return data.access;


  } catch (error) {

    /*
     * IMPORTANTE:
     *
     * Falha de internet,
     * Railway indisponível,
     * DNS ou modo offline
     * NÃO significam logout.
     *
     * Não apagamos os tokens aqui.
     */

    console.warn(
      "Não foi possível renovar o token porque o servidor está indisponível:",
      error
    );

    return null;
  }
}


/* =========================================
   FETCH AUTENTICADO
========================================= */

async function apiFetch(
  endpoint,
  options = {},
  tentarRenovar = true
) {
  const token =
    getAccessToken();


  /*
   * Copia headers recebidos
   * para não alterar o objeto
   * original.
   */

  const headers = {
    ...(options.headers || {}),
  };


  /*
   * Adiciona JWT.
   */

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }


  /*
   * Define JSON automaticamente,
   * exceto quando enviamos FormData.
   */

  if (
    options.body &&
    !(
      options.body
      instanceof FormData
    )
  ) {
    headers["Content-Type"] =
      headers["Content-Type"] ||
      "application/json";
  }


  let response;


  try {
    response =
      await fetch(
        `${API_URL}${endpoint}`,
        {
          ...options,
          headers,
        }
      );

  } catch (error) {

    /*
     * Erro de conexão não
     * destrói a sessão.
     *
     * A página que chamou apiFetch
     * pode decidir usar cache
     * ou funcionamento offline.
     */

    console.warn(
      `Falha de conexão com ${endpoint}:`,
      error
    );

    throw error;
  }


  /*
   * ACCESS TOKEN EXPIROU
   *
   * Se o backend responder 401,
   * tentamos renovar apenas uma vez.
   */

  if (
    response.status === 401 &&
    tentarRenovar
  ) {
    const novoToken =
      await renovarAccessToken();


    if (novoToken) {
      const novosHeaders = {
        ...headers,

        Authorization:
          `Bearer ${novoToken}`,
      };


      try {
        response =
          await fetch(
            `${API_URL}${endpoint}`,
            {
              ...options,

              headers:
                novosHeaders,
            }
          );

      } catch (error) {
        console.warn(
          `Falha de conexão ao repetir ${endpoint}:`,
          error
        );

        throw error;
      }
    }
  }


  return response;
}