document.addEventListener(
  "DOMContentLoaded",
  function () {
    const settingsTabs =
      document.querySelectorAll(
        ".settings-tab"
      );

    const settingsPanels =
      document.querySelectorAll(
        ".settings-panel"
      );

    const saveSettingsButton =
      document.querySelector(
        "#save-settings"
      );

    const settingsLogoInput =
      document.querySelector(
        "#settings-logo-input"
      );

    const settingsLogoPreview =
      document.querySelector(
        "#settings-logo-preview"
      );

    const passwordForm =
      document.querySelector(
        "#password-form"
      );

    const lastBackup =
      document.querySelector(
        "#last-backup"
      );

    const createBackupButton =
      document.querySelector(
        "#create-backup"
      );

    const restoreBackupInput =
      document.querySelector(
        "#restore-backup-input"
      );

    const settingsConfirmation =
      document.querySelector(
        "#settings-confirmation"
      );

    const loggedUser =
      document.querySelector(
        "#logged-user"
      );

    const sidebar =
      document.querySelector(
        "#sidebar"
      );

    const menuOverlay =
      document.querySelector(
        "#menu-overlay"
      );

    const openMenuButton =
      document.querySelector(
        "#open-menu"
      );

    const closeMenuButton =
      document.querySelector(
        "#close-menu"
      );


    let currentUser = null;
    let currentSettings = null;


    /* =========================
       MENSAGENS
    ========================= */

    function showSettingsMessage(
      message,
      type = "success"
    ) {
      if (!settingsConfirmation) {
        window.alert(message);
        return;
      }

      const text =
        settingsConfirmation.querySelector(
          "span"
        ) ||
        settingsConfirmation;

      text.textContent =
        message;

      settingsConfirmation
        .classList
        .remove(
          "error"
        );

      if (type === "error") {
        settingsConfirmation
          .classList
          .add(
            "error"
          );
      }

      settingsConfirmation
        .classList
        .add(
          "visible"
        );

      window.clearTimeout(
        showSettingsMessage.timeout
      );

      showSettingsMessage.timeout =
        window.setTimeout(
          function () {
            settingsConfirmation
              .classList
              .remove(
                "visible"
              );
          },
          3500
        );
    }


    async function showModal({
      title = "Aviso",
      message = "",
      type = "information",
    }) {
      if (window.SystemModal) {
        await SystemModal.alert({
          title,
          message,
          type,
          confirmText: "Entendi",
        });

        return;
      }

      window.alert(message);
    }


    /* =========================
       MENU
    ========================= */

    function openMenu() {
      sidebar?.classList.add(
        "open"
      );

      menuOverlay?.classList.add(
        "visible"
      );

      document.body.style.overflow =
        "hidden";
    }


    function closeMenu() {
      sidebar?.classList.remove(
        "open"
      );

      menuOverlay?.classList.remove(
        "visible"
      );

      document.body.style.overflow =
        "";
    }


    openMenuButton?.addEventListener(
      "click",
      openMenu
    );

    closeMenuButton?.addEventListener(
      "click",
      closeMenu
    );

    menuOverlay?.addEventListener(
      "click",
      closeMenu
    );


    /* =========================
       ABAS
    ========================= */

    settingsTabs.forEach(
      function (tab) {
        tab.addEventListener(
          "click",
          function () {
            const selectedTab =
              tab.dataset.tab;

            settingsTabs.forEach(
              function (item) {
                item.classList.remove(
                  "active"
                );
              }
            );

            settingsPanels.forEach(
              function (panel) {
                panel.classList.remove(
                  "active"
                );
              }
            );

            tab.classList.add(
              "active"
            );

            const selectedPanel =
              document.getElementById(
                selectedTab
              );

            selectedPanel
              ?.classList
              .add(
                "active"
              );
          }
        );
      }
    );


    /* =========================
       AUXILIARES
    ========================= */

    function getFieldValue(id) {
      const field =
        document.getElementById(
          id
        );

      return field
        ? field.value.trim()
        : "";
    }


    function setFieldValue(
      id,
      value
    ) {
      const field =
        document.getElementById(
          id
        );

      if (
        field &&
        value !== undefined &&
        value !== null
      ) {
        field.value =
          value;
      }
    }


    function getCheckboxValue(id) {
      const field =
        document.getElementById(
          id
        );

      return Boolean(
        field?.checked
      );
    }


    function setCheckboxValue(
      id,
      value
    ) {
      const field =
        document.getElementById(
          id
        );

      if (field) {
        field.checked =
          Boolean(value);
      }
    }


    function getUserName(user) {
      if (!user) {
        return "Administrador";
      }

      return (
        user.nome_completo ||
        [
          user.first_name,
          user.last_name,
        ]
          .filter(Boolean)
          .join(" ")
          .trim() ||
        user.username ||
        "Administrador"
      );
    }


    function getInitials(name) {
      const parts =
        String(name || "")
          .trim()
          .split(" ")
          .filter(Boolean);

      if (!parts.length) {
        return "AD";
      }

      if (parts.length === 1) {
        return parts[0]
          .slice(0, 2)
          .toUpperCase();
      }

      return (
        parts[0][0] +
        parts[parts.length - 1][0]
      ).toUpperCase();
    }


    /* =========================
       USUÁRIO LOGADO
    ========================= */

    function fillCurrentUser(user) {
      const name =
        getUserName(user);

      const initials =
        getInitials(name);

      if (loggedUser) {
        loggedUser.textContent =
          name;
      }

      setFieldValue(
        "administrator-name",
        name
      );

      setFieldValue(
        "administrator-email",
        user.email || ""
      );

      document
        .querySelectorAll(
          ".sidebar-user-info strong"
        )
        .forEach(
          function (element) {
            element.textContent =
              name;
          }
        );

      document
        .querySelectorAll(
          ".user-avatar, .profile-avatar"
        )
        .forEach(
          function (element) {
            element.textContent =
              initials;
          }
        );
    }


    /* =========================
       CARREGAR CONFIGURAÇÕES
    ========================= */

    async function loadSettings() {
      const response =
        await apiFetch(
          "/configuracoes/"
        );

      if (!response.ok) {
        throw new Error(
          "Não foi possível carregar as configurações."
        );
      }

      const settings =
        await response.json();

      currentSettings =
        settings;

      setFieldValue(
        "system-name",
        settings.nome_sistema
      );

      setFieldValue(
        "institution-name",
        settings.nome_instituicao
      );

      setFieldValue(
        "institution-email",
        settings.email_instituicao
      );

      setCheckboxValue(
        "compact-menu",
        settings.menu_compacto
      );

      setCheckboxValue(
        "interface-animations",
        settings.animacoes_interface
      );

      setCheckboxValue(
        "permission-create",
        settings.cadastrador_pode_criar
      );

      setCheckboxValue(
        "permission-edit",
        settings.cadastrador_pode_editar
      );

      setCheckboxValue(
        "permission-delete",
        settings.cadastrador_pode_excluir
      );

      setCheckboxValue(
        "permission-view-others",
        settings.cadastrador_pode_ver_outros
      );

      setCheckboxValue(
        "permission-export",
        settings.cadastrador_pode_exportar
      );

      setCheckboxValue(
        "automatic-logout",
        settings.logout_automatico
      );

      if (
        settings.logo_url &&
        settingsLogoPreview
      ) {
        settingsLogoPreview.src =
          settings.logo_url;
      }

      if (lastBackup) {
        if (
          settings.ultimo_backup
        ) {
          lastBackup.textContent =
            new Date(
              settings.ultimo_backup
            ).toLocaleString(
              "pt-BR"
            );
        } else {
          lastBackup.textContent =
            "Nenhum backup realizado";
        }
      }
    }


    /* =========================
       SALVAR CONFIGURAÇÕES
    ========================= */

    async function saveSettings() {
      saveSettingsButton.disabled =
        true;

      const originalText =
        saveSettingsButton
          .querySelector(
            "span"
          )
          ?.textContent;

      const buttonText =
        saveSettingsButton
          .querySelector(
            "span"
          );

      if (buttonText) {
        buttonText.textContent =
          "Salvando...";
      }

      try {
        const payload = {
          nome_sistema:
            getFieldValue(
              "system-name"
            ) ||
            "Gestão de Cadastros",

          nome_instituicao:
            getFieldValue(
              "institution-name"
            ),

          email_instituicao:
            getFieldValue(
              "institution-email"
            ),

          menu_compacto:
            getCheckboxValue(
              "compact-menu"
            ),

          animacoes_interface:
            getCheckboxValue(
              "interface-animations"
            ),

          cadastrador_pode_criar:
            getCheckboxValue(
              "permission-create"
            ),

          cadastrador_pode_editar:
            getCheckboxValue(
              "permission-edit"
            ),

          cadastrador_pode_excluir:
            getCheckboxValue(
              "permission-delete"
            ),

          cadastrador_pode_ver_outros:
            getCheckboxValue(
              "permission-view-others"
            ),

          cadastrador_pode_exportar:
            getCheckboxValue(
              "permission-export"
            ),

          logout_automatico:
            getCheckboxValue(
              "automatic-logout"
            ),
        };


        const response =
          await apiFetch(
            "/configuracoes/",
            {
              method: "PATCH",

              body:
                JSON.stringify(
                  payload
                ),
            }
          );


        if (!response.ok) {
          let errorData = {};

          try {
            errorData =
              await response.json();
          } catch {
            // sem JSON
          }

          const firstError =
            Object.values(
              errorData
            )[0];

          const message =
            Array.isArray(
              firstError
            )
              ? firstError[0]
              : (
                errorData.detail ||
                "Não foi possível salvar as configurações."
              );

          throw new Error(
            message
          );
        }


        currentSettings =
          await response.json();

        showSettingsMessage(
          "Configurações salvas com sucesso."
        );

      } catch (error) {
        console.error(
          "Erro ao salvar configurações:",
          error
        );

        showSettingsMessage(
          error.message,
          "error"
        );

      } finally {
        saveSettingsButton.disabled =
          false;

        if (buttonText) {
          buttonText.textContent =
            originalText ||
            "Salvar configurações";
        }
      }
    }


    saveSettingsButton
      ?.addEventListener(
        "click",
        saveSettings
      );


    /* =========================
       LOGO
    ========================= */

    settingsLogoInput
      ?.addEventListener(
        "change",
        async function (event) {
          const file =
            event.target.files[0];

          if (!file) {
            return;
          }

          const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/webp",
          ];

          if (
            !allowedTypes.includes(
              file.type
            )
          ) {
            await showModal({
              title:
                "Formato inválido",

              message:
                "Escolha uma imagem PNG, JPG ou WEBP.",

              type:
                "warning",
            });

            settingsLogoInput.value =
              "";

            return;
          }


          if (
            file.size >
            2 * 1024 * 1024
          ) {
            await showModal({
              title:
                "Imagem muito grande",

              message:
                "A imagem deve ter no máximo 2 MB.",

              type:
                "warning",
            });

            settingsLogoInput.value =
              "";

            return;
          }


          if (
            settingsLogoPreview
          ) {
            const previewUrl =
              URL.createObjectURL(
                file
              );

            settingsLogoPreview.src =
              previewUrl;
          }


          try {
            if (
              window.SystemModal
                ?.loading
            ) {
              SystemModal.loading.show(
                "Enviando nova logo..."
              );
            }


            const formData =
              new FormData();

            formData.append(
              "logo",
              file
            );


            const response =
              await apiFetch(
                "/configuracoes/",
                {
                  method:
                    "PATCH",

                  body:
                    formData,
                }
              );


            if (!response.ok) {
              let errorData = {};

              try {
                errorData =
                  await response.json();
              } catch {
                // sem JSON
              }

              throw new Error(
                errorData.detail ||
                "Não foi possível atualizar a logo."
              );
            }


            const data =
              await response.json();

            currentSettings =
              data;

            if (
              data.logo_url &&
              settingsLogoPreview
            ) {
              settingsLogoPreview.src =
                data.logo_url;
            }


            showSettingsMessage(
              "Logo atualizada com sucesso."
            );

          } catch (error) {
            console.error(
              "Erro ao enviar logo:",
              error
            );

            await showModal({
              title:
                "Erro na logo",

              message:
                error.message,

              type:
                "warning",
            });

          } finally {
            if (
              window.SystemModal
                ?.loading
            ) {
              SystemModal.loading.hide();
            }

            settingsLogoInput.value =
              "";
          }
        }
      );


    /* =========================
       ALTERAR SENHA
    ========================= */

    passwordForm
      ?.addEventListener(
        "submit",
        async function (event) {
          event.preventDefault();

          const currentPassword =
            getFieldValue(
              "current-password"
            );

          const newPassword =
            getFieldValue(
              "new-password"
            );

          const confirmPassword =
            getFieldValue(
              "confirm-password"
            );


          if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
          ) {
            await showModal({
              title:
                "Campos obrigatórios",

              message:
                "Preencha todos os campos de senha.",

              type:
                "warning",
            });

            return;
          }


          if (
            newPassword.length < 8
          ) {
            await showModal({
              title:
                "Senha muito curta",

              message:
                "A nova senha precisa ter pelo menos 8 caracteres.",

              type:
                "warning",
            });

            return;
          }


          if (
            newPassword !==
            confirmPassword
          ) {
            await showModal({
              title:
                "Senhas diferentes",

              message:
                "A confirmação não corresponde à nova senha.",

              type:
                "warning",
            });

            return;
          }


          const submitButton =
            passwordForm
              .querySelector(
                'button[type="submit"]'
              );


          if (submitButton) {
            submitButton.disabled =
              true;
          }


          try {
            if (
              window.SystemModal
                ?.loading
            ) {
              SystemModal.loading.show(
                "Alterando senha..."
              );
            }


            const response =
              await apiFetch(
                "/configuracoes/alterar-senha/",
                {
                  method:
                    "POST",

                  body:
                    JSON.stringify({
                      senha_atual:
                        currentPassword,

                      nova_senha:
                        newPassword,

                      confirmar_senha:
                        confirmPassword,
                    }),
                }
              );


            let data = {};

            try {
              data =
                await response.json();
            } catch {
              // sem JSON
            }


            if (!response.ok) {
              throw new Error(
                data.detail ||
                "Não foi possível alterar a senha."
              );
            }


            passwordForm.reset();


            await showModal({
              title:
                "Senha alterada",

              message:
                data.detail ||
                "Senha alterada com sucesso.",

              type:
                "success",
            });


            /*
              Depois de alterar a senha, os tokens
              atuais podem continuar válidos até
              expirar. Para maior segurança,
              encerra a sessão.
            */

            limparSessao();

            window.location.href =
              "index.html";

          } catch (error) {
            console.error(
              "Erro ao alterar senha:",
              error
            );

            await showModal({
              title:
                "Não foi possível alterar",

              message:
                error.message,

              type:
                "warning",
            });

          } finally {
            if (
              window.SystemModal
                ?.loading
            ) {
              SystemModal.loading.hide();
            }

            if (submitButton) {
              submitButton.disabled =
                false;
            }
          }
        }
      );


    /* =========================
       BACKUP
    ========================= */

    createBackupButton
      ?.addEventListener(
        "click",
        async function () {
          /*
            O backend ainda não possui endpoint
            real de backup.

            Portanto, não vamos fingir que existe
            backup do banco.
          */

          await showModal({
            title:
              "Backup do sistema",

            message:
              "A estrutura de configurações já está conectada ao banco, mas o endpoint de backup completo do banco ainda precisa ser criado.",

            type:
              "information",
          });
        }
      );


    restoreBackupInput
      ?.addEventListener(
        "change",
        async function () {
          restoreBackupInput.value =
            "";

          await showModal({
            title:
              "Restaurar backup",

            message:
              "A restauração de backup do banco ainda não está disponível no backend.",

            type:
              "information",
          });
        }
      );


    /* =========================
       INICIAR
    ========================= */

    async function initializeSettingsPage() {
      try {
        currentUser =
          await buscarUsuarioLogado();


        if (
          !currentUser ||
          currentUser.tipo !==
            "ADMINISTRADOR"
        ) {
          window.location.href =
            "pessoas.html";

          return;
        }


        fillCurrentUser(
          currentUser
        );


        await loadSettings();


        if (window.lucide) {
          window.lucide.createIcons();
        }

      } catch (error) {
        console.error(
          "Erro ao iniciar configurações:",
          error
        );


        await showModal({
          title:
            "Não foi possível carregar",

          message:
            error.message,

          type:
            "warning",
        });
      }
    }


    initializeSettingsPage();
  }
);