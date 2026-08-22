/* =========================================
   LOGIN
========================================= */

async function fazerLogin(
  username,
  password
) {
  const response =
    await fetch(
      `${API_URL}/auth/login/`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            username,
            password,
          }),
      }
    );


  if (!response.ok) {
    let mensagem =
      "Usuário ou senha inválidos.";

    try {
      const erro =
        await response.json();

      if (erro.detail) {
        mensagem =
          erro.detail;
      }

    } catch {
      /*
       * Mantém a mensagem padrão.
       */
    }

    throw new Error(
      mensagem
    );
  }


  const data =
    await response.json();


  /*
   * Salva access e refresh token.
   */

  salvarTokens(
    data.access,
    data.refresh
  );


  /*
   * Busca os dados reais
   * do usuário no backend.
   */

  const usuario =
    await buscarUsuarioLogado();


  /*
   * Salva usuário localmente
   * para uso visual.
   */

  localStorage.setItem(
    "usuario",
    JSON.stringify(
      usuario
    )
  );


  return usuario;
}


/* =========================================
   BUSCAR USUÁRIO LOGADO
========================================= */

async function buscarUsuarioLogado() {
  const response =
    await apiFetch(
      "/usuarios/me/"
    );


  if (!response.ok) {
    throw new Error(
      `Não foi possível carregar o usuário logado. Status: ${response.status}`
    );
  }


  const usuario =
    await response.json();


  /*
   * Sempre atualiza os dados
   * armazenados no navegador.
   *
   * Isso impede que o sistema
   * trabalhe com perfil antigo.
   */

  localStorage.setItem(
    "usuario",
    JSON.stringify(
      usuario
    )
  );


  return usuario;
}


/* =========================================
   OBTER USUÁRIO SALVO
========================================= */

function getUsuarioLogado() {
  const usuario =
    localStorage.getItem(
      "usuario"
    );


  if (!usuario) {
    return null;
  }


  try {
    return JSON.parse(
      usuario
    );

  } catch {
    return null;
  }
}


/* =========================================
   VERIFICAR AUTENTICAÇÃO
========================================= */

function estaAutenticado() {
  /*
   * Aqui apenas verificamos
   * se existe token armazenado.
   *
   * A validade real é confirmada
   * pelo backend através de
   * buscarUsuarioLogado().
   */

  return Boolean(
    getAccessToken() ||
    getRefreshToken()
  );
}


/* =========================================
   VERIFICAR ADMINISTRADOR
========================================= */

function ehAdministrador(
  usuario
) {
  return (
    usuario?.tipo ===
    "ADMINISTRADOR"
  );
}


/* =========================================
   VERIFICAR CADASTRADOR
========================================= */

function ehCadastrador(
  usuario
) {
  return (
    usuario?.tipo ===
    "CADASTRADOR"
  );
}


/* =========================================
   APLICAR PERMISSÕES VISUAIS
========================================= */

function aplicarPermissoesVisuais(
  usuario
) {
  const administrador =
    ehAdministrador(
      usuario
    );

  const cadastrador =
    ehCadastrador(
      usuario
    );


  /*
   * =====================================
   * ELEMENTOS EXCLUSIVOS DO ADMIN
   * =====================================
   *
   * Exemplo:
   *
   * <a
   *   href="usuarios.html"
   *   data-admin-only
   * >
   *   Usuários
   * </a>
   */

  document
    .querySelectorAll(
      "[data-admin-only]"
    )
    .forEach(
      function (
        elemento
      ) {
        if (administrador) {
          elemento.style
            .removeProperty(
              "display"
            );

          return;
        }

        elemento.style.display =
          "none";
      }
    );


  /*
   * =====================================
   * ELEMENTOS EXCLUSIVOS CADASTRADOR
   * =====================================
   */

  document
    .querySelectorAll(
      "[data-cadastrador-only]"
    )
    .forEach(
      function (
        elemento
      ) {
        if (cadastrador) {
          elemento.style
            .removeProperty(
              "display"
            );

          return;
        }

        elemento.style.display =
          "none";
      }
    );


  /*
   * =====================================
   * ELEMENTOS PARA QUALQUER
   * USUÁRIO AUTENTICADO
   * =====================================
   */

  document
    .querySelectorAll(
      "[data-authenticated-only]"
    )
    .forEach(
      function (
        elemento
      ) {
        elemento.style
          .removeProperty(
            "display"
          );
      }
    );
}


/* =========================================
   LIBERAR PÁGINA
========================================= */

function liberarPagina() {
  document.body
    .classList
    .remove(
      "auth-loading"
    );

  document.body
    .classList
    .add(
      "auth-ready"
    );
}


/* =========================================
   REDIRECIONAR PARA LOGIN
========================================= */

function redirecionarParaLogin(
  limpar = true
) {
  /*
   * Quando a sessão realmente
   * for inválida, limpamos.
   *
   * Em modo offline podemos
   * redirecionar sem destruir
   * os tokens existentes.
   */

  if (limpar) {
    limparSessao();
  }

  window.location.replace(
    "index.html"
  );
}


/* =========================================
   REDIRECIONAR CADASTRADOR
========================================= */

function redirecionarCadastrador() {
  window.location.replace(
    "pessoas.html"
  );
}


/* =========================================
   PROTEÇÃO GLOBAL DE PÁGINAS
========================================= */

async function protegerPagina() {
  /*
   * Tipos possíveis:
   *
   * public
   * authenticated
   * admin
   *
   * Exemplo:
   *
   * <body
   *   class="auth-loading"
   *   data-auth="admin"
   * >
   */

  const acesso =
    document.body.dataset.auth ||
    "public";


  /*
   * =====================================
   * PÁGINA PÚBLICA
   * =====================================
   */

  if (
    acesso === "public"
  ) {
    liberarPagina();

    return;
  }


  /*
   * =====================================
   * SEM TOKEN
   * =====================================
   */

  if (
    !estaAutenticado()
  ) {
    redirecionarParaLogin();

    return;
  }


  try {
    /*
     * Busca o usuário diretamente
     * no backend antes de mostrar
     * a página.
     */

    const usuario =
      await buscarUsuarioLogado();


    /*
     * ===================================
     * USUÁRIO INVÁLIDO
     * ===================================
     */

    if (
      !usuario ||
      !usuario.tipo
    ) {
      redirecionarParaLogin();

      return;
    }


    /*
     * ===================================
     * PÁGINA SOMENTE ADMIN
     * ===================================
     */

    if (
      acesso === "admin" &&
      !ehAdministrador(
        usuario
      )
    ) {
      redirecionarCadastrador();

      return;
    }


    /*
     * ===================================
     * PÁGINA AUTENTICADA
     * ===================================
     *
     * Tanto ADMINISTRADOR quanto
     * CADASTRADOR podem entrar.
     */

    if (
      acesso ===
      "authenticated"
    ) {
      aplicarPermissoesVisuais(
        usuario
      );

      liberarPagina();

      return;
    }


    /*
     * ===================================
     * ADMIN AUTORIZADO
     * ===================================
     */

    if (
      acesso === "admin" &&
      ehAdministrador(
        usuario
      )
    ) {
      aplicarPermissoesVisuais(
        usuario
      );

      liberarPagina();

      return;
    }


    /*
     * Qualquer situação não
     * prevista volta para login.
     */

    redirecionarParaLogin();


  } catch (error) {
    console.warn(
      "Não foi possível validar acesso:",
      error
    );


    /*
     * ===================================
     * MODO OFFLINE
     * ===================================
     *
     * Falha de internet não significa
     * que o usuário foi deslogado.
     *
     * Nesse caso usamos os dados
     * locais apenas para decidir
     * quais telas podem ser exibidas.
     *
     * A segurança real das APIs
     * continua sendo feita pelo Django.
     */

    if (
      !navigator.onLine
    ) {
      const usuarioSalvo =
        getUsuarioLogado();


      if (
        !usuarioSalvo ||
        !usuarioSalvo.tipo
      ) {
        redirecionarParaLogin(
          false
        );

        return;
      }


      /*
       * Admin page sendo acessada
       * por cadastrador offline.
       */

      if (
        acesso === "admin" &&
        !ehAdministrador(
          usuarioSalvo
        )
      ) {
        redirecionarCadastrador();

        return;
      }


      /*
       * Usuário conhecido localmente.
       */

      aplicarPermissoesVisuais(
        usuarioSalvo
      );

      liberarPagina();

      return;
    }


    /*
     * Se estamos online e chegamos
     * aqui, a validação da sessão
     * realmente falhou.
     */

    redirecionarParaLogin();
  }
}


/* =========================================
   LOGOUT SEGURO
========================================= */

async function fazerLogout() {
  const refreshToken =
    getRefreshToken();


  try {
    /*
     * Envia o refresh token para
     * o backend antes de apagá-lo.
     *
     * O backend adiciona esse token
     * à blacklist do SimpleJWT.
     */

    if (refreshToken) {
      const response =
        await apiFetch(
          "/auth/logout/",
          {
            method: "POST",

            body:
              JSON.stringify({
                refresh:
                  refreshToken,
              }),
          }
        );


      if (!response.ok) {
        console.warn(
          "O backend não confirmou o logout:",
          response.status
        );
      }
    }


  } catch (error) {
    /*
     * Mesmo que a Railway esteja
     * indisponível, ainda podemos
     * encerrar a sessão neste
     * navegador.
     */

    console.warn(
      "Não foi possível invalidar o refresh token no servidor:",
      error
    );


  } finally {
    /*
     * Sempre limpa a sessão local.
     */

    limparSessao();

    window.location.href =
      "index.html";
  }
}


/* =========================================
   INICIAR PROTEÇÃO
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  protegerPagina
);