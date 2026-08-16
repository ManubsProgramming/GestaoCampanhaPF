document.addEventListener("DOMContentLoaded", function () {
  /*
   * Criação automática do modal.
   */
  const modalStructure = document.createElement("div");

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
        <div class="system-modal-content">
          <div class="system-modal-icon" id="system-modal-icon">
            <i data-lucide="triangle-alert"></i>
          </div>

          <h2 class="system-modal-title" id="system-modal-title">
            Confirmar ação
          </h2>

          <p class="system-modal-message" id="system-modal-message">
            Deseja realmente continuar?
          </p>
        </div>

        <div class="system-modal-actions">
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
      <div class="system-loading-box">
        <div class="system-loading-spinner"></div>
        <span id="system-loading-message">Carregando...</span>
      </div>
    </div>
  `;

  document.body.appendChild(modalStructure);

  const modalOverlay = document.getElementById(
    "system-modal-overlay"
  );

  const modalBox = modalOverlay.querySelector(".system-modal");

  const modalIcon = document.getElementById("system-modal-icon");
  const modalTitle = document.getElementById("system-modal-title");
  const modalMessage = document.getElementById(
    "system-modal-message"
  );

  const modalCancelButton = document.getElementById(
    "system-modal-cancel"
  );

  const modalConfirmButton = document.getElementById(
    "system-modal-confirm"
  );

  const loadingOverlay = document.getElementById(
    "system-loading-overlay"
  );

  const loadingMessage = document.getElementById(
    "system-loading-message"
  );

  let modalResolveFunction = null;
  let modalLastFocusedElement = null;

  /*
   * Define o ícone e as cores conforme o tipo do modal.
   */
  function configureModalType(type) {
    modalIcon.className = "system-modal-icon";
    modalConfirmButton.className = "system-modal-confirm";

    let iconName = "triangle-alert";

    if (type === "success") {
      modalIcon.classList.add("success");
      modalConfirmButton.classList.add("success");
      iconName = "circle-check";
    } else if (type === "information") {
      modalIcon.classList.add("information");
      modalConfirmButton.classList.add("primary");
      iconName = "info";
    } else if (type === "warning") {
      modalIcon.classList.add("warning");
      iconName = "triangle-alert";
    } else {
      iconName = "trash-2";
    }

    modalIcon.innerHTML = `<i data-lucide="${iconName}"></i>`;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /*
   * Fecha o modal e devolve true ou false.
   */
  function closeSystemModal(result) {
    modalOverlay.classList.remove("visible");
    modalOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    window.setTimeout(function () {
      if (modalResolveFunction) {
        modalResolveFunction(result);
        modalResolveFunction = null;
      }

      if (modalLastFocusedElement) {
        modalLastFocusedElement.focus();
        modalLastFocusedElement = null;
      }
    }, 200);
  }

  /*
   * Abre um modal de confirmação.
   *
   * Exemplo:
   * const confirmou = await SystemModal.confirm({
   *   title: "Excluir pessoa?",
   *   message: "Esta ação não poderá ser desfeita."
   * });
   */
  function openSystemModal(options = {}) {
    const settings = {
      title: options.title || "Confirmar ação",
      message:
        options.message || "Deseja realmente continuar?",
      confirmText: options.confirmText || "Confirmar",
      cancelText: options.cancelText || "Cancelar",
      type: options.type || "danger",
      showCancel: options.showCancel !== false
    };

    modalLastFocusedElement = document.activeElement;

    modalTitle.textContent = settings.title;
    modalMessage.textContent = settings.message;
    modalConfirmButton.textContent = settings.confirmText;
    modalCancelButton.textContent = settings.cancelText;

    modalCancelButton.style.display = settings.showCancel
      ? "inline-flex"
      : "none";

    configureModalType(settings.type);

    modalOverlay.classList.add("visible");
    modalOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    window.setTimeout(function () {
      modalConfirmButton.focus();
    }, 100);

    return new Promise(function (resolve) {
      modalResolveFunction = resolve;
    });
  }

  /*
   * Botões do modal.
   */
  modalConfirmButton.addEventListener("click", function () {
    closeSystemModal(true);
  });

  modalCancelButton.addEventListener("click", function () {
    closeSystemModal(false);
  });

  /*
   * Fecha ao clicar na área escura.
   */
  modalOverlay.addEventListener("click", function (event) {
    if (event.target === modalOverlay) {
      closeSystemModal(false);
    }
  });

  /*
   * Impede o clique dentro da caixa de fechar o modal.
   */
  modalBox.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  /*
   * Controle pelo teclado.
   */
  document.addEventListener("keydown", function (event) {
    if (!modalOverlay.classList.contains("visible")) {
      return;
    }

    if (event.key === "Escape") {
      closeSystemModal(false);
    }

    if (event.key === "Enter") {
      closeSystemModal(true);
    }
  });

  /*
   * Exibe a tela de carregamento.
   */
  function showSystemLoading(message = "Carregando...") {
    loadingMessage.textContent = message;
    loadingOverlay.classList.add("visible");
    loadingOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  /*
   * Fecha a tela de carregamento.
   */
  function hideSystemLoading() {
    loadingOverlay.classList.remove("visible");
    loadingOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  /*
   * Disponibiliza as funções para os outros arquivos JavaScript.
   */
  window.SystemModal = {
    confirm: function (options) {
      return openSystemModal(options);
    },

    alert: function (options = {}) {
      return openSystemModal({
        title: options.title || "Aviso",
        message: options.message || "",
        confirmText: options.confirmText || "Entendi",
        type: options.type || "information",
        showCancel: false
      });
    },

    success: function (
      message,
      title = "Ação realizada"
    ) {
      return openSystemModal({
        title: title,
        message: message,
        confirmText: "Continuar",
        type: "success",
        showCancel: false
      });
    },

    loading: {
      show: showSystemLoading,
      hide: hideSystemLoading
    }
  };

  /*
   * Atualiza os ícones após criar o modal.
   */
  if (window.lucide) {
    window.lucide.createIcons();
  }
    /*
   * Modal moderno de notificações para todas as páginas.
   * O terceiro parâmetro "true" impede que os avisos antigos
   * com window.alert sejam executados.
   */
  document.addEventListener(
    "click",
    async function (event) {
      const notificationButton = event.target.closest(
        ".notification-button"
      );

      if (!notificationButton) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      await window.SystemModal.alert({
        title: "Notificações",
        message:
          "Você não possui novas notificações no momento.",
        confirmText: "Entendi",
        type: "information"
      });
    },
    true
  );
});
  /*
   * Confirmação moderna de logout em todas as páginas.
   */
  document.addEventListener(
    "click",
    async function (event) {
      const logoutButton = event.target.closest(
        ".logout-button, #logout-button"
      );

      if (!logoutButton) {
        return;
      }

      /*
       * Impede que o window.confirm antigo seja executado.
       */
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const confirmedLogout =
        await window.SystemModal.confirm({
          title: "Sair do sistema?",
          message:
            "Você precisará informar seus dados novamente para acessar o sistema.",
          confirmText: "Sim, sair",
          cancelText: "Continuar conectado",
          type: "warning"
        });

      if (!confirmedLogout) {
        return;
      }

      window.SystemModal.loading.show(
        "Encerrando sua sessão..."
      );

      window.setTimeout(function () {
        if (typeof fazerLogout === "function") {
          fazerLogout();
          return;
        }

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("usuarioLogado");

        sessionStorage.clear();

        window.location.href = "index.html";
      }, 700);
    },
    true
  );