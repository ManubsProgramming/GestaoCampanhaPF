document.addEventListener(
  "DOMContentLoaded",
  function () {

    /*
     * =========================================
     * ESTRUTURA DOS MODAIS
     * =========================================
     */

    const modalStructure =
      document.createElement(
        "div"
      )

    modalStructure.innerHTML = `
      <div
        class="system-modal-overlay"
        id="system-modal-overlay"
        aria-hidden="true"
      >
        <div
          class="system-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="system-modal-title"
          aria-describedby="system-modal-message"
        >

          <div
            class="system-modal-content"
          >

            <div
              class="system-modal-icon"
              id="system-modal-icon"
            >
              <i
                data-lucide="triangle-alert"
              ></i>
            </div>

            <h2
              class="system-modal-title"
              id="system-modal-title"
            >
              Confirmar ação
            </h2>

            <p
              class="system-modal-message"
              id="system-modal-message"
            >
              Deseja realmente continuar?
            </p>

          </div>

          <div
            class="system-modal-actions"
          >

            <button
              type="button"
              class="system-modal-cancel"
              id="system-modal-cancel"
            >
              Cancelar
            </button>

            <button
              type="button"
              class="system-modal-confirm"
              id="system-modal-confirm"
            >
              Confirmar
            </button>

          </div>

        </div>
      </div>


      <div
        class="system-loading-overlay"
        id="system-loading-overlay"
        aria-hidden="true"
      >

        <div
          class="system-loading-box"
        >

          <div
            class="system-loading-spinner"
          ></div>

          <span
            id="system-loading-message"
          >
            Carregando...
          </span>

        </div>

      </div>
    `

    document.body.appendChild(
      modalStructure
    )


    /*
     * =========================================
     * ELEMENTOS
     * =========================================
     */

    const modalOverlay =
      document.getElementById(
        "system-modal-overlay"
      )

    const modalBox =
      modalOverlay.querySelector(
        ".system-modal"
      )

    const modalIcon =
      document.getElementById(
        "system-modal-icon"
      )

    const modalTitle =
      document.getElementById(
        "system-modal-title"
      )

    const modalMessage =
      document.getElementById(
        "system-modal-message"
      )

    const modalCancelButton =
      document.getElementById(
        "system-modal-cancel"
      )

    const modalConfirmButton =
      document.getElementById(
        "system-modal-confirm"
      )

    const loadingOverlay =
      document.getElementById(
        "system-loading-overlay"
      )

    const loadingMessage =
      document.getElementById(
        "system-loading-message"
      )


    /*
     * =========================================
     * CONTROLE INTERNO
     * =========================================
     */

    let modalResolveFunction =
      null

    let modalLastFocusedElement =
      null


    /*
     * =========================================
     * TIPO DO MODAL
     * =========================================
     */

    function configureModalType(
      type
    ) {

      modalIcon.className =
        "system-modal-icon"

      modalConfirmButton.className =
        "system-modal-confirm"

      let iconName =
        "triangle-alert"


      if (
        type === "success"
      ) {

        modalIcon.classList.add(
          "success"
        )

        modalConfirmButton
          .classList
          .add(
            "success"
          )

        iconName =
          "circle-check"


      } else if (
        type === "information"
      ) {

        modalIcon.classList.add(
          "information"
        )

        modalConfirmButton
          .classList
          .add(
            "primary"
          )

        iconName =
          "info"


      } else if (
        type === "warning"
      ) {

        modalIcon.classList.add(
          "warning"
        )

        iconName =
          "triangle-alert"


      } else {

        iconName =
          "trash-2"

      }


      modalIcon.innerHTML =
        `<i data-lucide="${iconName}"></i>`


      if (
        window.lucide
      ) {

        window.lucide
          .createIcons()

      }
    }


    /*
     * =========================================
     * FECHAR MODAL
     * =========================================
     */

    function closeSystemModal(
      result
    ) {

      modalOverlay
        .classList
        .remove(
          "visible"
        )

      modalOverlay.setAttribute(
        "aria-hidden",
        "true"
      )


      /*
       * Só libera o body se
       * o loading também estiver fechado.
       */

      if (
        !loadingOverlay
          .classList
          .contains(
            "visible"
          )
      ) {

        document.body
          .classList
          .remove(
            "modal-open"
          )

      }


      window.setTimeout(
        function () {

          if (
            modalResolveFunction
          ) {

            modalResolveFunction(
              result
            )

            modalResolveFunction =
              null

          }


          if (
            modalLastFocusedElement
          ) {

            modalLastFocusedElement
              .focus()

            modalLastFocusedElement =
              null

          }

        },
        200
      )
    }


    /*
     * =========================================
     * LOADING
     * =========================================
     */

    function showSystemLoading(
      message = "Carregando..."
    ) {

      loadingMessage.textContent =
        message

      loadingOverlay
        .classList
        .add(
          "visible"
        )

      loadingOverlay.setAttribute(
        "aria-hidden",
        "false"
      )

      document.body
        .classList
        .add(
          "modal-open"
        )
    }


    function hideSystemLoading() {

      loadingOverlay
        .classList
        .remove(
          "visible"
        )

      loadingOverlay.setAttribute(
        "aria-hidden",
        "true"
      )


      /*
       * IMPORTANTE:
       *
       * Não remove modal-open se
       * existir outro modal aberto.
       */

      if (
        !modalOverlay
          .classList
          .contains(
            "visible"
          )
      ) {

        document.body
          .classList
          .remove(
            "modal-open"
          )

      }
    }


    /*
     * =========================================
     * ABRIR MODAL
     * =========================================
     */

    function openSystemModal(
      options = {}
    ) {

      /*
       * CORREÇÃO GLOBAL:
       *
       * Sempre fecha qualquer loading
       * antes de abrir um modal de
       * sucesso, erro ou confirmação.
       *
       * Isso evita o loading infinito
       * depois de cadastrar, editar,
       * excluir etc.
       */

      hideSystemLoading()


      const settings = {

        title:
          options.title ||
          "Confirmar ação",

        message:
          options.message ||
          "Deseja realmente continuar?",

        confirmText:
          options.confirmText ||
          "Confirmar",

        cancelText:
          options.cancelText ||
          "Cancelar",

        type:
          options.type ||
          "danger",

        showCancel:
          options.showCancel !==
          false,
      }


      modalLastFocusedElement =
        document.activeElement


      modalTitle.textContent =
        settings.title


      modalMessage.textContent =
        settings.message


      modalConfirmButton.textContent =
        settings.confirmText


      modalCancelButton.textContent =
        settings.cancelText


      modalCancelButton.style.display =
        settings.showCancel
          ? "inline-flex"
          : "none"


      configureModalType(
        settings.type
      )


      modalOverlay
        .classList
        .add(
          "visible"
        )


      modalOverlay.setAttribute(
        "aria-hidden",
        "false"
      )


      document.body
        .classList
        .add(
          "modal-open"
        )


      window.setTimeout(
        function () {

          modalConfirmButton
            .focus()

        },
        100
      )


      return new Promise(
        function (
          resolve
        ) {

          modalResolveFunction =
            resolve

        }
      )
    }


    /*
     * =========================================
     * BOTÕES DO MODAL
     * =========================================
     */

    modalConfirmButton
      .addEventListener(
        "click",
        function () {

          closeSystemModal(
            true
          )

        }
      )


    modalCancelButton
      .addEventListener(
        "click",
        function () {

          closeSystemModal(
            false
          )

        }
      )


    /*
     * =========================================
     * CLIQUE FORA DO MODAL
     * =========================================
     */

    modalOverlay
      .addEventListener(
        "click",
        function (
          event
        ) {

          if (
            event.target ===
            modalOverlay
          ) {

            closeSystemModal(
              false
            )

          }
        }
      )


    /*
     * Impede clique dentro
     * do modal de fechar.
     */

    modalBox
      .addEventListener(
        "click",
        function (
          event
        ) {

          event.stopPropagation()

        }
      )


    /*
     * =========================================
     * TECLADO
     * =========================================
     */

    document
      .addEventListener(
        "keydown",
        function (
          event
        ) {

          if (
            !modalOverlay
              .classList
              .contains(
                "visible"
              )
          ) {

            return

          }


          if (
            event.key ===
            "Escape"
          ) {

            closeSystemModal(
              false
            )

          }


          if (
            event.key ===
            "Enter"
          ) {

            closeSystemModal(
              true
            )

          }

        }
      )


    /*
     * =========================================
     * API GLOBAL DO MODAL
     * =========================================
     */

    window.SystemModal = {

      /*
       * CONFIRMAÇÃO
       */

      confirm:
        function (
          options
        ) {

          return openSystemModal(
            options
          )

        },


      /*
       * AVISO
       */

      alert:
        function (
          options = {}
        ) {

          return openSystemModal({

            title:
              options.title ||
              "Aviso",

            message:
              options.message ||
              "",

            confirmText:
              options.confirmText ||
              "Entendi",

            type:
              options.type ||
              "information",

            showCancel:
              false,

          })
        },


      /*
       * SUCESSO
       */

      success:
        function (
          message,
          title =
            "Ação realizada"
        ) {

          return openSystemModal({

            title:
              title,

            message:
              message,

            confirmText:
              "Continuar",

            type:
              "success",

            showCancel:
              false,

          })
        },


      /*
       * LOADING
       */

      loading: {

        show:
          showSystemLoading,

        hide:
          hideSystemLoading,

      },
    }


    /*
     * =========================================
     * ATUALIZAR ÍCONES
     * =========================================
     */

    if (
      window.lucide
    ) {

      window.lucide
        .createIcons()

    }


    /*
     * =========================================
     * NOTIFICAÇÕES
     * =========================================
     */

    document.addEventListener(
      "click",
      async function (
        event
      ) {

        const notificationButton =
          event.target.closest(
            ".notification-button"
          )


        if (
          !notificationButton
        ) {

          return

        }


        event.preventDefault()

        event.stopPropagation()

        event.stopImmediatePropagation()


        await window
          .SystemModal
          .alert({

            title:
              "Notificações",

            message:
              "Você não possui novas notificações no momento.",

            confirmText:
              "Entendi",

            type:
              "information",

          })

      },
      true
    )
  }
)


/*
 * =============================================
 * LOGOUT GLOBAL
 * =============================================
 */

document.addEventListener(
  "click",
  async function (
    event
  ) {

    const logoutButton =
      event.target.closest(
        ".logout-button, #logout-button"
      )


    if (
      !logoutButton
    ) {

      return

    }


    /*
     * Impede confirmações antigas
     * ou outros listeners de logout.
     */

    event.preventDefault()

    event.stopPropagation()

    event.stopImmediatePropagation()


    /*
     * Verifica se o modal já foi
     * carregado.
     */

    if (
      !window.SystemModal
    ) {

      if (
        typeof fazerLogout ===
        "function"
      ) {

        fazerLogout()

        return

      }


      localStorage.removeItem(
        "accessToken"
      )

      localStorage.removeItem(
        "refreshToken"
      )

      localStorage.removeItem(
        "usuarioLogado"
      )

      sessionStorage.clear()

      window.location.href =
        "index.html"

      return
    }


    /*
     * Confirma saída.
     */

    const confirmedLogout =
      await window
        .SystemModal
        .confirm({

          title:
            "Sair do sistema?",

          message:
            "Você precisará informar seus dados novamente para acessar o sistema.",

          confirmText:
            "Sim, sair",

          cancelText:
            "Continuar conectado",

          type:
            "warning",

        })


    if (
      !confirmedLogout
    ) {

      return

    }


    /*
     * Mostra loading durante
     * encerramento da sessão.
     */

    window
      .SystemModal
      .loading
      .show(
        "Encerrando sua sessão..."
      )


    window.setTimeout(
      function () {

        if (
          typeof fazerLogout ===
          "function"
        ) {

          fazerLogout()

          return

        }


        localStorage.removeItem(
          "accessToken"
        )

        localStorage.removeItem(
          "refreshToken"
        )

        localStorage.removeItem(
          "usuarioLogado"
        )


        sessionStorage.clear()


        window.location.href =
          "index.html"

      },
      700
    )
  },
  true
)