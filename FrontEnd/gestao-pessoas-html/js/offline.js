const DB_NAME =
  "gestao-pf-offline";

const DB_VERSION = 2;

const STORES = {
  regioes: "regioes",
  localidades: "localidades",
  ruas: "ruas",
  cadastrosPendentes:
    "cadastrosPendentes",
};


/* =========================================
   ABRIR BANCO OFFLINE
========================================= */

function openOfflineDb() {
  return new Promise(
    function (
      resolve,
      reject
    ) {
      const request =
        indexedDB.open(
          DB_NAME,
          DB_VERSION
        );

      request.onupgradeneeded =
        function () {
          const db =
            request.result;

          if (
            !db.objectStoreNames
              .contains(
                STORES.regioes
              )
          ) {
            db.createObjectStore(
              STORES.regioes,
              {
                keyPath: "id",
              }
            );
          }

          if (
            !db.objectStoreNames
              .contains(
                STORES.localidades
              )
          ) {
            db.createObjectStore(
              STORES.localidades,
              {
                keyPath: "id",
              }
            );
          }

          if (
            !db.objectStoreNames
              .contains(
                STORES.ruas
              )
          ) {
            db.createObjectStore(
              STORES.ruas,
              {
                keyPath: "id",
              }
            );
          }

          if (
            !db.objectStoreNames
              .contains(
                STORES
                  .cadastrosPendentes
              )
          ) {
            db.createObjectStore(
              STORES
                .cadastrosPendentes,
              {
                keyPath:
                  "offline_id",
              }
            );
          }
        };

      request.onsuccess =
        function () {
          resolve(
            request.result
          );
        };

      request.onerror =
        function () {
          reject(
            request.error
          );
        };
    }
  );
}


/* =========================================
   SALVAR LISTA
========================================= */

async function salvarListaOffline(
  storeName,
  items
) {
  const db =
    await openOfflineDb();

  return new Promise(
    function (
      resolve,
      reject
    ) {
      const transaction =
        db.transaction(
          storeName,
          "readwrite"
        );

      const store =
        transaction.objectStore(
          storeName
        );

      items.forEach(
        function (
          item
        ) {
          store.put(
            item
          );
        }
      );

      transaction.oncomplete =
        function () {
          resolve();
        };

      transaction.onerror =
        function () {
          reject(
            transaction.error
          );
        };
    }
  );
}


/* =========================================
   BUSCAR LISTA
========================================= */

async function buscarListaOffline(
  storeName
) {
  const db =
    await openOfflineDb();

  return new Promise(
    function (
      resolve,
      reject
    ) {
      const transaction =
        db.transaction(
          storeName,
          "readonly"
        );

      const store =
        transaction.objectStore(
          storeName
        );

      const request =
        store.getAll();

      request.onsuccess =
        function () {
          resolve(
            request.result || []
          );
        };

      request.onerror =
        function () {
          reject(
            request.error
          );
        };
    }
  );
}


/* =========================================
   SUBSTITUIR LISTA
========================================= */

async function substituirListaOffline(
  storeName,
  items
) {
  const db =
    await openOfflineDb();

  return new Promise(
    function (
      resolve,
      reject
    ) {
      const transaction =
        db.transaction(
          storeName,
          "readwrite"
        );

      const store =
        transaction.objectStore(
          storeName
        );

      const clearRequest =
        store.clear();

      clearRequest.onsuccess =
        function () {
          items.forEach(
            function (
              item
            ) {
              store.put(
                item
              );
            }
          );
        };

      transaction.oncomplete =
        function () {
          resolve();
        };

      transaction.onerror =
        function () {
          reject(
            transaction.error
          );
        };
    }
  );
}


/* =========================================
   GERAR ID OFFLINE
========================================= */

function gerarOfflineId() {
  if (
    window.crypto &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return (
    "offline-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(16)
      .slice(2)
  );
}


/* =========================================
   SALVAR CADASTRO PENDENTE
========================================= */

async function salvarCadastroOffline(
  dados
) {
  const db =
    await openOfflineDb();

  const cadastro = {
    offline_id:
      gerarOfflineId(),

    criado_offline_em:
      new Date()
        .toISOString(),

    tentativas:
      0,

    ultimo_erro:
      "",

    dados,
  };

  return new Promise(
    function (
      resolve,
      reject
    ) {
      const transaction =
        db.transaction(
          STORES
            .cadastrosPendentes,
          "readwrite"
        );

      const store =
        transaction.objectStore(
          STORES
            .cadastrosPendentes
        );

      store.put(
        cadastro
      );

      transaction.oncomplete =
        function () {
          resolve(
            cadastro
          );
        };

      transaction.onerror =
        function () {
          reject(
            transaction.error
          );
        };
    }
  );
}


/* =========================================
   LISTAR CADASTROS PENDENTES
========================================= */

async function listarCadastrosPendentes() {
  return buscarListaOffline(
    STORES
      .cadastrosPendentes
  );
}


/* =========================================
   REMOVER CADASTRO PENDENTE
========================================= */

async function removerCadastroOffline(
  offlineId
) {
  const db =
    await openOfflineDb();

  return new Promise(
    function (
      resolve,
      reject
    ) {
      const transaction =
        db.transaction(
          STORES
            .cadastrosPendentes,
          "readwrite"
        );

      const store =
        transaction.objectStore(
          STORES
            .cadastrosPendentes
        );

      store.delete(
        offlineId
      );

      transaction.oncomplete =
        function () {
          resolve();
        };

      transaction.onerror =
        function () {
          reject(
            transaction.error
          );
        };
    }
  );
}


/* =========================================
   ATUALIZAR CADASTRO PENDENTE
========================================= */

async function atualizarCadastroOffline(
  cadastro
) {
  const db =
    await openOfflineDb();

  return new Promise(
    function (
      resolve,
      reject
    ) {
      const transaction =
        db.transaction(
          STORES
            .cadastrosPendentes,
          "readwrite"
        );

      const store =
        transaction.objectStore(
          STORES
            .cadastrosPendentes
        );

      store.put(
        cadastro
      );

      transaction.oncomplete =
        function () {
          resolve();
        };

      transaction.onerror =
        function () {
          reject(
            transaction.error
          );
        };
    }
  );
}


/* =========================================
   SINCRONIZAR CADASTROS
========================================= */

async function sincronizarCadastrosOffline() {
  if (
    !navigator.onLine
  ) {
    return {
      sincronizados: 0,
      pendentes:
        (
          await listarCadastrosPendentes()
        ).length,
    };
  }

  const pendentes =
    await listarCadastrosPendentes();

  let sincronizados = 0;

  for (
    const cadastro
    of pendentes
  ) {
    try {
      const response =
        await apiFetch(
          "/pessoas/",
          {
            method: "POST",

            body:
              JSON.stringify(
                cadastro.dados
              ),
          }
        );

      if (
        response.ok
      ) {
        await removerCadastroOffline(
          cadastro.offline_id
        );

        sincronizados += 1;

        continue;
      }

      let detalhe = "";

      try {
        const erro =
          await response.json();

        detalhe =
          JSON.stringify(
            erro
          );

      } catch {
        detalhe =
          `HTTP ${response.status}`;
      }

      cadastro.tentativas =
        Number(
          cadastro.tentativas || 0
        ) + 1;

      cadastro.ultimo_erro =
        detalhe;

      await atualizarCadastroOffline(
        cadastro
      );

    } catch (error) {
      /*
       * Se a internet caiu no
       * meio da sincronização,
       * interrompe.
       */

      console.warn(
        "Sincronização interrompida:",
        error
      );

      break;
    }
  }

  const restantes =
    await listarCadastrosPendentes();

  return {
    sincronizados,
    pendentes:
      restantes.length,
  };
}


/* =========================================
   SINCRONIZAR AO VOLTAR INTERNET
========================================= */

window.addEventListener(
  "online",
  async function () {
    try {
      const resultado =
        await sincronizarCadastrosOffline();

      console.log(
        "Sincronização offline:",
        resultado
      );

    } catch (error) {
      console.error(
        "Erro na sincronização offline:",
        error
      );
    }
  }
); 