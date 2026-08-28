const registrationForm =
  document.querySelector(
    "#registration-form"
  );

const fullNameInput =
  document.querySelector(
    "#full-name"
  );

/* =========================
   FILIAÇÃO
========================= */

const motherNameInput =
  document.querySelector(
    "#mother-name"
  );

const fatherNameInput =
  document.querySelector(
    "#father-name"
  );

const parentageError =
  document.querySelector(
    "#parentage-error"
  );

const cpfInput =
  document.querySelector(
    "#cpf"
  );

const birthDateInput =
  document.querySelector(
    "#birth-date"
  );

const voterTitleInput =
  document.querySelector(
    "#voter-title"
  );

const phoneInput =
  document.querySelector(
    "#phone"
  );

const electoralZoneInput =
  document.querySelector(
    "#electoral-zone"
  );

const electoralSectionInput =
  document.querySelector(
    "#electoral-section"
  );

const electoralMunicipalityInput =
  document.querySelector(
    "#electoral-municipality"
  );

const voterTitleStatus =
  document.querySelector(
    "#voter-title-status"
  );

const validateVoterTitleButton =
  document.querySelector(
    "#validate-voter-title-button"
  );

const voterTitleConfirmed =
  document.querySelector(
    "#voter-title-confirmed"
  );

const voterTitleValidationStatus =
  document.querySelector(
    "#voter-title-validation-status"
  );

const regionSelect =
  document.querySelector(
    "#region"
  );

const neighborhoodSelect =
  document.querySelector(
    "#neighborhood"
  );

const streetSelect =
  document.querySelector(
    "#street"
  );

const numberInput =
  document.querySelector(
    "#number"
  );

const complementInput =
  document.querySelector(
    "#complement"
  );

const observationsInput =
  document.querySelector(
    "#observations"
  );

const characterTotal =
  document.querySelector(
    "#character-total"
  );

const registeredBy =
  document.querySelector(
    "#registered-by"
  );

const saveButton =
  document.querySelector(
    "#save-button"
  );

const successModal =
  document.querySelector(
    "#success-modal"
  );

const newRegistrationButton =
  document.querySelector(
    "#new-registration-button"
  );

const validateCpfButton =
  document.querySelector(
    "#validate-cpf-button"
  );

const cpfConfirmed =
  document.querySelector(
    "#cpf-confirmed"
  );

const cpfValidationStatus =
  document.querySelector(
    "#cpf-validation-status"
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

const logoutButton =
  document.querySelector(
    "#logout-button"
  );

const loggedUser =
  document.querySelector(
    "#logged-user"
  );

const notificationButton =
  document.querySelector(
    ".notification-button"
  );


/* =========================
   CADASTRO / EDIÇÃO
========================= */

const pageParams =
  new URLSearchParams(
    window.location.search
  );

const editingPersonId =
  pageParams.get("id");

const isEditing =
  Boolean(
    editingPersonId
  );

let currentUser = null;


/* =========================
   MODAIS
========================= */

async function showMessage({
  title = "Aviso",
  message = "",
  type = "information"
}) {
  if (
    window.SystemModal
  ) {
    await window.SystemModal.alert({
      title,
      message,
      confirmText:
        "Entendi",
      type
    });

    return;
  }

  window.alert(
    message
  );
}


/* =========================
   MENU
========================= */

function openMenu() {
  sidebar
    ?.classList
    .add(
      "open"
    );

  menuOverlay
    ?.classList
    .add(
      "visible"
    );

  document.body.style.overflow =
    "hidden";
}


function closeMenu() {
  sidebar
    ?.classList
    .remove(
      "open"
    );

  menuOverlay
    ?.classList
    .remove(
      "visible"
    );

  document.body.style.overflow =
    "";
}


openMenuButton
  ?.addEventListener(
    "click",
    openMenu
  );


closeMenuButton
  ?.addEventListener(
    "click",
    closeMenu
  );


menuOverlay
  ?.addEventListener(
    "click",
    closeMenu
  );


window.addEventListener(
  "resize",
  function () {
    if (
      window.innerWidth >=
      1024
    ) {
      closeMenu();
    }
  }
);


/* =========================
   USUÁRIO
========================= */

function getUserName(
  user
) {
  if (!user) {
    return "Usuário";
  }

  const completeName = [
    user.first_name,
    user.last_name
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    completeName ||
    user.username ||
    "Usuário"
  );
}


function getInitials(
  name
) {
  const words =
    String(
      name || ""
    )
      .trim()
      .split(" ")
      .filter(Boolean);

  if (
    !words.length
  ) {
    return "US";
  }

  if (
    words.length === 1
  ) {
    return words[0]
      .slice(
        0,
        2
      )
      .toUpperCase();
  }

  return (
    words[0][0] +
    words[
      words.length - 1
    ][0]
  ).toUpperCase();
}


function fillCurrentUser(
  user
) {
  const name =
    getUserName(
      user
    );

  const initials =
    getInitials(
      name
    );

  const profileType =
    user.tipo ===
    "ADMINISTRADOR"
      ? "Administrador geral"
      : "Cadastrador";

  if (
    registeredBy
  ) {
    registeredBy.textContent =
      name;
  }

  if (
    loggedUser
  ) {
    loggedUser.textContent =
      name;
  }

  document
    .querySelectorAll(
      ".sidebar-user-info strong"
    )
    .forEach(
      function (
        element
      ) {
        element.textContent =
          name;
      }
    );

  document
    .querySelectorAll(
      ".sidebar-user-info span, .profile-info small"
    )
    .forEach(
      function (
        element
      ) {
        element.textContent =
          profileType;
      }
    );

  document
    .querySelectorAll(
      ".user-avatar, .profile-avatar"
    )
    .forEach(
      function (
        element
      ) {
        element.textContent =
          initials;
      }
    );
}


function configureMenuByProfile(
  user
) {
  if (
    user.tipo !==
    "CADASTRADOR"
  ) {
    return;
  }

  const administratorLinks = [
    'a[href="painel.html"]',
    'a[href="usuarios.html"]',
    'a[href="regioes.html"]',
    'a[href="relatorios.html"]',
    'a[href="configuracoes.html"]',
    'a[href="auditoria.html"]'
  ];

  document
    .querySelectorAll(
      administratorLinks.join(
        ", "
      )
    )
    .forEach(
      function (
        link
      ) {
        link.style.display =
          "none";
      }
    );
}


/* =========================
   FORMATAÇÃO
========================= */

function formatCpfValue(
  value
) {
  const numbers =
    String(
      value || ""
    )
      .replace(
        /\D/g,
        ""
      )
      .slice(
        0,
        11
      );

  return numbers
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
    );
}


function formatPhoneValue(
  value
) {
  const numbers =
    String(
      value || ""
    )
      .replace(
        /\D/g,
        ""
      )
      .slice(
        0,
        11
      );

  if (
    numbers.length > 10
  ) {
    return numbers.replace(
      /^(\d{2})(\d{5})(\d{0,4})/,
      "($1) $2-$3"
    );
  }

  if (
    numbers.length > 6
  ) {
    return numbers.replace(
      /^(\d{2})(\d{4})(\d{0,4})/,
      "($1) $2-$3"
    );
  }

  if (
    numbers.length > 2
  ) {
    return numbers.replace(
      /^(\d{2})(\d{0,5})/,
      "($1) $2"
    );
  }

  return numbers
    ? `(${numbers}`
    : "";
}


phoneInput
  ?.addEventListener(
    "input",
    function () {
      phoneInput.value =
        formatPhoneValue(
          phoneInput.value
        );
    }
  );


/* =========================
   VALIDAÇÃO DA FILIAÇÃO
========================= */

function validateParentage() {
  const motherName =
    motherNameInput
      ?.value
      .trim() || "";

  const fatherName =
    fatherNameInput
      ?.value
      .trim() || "";

  const valid =
    Boolean(
      motherName ||
      fatherName
    );

  if (
    parentageError
  ) {
    parentageError.textContent =
      valid
        ? ""
        : "Informe o nome da mãe ou o nome do pai.";
  }

  return valid;
}


motherNameInput
  ?.addEventListener(
    "input",
    validateParentage
  );


fatherNameInput
  ?.addEventListener(
    "input",
    validateParentage
  );


/* =========================
   CPF
========================= */

function resetCpfConfirmation() {
  if (
    cpfConfirmed
  ) {
    cpfConfirmed.checked =
      false;
  }

  if (
    cpfValidationStatus
  ) {
    cpfValidationStatus.textContent =
      "CPF ainda não conferido.";

    cpfValidationStatus
      .classList
      .remove(
        "confirmed"
      );
  }
}


cpfInput
  ?.addEventListener(
    "input",
    function () {
      cpfInput.value =
        formatCpfValue(
          cpfInput.value
        );

      resetCpfConfirmation();
    }
  );


birthDateInput
  ?.addEventListener(
    "change",
    resetCpfConfirmation
  );


validateCpfButton
  ?.addEventListener(
    "click",
    async function () {
      const cpf =
        cpfInput.value
          .replace(
            /\D/g,
            ""
          );

      const birthDate =
        birthDateInput.value;

      if (
        cpf.length !== 11
      ) {
        await showMessage({
          title:
            "CPF incompleto",

          message:
            "Informe um CPF com 11 números antes de consultar.",

          type:
            "warning"
        });

        cpfInput.focus();

        return;
      }

      if (
        !birthDate
      ) {
        await showMessage({
          title:
            "Data de nascimento",

          message:
            "Informe a data de nascimento antes de consultar o CPF.",

          type:
            "warning"
        });

        birthDateInput.focus();

        return;
      }

      sessionStorage.setItem(
        "cpfEmValidacao",
        cpf
      );

      sessionStorage.setItem(
        "nascimentoEmValidacao",
        birthDate
      );

      window.open(
        "https://servicos.receita.fazenda.gov.br/servicos/cpf/consultasituacao/consultapublica.asp",
        "_blank",
        "noopener,noreferrer"
      );
    }
  );


cpfConfirmed
  ?.addEventListener(
    "change",
    function () {
      if (
        !cpfValidationStatus
      ) {
        return;
      }

      if (
        cpfConfirmed.checked
      ) {
        cpfValidationStatus.textContent =
          "Consulta realizada e CPF conferido.";

        cpfValidationStatus
          .classList
          .add(
            "confirmed"
          );

        return;
      }

      resetCpfConfirmation();
    }
  );


/* =========================
   TÍTULO ELEITORAL
========================= */

function setVoterTitleStatus(
  message,
  type = ""
) {
  if (
    !voterTitleStatus
  ) {
    return;
  }

  voterTitleStatus.textContent =
    message;

  voterTitleStatus
    .classList
    .remove(
      "success",
      "error"
    );

  if (
    type
  ) {
    voterTitleStatus
      .classList
      .add(
        type
      );
  }
}


function resetVoterTitleConfirmation() {
  if (
    voterTitleConfirmed
  ) {
    voterTitleConfirmed.checked =
      false;
  }

  if (
    voterTitleValidationStatus
  ) {
    voterTitleValidationStatus
      .textContent =
      "Título ainda não conferido.";

    voterTitleValidationStatus
      .classList
      .remove(
        "confirmed"
      );
  }
}


function clearElectoralData() {
  if (
    electoralZoneInput
  ) {
    electoralZoneInput.value =
      "";
  }

  if (
    electoralSectionInput
  ) {
    electoralSectionInput.value =
      "";
  }

  if (
    electoralMunicipalityInput
  ) {
    electoralMunicipalityInput.value =
      "";
  }

  resetVoterTitleConfirmation();
}


voterTitleInput
  ?.addEventListener(
    "input",
    function () {
      const numbers =
        voterTitleInput.value
          .replace(
            /\D/g,
            ""
          )
          .slice(
            0,
            12
          );

      voterTitleInput.value =
        numbers;

      resetVoterTitleConfirmation();

      if (
        !numbers.length
      ) {
        setVoterTitleStatus(
          "Digite o título e consulte no site oficial do TSE."
        );

        return;
      }

      if (
        numbers.length < 12
      ) {
        setVoterTitleStatus(
          `${numbers.length} de 12 números digitados.`
        );

        return;
      }

      setVoterTitleStatus(
        "Título completo. Clique em “Consultar no TSE”."
      );
    }
  );
  validateVoterTitleButton
  ?.addEventListener(
    "click",
    async function () {
      const titulo =
        voterTitleInput
          ?.value
          .replace(
            /\D/g,
            ""
          ) || "";

      if (
        titulo.length !== 12
      ) {
        await showMessage({
          title:
            "Título incompleto",

          message:
            "Informe os 12 números do título de eleitor antes de consultar.",

          type:
            "warning"
        });

        voterTitleInput
          ?.focus();

        return;
      }

      sessionStorage.setItem(
        "tituloEmValidacao",
        titulo
      );

      window.open(
        "https://www.tse.jus.br/servicos-eleitorais/autoatendimento-eleitoral#/atendimento-eleitor",
        "_blank",
        "noopener,noreferrer"
      );
    }
  );


voterTitleConfirmed
  ?.addEventListener(
    "change",
    function () {
      if (
        !voterTitleValidationStatus
      ) {
        return;
      }

      if (
        voterTitleConfirmed.checked
      ) {
        voterTitleValidationStatus
          .textContent =
          "Consulta realizada e título conferido.";

        voterTitleValidationStatus
          .classList
          .add(
            "confirmed"
          );

        return;
      }

      resetVoterTitleConfirmation();
    }
  );


/* =========================
   OBSERVAÇÕES
========================= */

observationsInput
  ?.addEventListener(
    "input",
    function () {
      if (
        characterTotal
      ) {
        characterTotal.textContent =
          String(
            observationsInput
              .value
              .length
          );
      }
    }
  );


/* =========================
   ERROS DOS CAMPOS
========================= */

function getFieldErrorElement(
  field
) {
  if (
    !field
  ) {
    return null;
  }

  const formField =
    field.closest(
      ".form-field"
    );

  if (
    !formField
  ) {
    return null;
  }

  return formField
    .querySelector(
      ".field-error"
    );
}


function clearFieldError(
  field
) {
  if (
    !field
  ) {
    return;
  }

  field
    .classList
    .remove(
      "input-error"
    );

  const errorElement =
    getFieldErrorElement(
      field
    );

  if (
    errorElement
  ) {
    errorElement.textContent =
      "";
  }
}


function setFieldError(
  field,
  message
) {
  if (
    !field
  ) {
    return;
  }

  field
    .classList
    .add(
      "input-error"
    );

  const errorElement =
    getFieldErrorElement(
      field
    );

  if (
    errorElement
  ) {
    errorElement.textContent =
      message;
  }
}


function clearAllFieldErrors() {
  document
    .querySelectorAll(
      ".input-error"
    )
    .forEach(
      function (
        element
      ) {
        element
          .classList
          .remove(
            "input-error"
          );
      }
    );

  document
    .querySelectorAll(
      ".field-error"
    )
    .forEach(
      function (
        element
      ) {
        element.textContent =
          "";
      }
    );

  if (
    parentageError
  ) {
    parentageError.textContent =
      "";
  }
}


/* =========================
   VALIDAÇÃO DO FORMULÁRIO
========================= */

function validateForm() {
  clearAllFieldErrors();

  let valid =
    true;

  let firstError =
    null;

  const fullName =
    fullNameInput
      ?.value
      .trim() || "";

  const motherName =
    motherNameInput
      ?.value
      .trim() || "";

  const fatherName =
    fatherNameInput
      ?.value
      .trim() || "";

  const cpf =
    cpfInput
      ?.value
      .replace(
        /\D/g,
        ""
      ) || "";

  const birthDate =
    birthDateInput
      ?.value || "";

  const phone =
    phoneInput
      ?.value
      .replace(
        /\D/g,
        ""
      ) || "";

  if (
    !fullName
  ) {
    setFieldError(
      fullNameInput,
      "Informe o nome completo."
    );

    firstError =
      firstError ||
      fullNameInput;

    valid =
      false;
  }

  /*
   * FILIAÇÃO
   *
   * Pelo menos um dos nomes
   * precisa ser informado.
   */
  if (
    !motherName &&
    !fatherName
  ) {
    if (
      parentageError
    ) {
      parentageError.textContent =
        "Informe o nome da mãe ou o nome do pai.";
    }

    motherNameInput
      ?.classList
      .add(
        "input-error"
      );

    fatherNameInput
      ?.classList
      .add(
        "input-error"
      );

    firstError =
      firstError ||
      motherNameInput ||
      fatherNameInput;

    valid =
      false;
  }

  if (
    cpf.length !== 11
  ) {
    setFieldError(
      cpfInput,
      "Informe um CPF válido com 11 números."
    );

    firstError =
      firstError ||
      cpfInput;

    valid =
      false;
  }

  if (
    !birthDate
  ) {
    setFieldError(
      birthDateInput,
      "Informe a data de nascimento."
    );

    firstError =
      firstError ||
      birthDateInput;

    valid =
      false;
  }

  if (
    phone.length < 10
  ) {
    setFieldError(
      phoneInput,
      "Informe um telefone válido."
    );

    firstError =
      firstError ||
      phoneInput;

    valid =
      false;
  }

  if (
    !regionSelect
      ?.value
  ) {
    setFieldError(
      regionSelect,
      "Selecione a região."
    );

    firstError =
      firstError ||
      regionSelect;

    valid =
      false;
  }

  if (
    !neighborhoodSelect
      ?.value
  ) {
    setFieldError(
      neighborhoodSelect,
      "Selecione a localidade."
    );

    firstError =
      firstError ||
      neighborhoodSelect;

    valid =
      false;
  }

  if (
    !streetSelect
      ?.value
  ) {
    setFieldError(
      streetSelect,
      "Selecione a rua."
    );

    firstError =
      firstError ||
      streetSelect;

    valid =
      false;
  }

  /*
   * Quando estiver online,
   * o CPF precisa ter sido
   * conferido.
   */
  if (
    navigator.onLine &&
    cpfConfirmed &&
    !cpfConfirmed.checked
  ) {
    valid =
      false;

    firstError =
      firstError ||
      cpfConfirmed;
  }

  firstError
    ?.focus();

  return valid;
}


/* =========================
   DADOS DO CADASTRO
========================= */

function buildRegistrationData() {
  return {
    nome_completo:
      fullNameInput
        .value
        .trim(),

    /*
     * FILIAÇÃO
     */
    nome_mae:
      motherNameInput
        ?.value
        .trim() || "",

    nome_pai:
      fatherNameInput
        ?.value
        .trim() || "",

    cpf:
      cpfInput
        .value
        .replace(
          /\D/g,
          ""
        ),

    data_nascimento:
      birthDateInput.value,

    titulo_eleitor:
      voterTitleInput
        ?.value
        .replace(
          /\D/g,
          ""
        ) || "",

    zona_eleitoral:
      electoralZoneInput
        ?.value
        .trim() || "",

    secao_eleitoral:
      electoralSectionInput
        ?.value
        .trim() || "",

    municipio_eleitoral:
      electoralMunicipalityInput
        ?.value
        .trim() || "",

    telefone:
      phoneInput
        .value
        .replace(
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
      numberInput
        .value
        .trim(),

    complemento:
      complementInput
        ?.value
        .trim() || "",

    observacoes:
      observationsInput
        ?.value
        .trim() || "",

    status:
      "ATIVO",

    status_verificacao_cpf:
      cpfConfirmed
        ?.checked
        ? "CONSULTADO"
        : "NAO_VERIFICADO",

    status_verificacao_titulo:
      voterTitleInput
        ?.value
        .replace(
          /\D/g,
          ""
        ) &&
      voterTitleConfirmed
        ?.checked
        ? "CONSULTADO"
        : "NAO_VERIFICADO"
  };
}


/* =========================
   ERROS DO BACKEND
========================= */

function showBackendErrors(
  errors
) {
  const fields = {
    nome_completo:
      fullNameInput,

    /*
     * NOVOS CAMPOS
     */
    nome_mae:
      motherNameInput,

    nome_pai:
      fatherNameInput,

    cpf:
      cpfInput,

    data_nascimento:
      birthDateInput,

    titulo_eleitor:
      voterTitleInput,

    zona_eleitoral:
      electoralZoneInput,

    secao_eleitoral:
      electoralSectionInput,

    municipio_eleitoral:
      electoralMunicipalityInput,

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
      observationsInput
  };

  Object.entries(
    errors
  ).forEach(
    function ([
      fieldName,
      messages
    ]) {
      const field =
        fields[
          fieldName
        ];

      if (
        !field
      ) {
        return;
      }

      const message =
        Array.isArray(
          messages
        )
          ? messages.join(
              " "
            )
          : String(
              messages
            );

      setFieldError(
        field,
        message
      );
    }
  );
}
/* =========================
   ENDEREÇO
========================= */

async function loadRegions() {
  if (!regionSelect) {
    return;
  }

  try {
    const response =
      await apiFetch(
        "/regioes/"
      );

    if (!response.ok) {
      throw new Error(
        "Não foi possível carregar as regiões."
      );
    }

    const data =
      await response.json();

    const regions =
      Array.isArray(data)
        ? data
        : data.results || [];

    regionSelect.innerHTML = `
      <option value="">
        Selecione a região
      </option>
    `;

    regions.forEach(
      function (region) {
        const option =
          document.createElement(
            "option"
          );

        option.value =
          region.id;

        option.textContent =
          region.nome;

        regionSelect.appendChild(
          option
        );
      }
    );
  } catch (error) {
    console.error(
      "Erro ao carregar regiões:",
      error
    );

    await showMessage({
      title:
        "Erro ao carregar regiões",

      message:
        error.message ||
        "Não foi possível carregar as regiões.",

      type:
        "warning"
    });
  }
}


async function loadNeighborhoods(
  regionId
) {
  if (
    !neighborhoodSelect
  ) {
    return;
  }

  neighborhoodSelect.innerHTML = `
    <option value="">
      Carregando...
    </option>
  `;

  neighborhoodSelect.disabled =
    true;

  if (
    streetSelect
  ) {
    streetSelect.innerHTML = `
      <option value="">
        Selecione primeiro a localidade
      </option>
    `;

    streetSelect.disabled =
      true;
  }

  if (
    !regionId
  ) {
    neighborhoodSelect.innerHTML = `
      <option value="">
        Selecione primeiro a região
      </option>
    `;

    return;
  }

  try {
    const response =
      await apiFetch(
        `/localidades/?regiao=${regionId}`
      );

    if (!response.ok) {
      throw new Error(
        "Não foi possível carregar as localidades."
      );
    }

    const data =
      await response.json();

    const neighborhoods =
      Array.isArray(data)
        ? data
        : data.results || [];

    neighborhoodSelect.innerHTML = `
      <option value="">
        Selecione a localidade
      </option>
    `;

    neighborhoods.forEach(
      function (neighborhood) {
        const option =
          document.createElement(
            "option"
          );

        option.value =
          neighborhood.id;

        option.textContent =
          neighborhood.nome;

        neighborhoodSelect.appendChild(
          option
        );
      }
    );

    neighborhoodSelect.disabled =
      false;
  } catch (error) {
    console.error(
      "Erro ao carregar localidades:",
      error
    );

    neighborhoodSelect.innerHTML = `
      <option value="">
        Não foi possível carregar
      </option>
    `;

    await showMessage({
      title:
        "Erro ao carregar localidades",

      message:
        error.message ||
        "Não foi possível carregar as localidades.",

      type:
        "warning"
    });
  }
}


async function loadStreets(
  neighborhoodId
) {
  if (
    !streetSelect
  ) {
    return;
  }

  streetSelect.innerHTML = `
    <option value="">
      Carregando...
    </option>
  `;

  streetSelect.disabled =
    true;

  if (
    !neighborhoodId
  ) {
    streetSelect.innerHTML = `
      <option value="">
        Selecione primeiro a localidade
      </option>
    `;

    return;
  }

  try {
    const response =
      await apiFetch(
        `/ruas/?localidade=${neighborhoodId}`
      );

    if (!response.ok) {
      throw new Error(
        "Não foi possível carregar as ruas."
      );
    }

    const data =
      await response.json();

    const streets =
      Array.isArray(data)
        ? data
        : data.results || [];

    streetSelect.innerHTML = `
      <option value="">
        Selecione a rua
      </option>
    `;

    streets.forEach(
      function (street) {
        const option =
          document.createElement(
            "option"
          );

        option.value =
          street.id;

        option.textContent =
          street.nome;

        streetSelect.appendChild(
          option
        );
      }
    );

    streetSelect.disabled =
      false;
  } catch (error) {
    console.error(
      "Erro ao carregar ruas:",
      error
    );

    streetSelect.innerHTML = `
      <option value="">
        Não foi possível carregar
      </option>
    `;

    await showMessage({
      title:
        "Erro ao carregar ruas",

      message:
        error.message ||
        "Não foi possível carregar as ruas.",

      type:
        "warning"
    });
  }
}


regionSelect
  ?.addEventListener(
    "change",
    async function () {
      clearFieldError(
        regionSelect
      );

      await loadNeighborhoods(
        regionSelect.value
      );
    }
  );


neighborhoodSelect
  ?.addEventListener(
    "change",
    async function () {
      clearFieldError(
        neighborhoodSelect
      );

      await loadStreets(
        neighborhoodSelect.value
      );
    }
  );


streetSelect
  ?.addEventListener(
    "change",
    function () {
      clearFieldError(
        streetSelect
      );
    }
  );


/* =========================
   CARREGAR PESSOA NA EDIÇÃO
========================= */

async function loadPersonForEditing() {
  if (
    !isEditing ||
    !editingPersonId
  ) {
    return;
  }

  try {
    const response =
      await apiFetch(
        `/pessoas/${editingPersonId}/`
      );

    if (!response.ok) {
      let message =
        "Não foi possível carregar o cadastro para edição.";

      try {
        const errorData =
          await response.json();

        message =
          errorData.detail ||
          errorData.mensagem ||
          message;
      } catch {
        // mantém a mensagem padrão
      }

      throw new Error(
        message
      );
    }

    const pessoa =
      await response.json();

    /*
     * DADOS PESSOAIS
     */

    fullNameInput.value =
      pessoa.nome_completo ||
      "";

    /*
     * FILIAÇÃO
     *
     * CORREÇÃO:
     * agora mãe e pai também são
     * carregados durante a edição.
     */

    if (
      motherNameInput
    ) {
      motherNameInput.value =
        pessoa.nome_mae ||
        "";
    }

    if (
      fatherNameInput
    ) {
      fatherNameInput.value =
        pessoa.nome_pai ||
        "";
    }

    cpfInput.value =
      formatCpfValue(
        pessoa.cpf
      );

    birthDateInput.value =
      pessoa.data_nascimento ||
      "";

    phoneInput.value =
      formatPhoneValue(
        pessoa.telefone
      );

    /*
     * DADOS ELEITORAIS
     */

    if (
      voterTitleInput
    ) {
      voterTitleInput.value =
        String(
          pessoa.titulo_eleitor ||
          ""
        ).replace(
          /\D/g,
          ""
        );
    }

    if (
      electoralZoneInput
    ) {
      electoralZoneInput.value =
        pessoa.zona_eleitoral ||
        "";
    }

    if (
      electoralSectionInput
    ) {
      electoralSectionInput.value =
        pessoa.secao_eleitoral ||
        "";
    }

    if (
      electoralMunicipalityInput
    ) {
      electoralMunicipalityInput.value =
        pessoa.municipio_eleitoral ||
        "";
    }

    /*
     * ENDEREÇO
     */

    if (
      pessoa.regiao
    ) {
      regionSelect.value =
        String(
          pessoa.regiao
        );

      await loadNeighborhoods(
        pessoa.regiao
      );
    }

    if (
      pessoa.localidade
    ) {
      neighborhoodSelect.value =
        String(
          pessoa.localidade
        );

      await loadStreets(
        pessoa.localidade
      );
    }

    if (
      pessoa.rua
    ) {
      streetSelect.value =
        String(
          pessoa.rua
        );
    }

    numberInput.value =
      pessoa.numero ||
      "";

    if (
      complementInput
    ) {
      complementInput.value =
        pessoa.complemento ||
        "";
    }

    if (
      observationsInput
    ) {
      observationsInput.value =
        pessoa.observacoes ||
        "";
    }

    if (
      characterTotal
    ) {
      characterTotal.textContent =
        String(
          observationsInput
            ?.value
            .length || 0
        );
    }

    /*
     * RESPONSÁVEL
     */

    if (
      registeredBy
    ) {
      registeredBy.textContent =
        pessoa
          .cadastrada_por_nome ||
        getUserName(
          currentUser
        );
    }

    /*
     * STATUS DA VERIFICAÇÃO DO CPF
     */

    if (
      cpfConfirmed
    ) {
      cpfConfirmed.checked =
        pessoa
          .status_verificacao_cpf ===
        "CONSULTADO";

      if (
        cpfConfirmed.checked &&
        cpfValidationStatus
      ) {
        cpfValidationStatus.textContent =
          "Consulta realizada e CPF conferido.";

        cpfValidationStatus
          .classList
          .add(
            "confirmed"
          );
      }
    }

    /*
     * STATUS DO TÍTULO
     */

    if (
      voterTitleConfirmed
    ) {
      voterTitleConfirmed.checked =
        pessoa
          .status_verificacao_titulo ===
        "CONSULTADO";

      if (
        voterTitleConfirmed.checked &&
        voterTitleValidationStatus
      ) {
        voterTitleValidationStatus
          .textContent =
          "Consulta realizada e título conferido.";

        voterTitleValidationStatus
          .classList
          .add(
            "confirmed"
          );
      }
    }

    /*
     * ALTERA A INTERFACE PARA EDIÇÃO
     */

    const pageTitle =
      document.querySelector(
        ".topbar h1"
      );

    if (
      pageTitle
    ) {
      pageTitle.textContent =
        "Editar cadastro";
    }

    const introductionTitle =
      document.querySelector(
        ".page-introduction h2"
      );

    if (
      introductionTitle
    ) {
      introductionTitle.textContent =
        "Editar pessoa";
    }

    const introductionText =
      document.querySelector(
        ".page-introduction p"
      );

    if (
      introductionText
    ) {
      introductionText.textContent =
        "Atualize os dados da pessoa cadastrada.";
    }

    const buttonText =
      saveButton
        ?.querySelector(
          "span"
        );

    if (
      buttonText
    ) {
      buttonText.textContent =
        "Salvar alterações";
    }

  } catch (error) {
    console.error(
      "Erro ao carregar pessoa:",
      error
    );

    await showMessage({
      title:
        "Erro ao carregar cadastro",

      message:
        error.message ||
        "Não foi possível carregar os dados da pessoa.",

      type:
        "warning"
    });
  }
}


/* =========================
   SALVAR
========================= */

async function saveRegistration() {
  const data =
    buildRegistrationData();

  /*
   * Edição offline não é permitida.
   */
  if (
    isEditing &&
    !navigator.onLine
  ) {
    throw new Error(
      "Para editar um cadastro é necessário estar conectado à internet."
    );
  }

  /*
   * NOVO CADASTRO OFFLINE
   */

  if (
    !isEditing &&
    !navigator.onLine
  ) {
    if (
      window.OfflineDB &&
      typeof window
        .OfflineDB
        .savePendingPerson ===
        "function"
    ) {
      await window
        .OfflineDB
        .savePendingPerson(
          data
        );

      return {
        offline:
          true
      };
    }

    throw new Error(
      "Você está sem internet e o armazenamento offline não está disponível."
    );
  }

  /*
   * ONLINE
   */

  const endpoint =
    isEditing
      ? `/pessoas/${editingPersonId}/`
      : "/pessoas/";

  const method =
    isEditing
      ? "PATCH"
      : "POST";

  const response =
    await apiFetch(
      endpoint,
      {
        method,

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(
            data
          )
      }
    );

  if (
    !response.ok
  ) {
    let errorData =
      null;

    try {
      errorData =
        await response.json();
    } catch {
      errorData =
        null;
    }

    if (
      errorData &&
      typeof errorData ===
      "object"
    ) {
      showBackendErrors(
        errorData
      );

      const messages =
        Object.values(
          errorData
        )
          .flat()
          .filter(Boolean)
          .map(String);

      if (
        messages.length
      ) {
        throw new Error(
          messages.join(
            " "
          )
        );
      }
    }

    throw new Error(
      isEditing
        ? "Não foi possível atualizar o cadastro."
        : "Não foi possível realizar o cadastro."
    );
  }

  /*
   * DELETE pode não retornar JSON,
   * mas POST/PATCH normalmente retorna.
   */

  try {
    return await response.json();
  } catch {
    return {
      success:
        true
    };
  }
}


/* =========================
   ENVIO DO FORMULÁRIO
========================= */

registrationForm
  ?.addEventListener(
    "submit",
    async function (
      event
    ) {
      event.preventDefault();

      /*
       * Valida também a filiação.
       */
      if (
        !validateParentage()
      ) {
        motherNameInput
          ?.focus();

        return;
      }

      if (
        !validateForm()
      ) {
        return;
      }

      saveButton.disabled =
        true;

      const buttonText =
        saveButton
          ?.querySelector(
            "span"
          );

      if (
        buttonText
      ) {
        buttonText.textContent =
          isEditing
            ? "Salvando alterações..."
            : "Salvando...";
      }

      try {
        const resultado =
          await saveRegistration();

        sessionStorage.removeItem(
          "cpfEmValidacao"
        );

        sessionStorage.removeItem(
          "nascimentoEmValidacao"
        );

        sessionStorage.removeItem(
          "tituloEmValidacao"
        );

        /*
         * CADASTRO SALVO OFFLINE
         */

        if (
          resultado?.offline
        ) {
          await showMessage({
            title:
              "Cadastro salvo offline",

            message:
              "O cadastro foi salvo neste dispositivo e será enviado automaticamente quando a internet voltar.",

            type:
              "success"
          });

          registrationForm
            ?.reset();

          clearElectoralData();

          setVoterTitleStatus(
            "Digite o título e consulte no site oficial do TSE."
          );

          neighborhoodSelect.innerHTML = `
            <option value="">
              Selecione primeiro a região
            </option>
          `;

          streetSelect.innerHTML = `
            <option value="">
              Selecione primeiro a localidade
            </option>
          `;

          neighborhoodSelect.disabled =
            true;

          streetSelect.disabled =
            true;

          if (
            characterTotal
          ) {
            characterTotal.textContent =
              "0";
          }

          resetCpfConfirmation();

          resetVoterTitleConfirmation();

          clearAllFieldErrors();

          fullNameInput
            ?.focus();

          return;
        }

        /*
         * EDIÇÃO CONCLUÍDA
         */

        if (
          isEditing
        ) {
          await showMessage({
            title:
              "Cadastro atualizado",

            message:
              "Os dados da pessoa foram atualizados com sucesso.",

            type:
              "success"
          });

          window.location.href =
            "pessoas.html";

          return;
        }

        /*
         * NOVO CADASTRO ONLINE
         */

        if (
          successModal
        ) {
          successModal
            .classList
            .add(
              "visible"
            );

          document.body.style.overflow =
            "hidden";

        } else {
          await showMessage({
            title:
              "Cadastro realizado",

            message:
              "A pessoa foi cadastrada com sucesso.",

            type:
              "success"
          });
        }

      } catch (
        error
      ) {
        console.error(
          "Erro ao salvar cadastro:",
          error
        );

        await showMessage({
          title:
            isEditing
              ? "Erro ao atualizar"
              : "Erro ao cadastrar",

          message:
            error.message ||
            "Não foi possível salvar o cadastro.",

          type:
            "warning"
        });

      } finally {
        saveButton.disabled =
          false;

        if (
          buttonText
        ) {
          buttonText.textContent =
            isEditing
              ? "Salvar alterações"
              : "Salvar cadastro";
        }
      }
    }
  );


/* =========================
   NOVO CADASTRO
========================= */

newRegistrationButton
  ?.addEventListener(
    "click",
    function () {
      if (
        isEditing
      ) {
        window.location.href =
          "novo-cadastro.html";

        return;
      }

      registrationForm
        ?.reset();

      clearElectoralData();

      setVoterTitleStatus(
        "Digite o título e consulte no site oficial do TSE."
      );

      neighborhoodSelect.innerHTML = `
        <option value="">
          Selecione primeiro a região
        </option>
      `;

      streetSelect.innerHTML = `
        <option value="">
          Selecione primeiro a localidade
        </option>
      `;

      neighborhoodSelect.disabled =
        true;

      streetSelect.disabled =
        true;

      if (
        characterTotal
      ) {
        characterTotal.textContent =
          "0";
      }

      resetCpfConfirmation();

      resetVoterTitleConfirmation();

      clearAllFieldErrors();

      successModal
        ?.classList
        .remove(
          "visible"
        );

      document.body.style.overflow =
        "";

      fullNameInput
        ?.focus();
    }
  );


/* =========================
   FECHAR MODAL COM ESC
========================= */

document.addEventListener(
  "keydown",
  function (
    event
  ) {
    if (
      event.key ===
        "Escape" &&
      successModal
        ?.classList
        .contains(
          "visible"
        )
    ) {
      successModal
        .classList
        .remove(
          "visible"
        );

      document.body.style.overflow =
        "";
    }
  }
);


/* =========================
   LOGOUT
========================= */

logoutButton
  ?.addEventListener(
    "click",
    async function () {
      try {
        if (
          typeof logout ===
          "function"
        ) {
          await logout();
          return;
        }

        localStorage.removeItem(
          "access"
        );

        localStorage.removeItem(
          "refresh"
        );

        sessionStorage.clear();

        window.location.href =
          "index.html";

      } catch (
        error
      ) {
        console.error(
          "Erro ao sair:",
          error
        );

        window.location.href =
          "index.html";
      }
    }
  );


/* =========================
   NOTIFICAÇÕES
========================= */

notificationButton
  ?.addEventListener(
    "click",
    async function () {
      await showMessage({
        title:
          "Notificações",

        message:
          "Você não possui novas notificações.",

        type:
          "information"
      });
    }
  );


/* =========================
   LIMPAR ERRO AO DIGITAR
========================= */

[
  fullNameInput,
  motherNameInput,
  fatherNameInput,
  cpfInput,
  birthDateInput,
  phoneInput,
  voterTitleInput,
  electoralZoneInput,
  electoralSectionInput,
  electoralMunicipalityInput,
  numberInput,
  complementInput,
  observationsInput
]
  .filter(Boolean)
  .forEach(
    function (
      field
    ) {
      field.addEventListener(
        "input",
        function () {
          clearFieldError(
            field
          );

          /*
           * Mãe e pai compartilham
           * a validação de filiação.
           */
          if (
            field ===
              motherNameInput ||
            field ===
              fatherNameInput
          ) {
            validateParentage();
          }
        }
      );
    }
  );


/* =========================
   INICIALIZAÇÃO
========================= */

async function initializePage() {
  try {
    /*
     * Obtém usuário autenticado.
     */

    if (
      typeof requireAuth ===
      "function"
    ) {
      currentUser =
        await requireAuth();
    }

    /*
     * Alguns projetos retornam
     * o usuário por outra função.
     */

    if (
      !currentUser &&
      typeof getCurrentUser ===
        "function"
    ) {
      currentUser =
        await getCurrentUser();
    }

    if (
      currentUser
    ) {
      fillCurrentUser(
        currentUser
      );

      configureMenuByProfile(
        currentUser
      );
    }

    /*
     * Carrega regiões primeiro.
     */

    await loadRegions();

    /*
     * Estado inicial dos selects.
     */

    if (
      !isEditing
    ) {
      if (
        neighborhoodSelect
      ) {
        neighborhoodSelect.innerHTML = `
          <option value="">
            Selecione primeiro a região
          </option>
        `;

        neighborhoodSelect.disabled =
          true;
      }

      if (
        streetSelect
      ) {
        streetSelect.innerHTML = `
          <option value="">
            Selecione primeiro a localidade
          </option>
        `;

        streetSelect.disabled =
          true;
      }
    }

    /*
     * Se tiver ?id=...
     * abre em modo edição.
     */

    if (
      isEditing
    ) {
      await loadPersonForEditing();
    }

    /*
     * Contador de observações.
     */

    if (
      characterTotal
    ) {
      characterTotal.textContent =
        String(
          observationsInput
            ?.value
            .length || 0
        );
    }

    /*
     * Estado inicial do título.
     */

    if (
      !isEditing
    ) {
      setVoterTitleStatus(
        "Digite o título e consulte no site oficial do TSE."
      );
    }

  } catch (
    error
  ) {
    console.error(
      "Erro ao inicializar página:",
      error
    );

    await showMessage({
      title:
        "Erro ao carregar página",

      message:
        error.message ||
        "Não foi possível carregar os dados necessários.",

      type:
        "warning"
    });
  }
}


/* =========================
   INICIAR
========================= */

initializePage();
