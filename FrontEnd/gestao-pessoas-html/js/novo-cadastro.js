const registrationForm = document.querySelector(
  "#registration-form"
);

const fullNameInput = document.querySelector("#full-name");
const cpfInput = document.querySelector("#cpf");
const birthDateInput = document.querySelector("#birth-date");
const voterTitleInput = document.querySelector("#voter-title");
const phoneInput = document.querySelector("#phone");

const electoralZoneInput = document.querySelector(
  "#electoral-zone"
);

const electoralSectionInput = document.querySelector(
  "#electoral-section"
);

const electoralMunicipalityInput = document.querySelector(
  "#electoral-municipality"
);

const voterTitleStatus = document.querySelector(
  "#voter-title-status"
);

const validateVoterTitleButton = document.querySelector(
  "#validate-voter-title-button"
);

const voterTitleConfirmed = document.querySelector(
  "#voter-title-confirmed"
);

const voterTitleValidationStatus = document.querySelector(
  "#voter-title-validation-status"
);

const regionSelect = document.querySelector("#region");

const neighborhoodSelect = document.querySelector(
  "#neighborhood"
);

const streetSelect = document.querySelector("#street");
const numberInput = document.querySelector("#number");
const complementInput = document.querySelector("#complement");

const observationsInput = document.querySelector(
  "#observations"
);

const characterTotal = document.querySelector(
  "#character-total"
);

const registeredBy = document.querySelector("#registered-by");
const saveButton = document.querySelector("#save-button");
const successModal = document.querySelector("#success-modal");

const newRegistrationButton = document.querySelector(
  "#new-registration-button"
);

const validateCpfButton = document.querySelector(
  "#validate-cpf-button"
);

const cpfConfirmed = document.querySelector("#cpf-confirmed");

const cpfValidationStatus = document.querySelector(
  "#cpf-validation-status"
);

const sidebar = document.querySelector("#sidebar");

const menuOverlay = document.querySelector(
  "#menu-overlay"
);

const openMenuButton = document.querySelector("#open-menu");
const closeMenuButton = document.querySelector("#close-menu");
const logoutButton = document.querySelector("#logout-button");
const loggedUser = document.querySelector("#logged-user");

const notificationButton = document.querySelector(
  ".notification-button"
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
  if (window.SystemModal) {
    await window.SystemModal.alert({
      title,
      message,
      confirmText: "Entendi",
      type
    });

    return;
  }

  window.alert(message);
}


/* =========================
   MENU
========================= */

function openMenu() {
  sidebar?.classList.add("open");
  menuOverlay?.classList.add("visible");
  document.body.style.overflow = "hidden";
}

function closeMenu() {
  sidebar?.classList.remove("open");
  menuOverlay?.classList.remove("visible");
  document.body.style.overflow = "";
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

window.addEventListener(
  "resize",
  function () {
    if (window.innerWidth >= 1024) {
      closeMenu();
    }
  }
);


/* =========================
   USUÁRIO
========================= */

function getUserName(user) {
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


function getInitials(name) {
  const words = String(name || "")
    .trim()
    .split(" ")
    .filter(Boolean);

  if (!words.length) {
    return "US";
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    words[0][0] +
    words[words.length - 1][0]
  ).toUpperCase();
}


function fillCurrentUser(user) {
  const name = getUserName(user);
  const initials = getInitials(name);

  const profileType =
    user.tipo === "ADMINISTRADOR"
      ? "Administrador geral"
      : "Cadastrador";

  if (registeredBy) {
    registeredBy.textContent = name;
  }

  if (loggedUser) {
    loggedUser.textContent = name;
  }

  document
    .querySelectorAll(
      ".sidebar-user-info strong"
    )
    .forEach(function (element) {
      element.textContent = name;
    });

  document
    .querySelectorAll(
      ".sidebar-user-info span, .profile-info small"
    )
    .forEach(function (element) {
      element.textContent = profileType;
    });

  document
    .querySelectorAll(
      ".user-avatar, .profile-avatar"
    )
    .forEach(function (element) {
      element.textContent = initials;
    });
}


function configureMenuByProfile(user) {
  if (
    user.tipo !== "CADASTRADOR"
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
      administratorLinks.join(", ")
    )
    .forEach(function (link) {
      link.style.display = "none";
    });
}


/* =========================
   MÁSCARA DO TELEFONE
========================= */

phoneInput?.addEventListener(
  "input",
  function () {
    let numbers = phoneInput.value
      .replace(/\D/g, "")
      .slice(0, 11);

    if (numbers.length > 10) {
      phoneInput.value = numbers.replace(
        /^(\d{2})(\d{5})(\d{0,4})/,
        "($1) $2-$3"
      );

      return;
    }

    if (numbers.length > 6) {
      phoneInput.value = numbers.replace(
        /^(\d{2})(\d{4})(\d{0,4})/,
        "($1) $2-$3"
      );

      return;
    }

    if (numbers.length > 2) {
      phoneInput.value = numbers.replace(
        /^(\d{2})(\d{0,5})/,
        "($1) $2"
      );

      return;
    }

    phoneInput.value = numbers
      ? `(${numbers}`
      : "";
  }
);


/* =========================
   CPF
========================= */

function resetCpfConfirmation() {
  if (cpfConfirmed) {
    cpfConfirmed.checked = false;
  }

  if (cpfValidationStatus) {
    cpfValidationStatus.textContent =
      "CPF ainda não conferido.";

    cpfValidationStatus.classList.remove(
      "confirmed"
    );
  }
}


cpfInput?.addEventListener(
  "input",
  function () {
    let numbers = cpfInput.value
      .replace(/\D/g, "")
      .slice(0, 11);

    cpfInput.value = numbers
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

    resetCpfConfirmation();
  }
);


birthDateInput?.addEventListener(
  "change",
  resetCpfConfirmation
);


validateCpfButton?.addEventListener(
  "click",
  async function () {
    const cpf =
      cpfInput.value.replace(
        /\D/g,
        ""
      );

    const birthDate =
      birthDateInput.value;

    if (cpf.length !== 11) {
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

    if (!birthDate) {
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


cpfConfirmed?.addEventListener(
  "change",
  function () {
    if (!cpfValidationStatus) {
      return;
    }

    if (cpfConfirmed.checked) {
      cpfValidationStatus.textContent =
        "Consulta realizada e CPF conferido.";

      cpfValidationStatus.classList.add(
        "confirmed"
      );

      return;
    }

    resetCpfConfirmation();
  }
);


/* =========================
   TÍTULO ELEITORAL / TSE
========================= */

function setVoterTitleStatus(
  message,
  type = ""
) {
  if (!voterTitleStatus) {
    return;
  }

  voterTitleStatus.textContent =
    message;

  voterTitleStatus.classList.remove(
    "success",
    "error"
  );

  if (type) {
    voterTitleStatus.classList.add(
      type
    );
  }
}


function resetVoterTitleConfirmation() {
  if (voterTitleConfirmed) {
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
  if (electoralZoneInput) {
    electoralZoneInput.value =
      "";
  }

  if (electoralSectionInput) {
    electoralSectionInput.value =
      "";
  }

  if (electoralMunicipalityInput) {
    electoralMunicipalityInput.value =
      "";
  }

  resetVoterTitleConfirmation();
}


voterTitleInput?.addEventListener(
  "input",
  function () {
    const numbers =
      voterTitleInput.value
        .replace(/\D/g, "")
        .slice(0, 12);

    voterTitleInput.value =
      numbers;

    resetVoterTitleConfirmation();

    if (!numbers.length) {
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

        voterTitleInput?.focus();

        return;
      }

      sessionStorage.setItem(
        "tituloEmValidacao",
        titulo
      );

      setVoterTitleStatus(
        "Consulta aberta no site oficial do TSE.",
        "success"
      );

      window.open(
        "https://www.tse.jus.br/servicos-eleitorais/autoatendimento-eleitoral",
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


[
  electoralZoneInput,
  electoralSectionInput,
  electoralMunicipalityInput
]
  .filter(Boolean)
  .forEach(
    function (field) {
      field.addEventListener(
        "input",
        function () {
          resetVoterTitleConfirmation();
        }
      );
    }
  );


/* =========================
   OBSERVAÇÕES
========================= */

observationsInput?.addEventListener(
  "input",
  function () {
    if (characterTotal) {
      characterTotal.textContent =
        observationsInput.value.length;
    }
  }
);


/* =========================
   RESPOSTAS PAGINADAS
========================= */

function getList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    data &&
    Array.isArray(
      data.results
    )
  ) {
    return data.results;
  }

  return [];
}


function addSelectOption(
  select,
  value,
  text
) {
  const option =
    document.createElement(
      "option"
    );

  option.value =
    value;

  option.textContent =
    text;

  select.appendChild(
    option
  );
}


/* =========================
   REGIÕES
========================= */

async function loadRegions() {
  regionSelect.disabled =
    true;

  regionSelect.innerHTML = `
    <option value="">
      Carregando regiões...
    </option>
  `;

  const response =
    await apiFetch(
      "/regioes/"
    );

  if (!response.ok) {
    throw new Error(
      "Não foi possível carregar as regiões."
    );
  }

  const regions =
    getList(
      await response.json()
    );

  regionSelect.innerHTML = `
    <option value="">
      Selecione a região
    </option>
  `;

  regions.forEach(
    function (region) {
      addSelectOption(
        regionSelect,
        region.id,
        region.nome
      );
    }
  );

  regionSelect.disabled =
    false;
}


/* =========================
   LOCALIDADES
========================= */

async function loadNeighborhoods(
  regionId
) {
  neighborhoodSelect.disabled =
    true;

  streetSelect.disabled =
    true;

  neighborhoodSelect.innerHTML = `
    <option value="">
      Carregando localidades...
    </option>
  `;

  streetSelect.innerHTML = `
    <option value="">
      Selecione primeiro a localidade
    </option>
  `;

  if (!regionId) {
    neighborhoodSelect.innerHTML = `
      <option value="">
        Selecione primeiro a região
      </option>
    `;

    return;
  }

  const response =
    await apiFetch(
      `/localidades/?regiao=${encodeURIComponent(
        regionId
      )}`
    );

  if (!response.ok) {
    throw new Error(
      "Não foi possível carregar as localidades."
    );
  }

  const neighborhoods =
    getList(
      await response.json()
    );

  neighborhoodSelect.innerHTML = `
    <option value="">
      Selecione a localidade
    </option>
  `;

  neighborhoods.forEach(
    function (neighborhood) {
      addSelectOption(
        neighborhoodSelect,
        neighborhood.id,
        neighborhood.nome
      );
    }
  );

  neighborhoodSelect.disabled =
    false;
}


/* =========================
   RUAS
========================= */

async function loadStreets(
  neighborhoodId
) {
  streetSelect.disabled =
    true;

  streetSelect.innerHTML = `
    <option value="">
      Carregando ruas...
    </option>
  `;

  if (!neighborhoodId) {
    streetSelect.innerHTML = `
      <option value="">
        Selecione primeiro a localidade
      </option>
    `;

    return;
  }

  const response =
    await apiFetch(
      `/ruas/?localidade=${encodeURIComponent(
        neighborhoodId
      )}`
    );

  if (!response.ok) {
    throw new Error(
      "Não foi possível carregar as ruas."
    );
  }

  const streets =
    getList(
      await response.json()
    );

  streetSelect.innerHTML = `
    <option value="">
      Selecione a rua
    </option>
  `;

  streets.forEach(
    function (street) {
      addSelectOption(
        streetSelect,
        street.id,
        street.nome
      );
    }
  );

  streetSelect.disabled =
    false;
}


regionSelect?.addEventListener(
  "change",
  async function () {
    try {
      await loadNeighborhoods(
        regionSelect.value
      );
    } catch (error) {
      console.error(error);

      await showMessage({
        title:
          "Erro ao carregar",

        message:
          error.message,

        type:
          "warning"
      });
    }
  }
);


neighborhoodSelect
  ?.addEventListener(
    "change",
    async function () {
      try {
        await loadStreets(
          neighborhoodSelect.value
        );
      } catch (error) {
        console.error(error);

        await showMessage({
          title:
            "Erro ao carregar",

          message:
            error.message,

          type:
            "warning"
        });
      }
    }
  );


/* =========================
   ERROS DOS CAMPOS
========================= */

function clearFieldError(
  field
) {
  if (!field) {
    return;
  }

  field.classList.remove(
    "invalid"
  );

  const fieldContainer =
    field.closest(
      ".form-field"
    );

  const errorElement =
    fieldContainer
      ?.querySelector(
        ".field-error"
      );

  if (errorElement) {
    errorElement.textContent =
      "";

    errorElement.classList.remove(
      "visible"
    );
  }
}


function showFieldError(
  field,
  message
) {
  if (!field) {
    return;
  }

  field.classList.add(
    "invalid"
  );

  const fieldContainer =
    field.closest(
      ".form-field"
    );

  const errorElement =
    fieldContainer
      ?.querySelector(
        ".field-error"
      );

  if (errorElement) {
    errorElement.textContent =
      message;

    errorElement.classList.add(
      "visible"
    );
  }
}


function clearAllFieldErrors() {
  registrationForm
    ?.querySelectorAll(
      "input, select, textarea"
    )
    .forEach(
      clearFieldError
    );
}


registrationForm
  ?.querySelectorAll(
    "input, select, textarea"
  )
  .forEach(
    function (field) {
      field.addEventListener(
        "input",
        function () {
          clearFieldError(
            field
          );
        }
      );

      field.addEventListener(
        "change",
        function () {
          clearFieldError(
            field
          );
        }
      );
    }
  );


/* =========================
   VALIDAÇÃO
========================= */

function validateForm() {
  clearAllFieldErrors();

  let valid = true;
  let firstError = null;

  const fullName =
    fullNameInput.value.trim();

  const cpf =
    cpfInput.value
      .replace(/\D/g, "");

  const phone =
    phoneInput.value
      .replace(/\D/g, "");

  const voterTitle =
    voterTitleInput
      ?.value
      .replace(
        /\D/g,
        ""
      ) || "";


  if (
    fullName.length < 3
  ) {
    valid = false;

    showFieldError(
      fullNameInput,
      "Digite o nome completo."
    );

    firstError ||=
      fullNameInput;
  }


  if (
    cpf.length !== 11
  ) {
    valid = false;

    showFieldError(
      cpfInput,
      "Digite um CPF com 11 números."
    );

    firstError ||=
      cpfInput;
  }


  if (
    !birthDateInput.value
  ) {
    valid = false;

    showFieldError(
      birthDateInput,
      "Informe a data de nascimento."
    );

    firstError ||=
      birthDateInput;
  }


  if (
    voterTitle &&
    voterTitle.length !== 12
  ) {
    valid = false;

    showFieldError(
      voterTitleInput,
      "O título deve possuir 12 números."
    );

    firstError ||=
      voterTitleInput;
  }


  if (voterTitle) {

    if (
      !electoralZoneInput
        ?.value
        .trim()
    ) {
      valid = false;

      showFieldError(
        electoralZoneInput,
        "Informe a zona eleitoral consultada no TSE."
      );

      firstError ||=
        electoralZoneInput;
    }


    if (
      !electoralSectionInput
        ?.value
        .trim()
    ) {
      valid = false;

      showFieldError(
        electoralSectionInput,
        "Informe a seção eleitoral consultada no TSE."
      );

      firstError ||=
        electoralSectionInput;
    }


    if (
      !electoralMunicipalityInput
        ?.value
        .trim()
    ) {
      valid = false;

      showFieldError(
        electoralMunicipalityInput,
        "Informe o município eleitoral consultado no TSE."
      );

      firstError ||=
        electoralMunicipalityInput;
    }


    if (
      voterTitleConfirmed &&
      !voterTitleConfirmed.checked
    ) {
      valid = false;

      showMessage({
        title:
          "Conferência do título",

        message:
          "Consulte o título no site oficial do TSE, preencha zona, seção e município e confirme os dados antes de salvar.",

        type:
          "information"
      });
    }
  }


  if (
    phone.length < 10
  ) {
    valid = false;

    showFieldError(
      phoneInput,
      "Digite um telefone válido."
    );

    firstError ||=
      phoneInput;
  }


  if (
    !regionSelect.value
  ) {
    valid = false;

    showFieldError(
      regionSelect,
      "Selecione uma região."
    );

    firstError ||=
      regionSelect;
  }


  if (
    !neighborhoodSelect.value
  ) {
    valid = false;

    showFieldError(
      neighborhoodSelect,
      "Selecione uma localidade."
    );

    firstError ||=
      neighborhoodSelect;
  }


  if (
    !streetSelect.value
  ) {
    valid = false;

    showFieldError(
      streetSelect,
      "Selecione uma rua."
    );

    firstError ||=
      streetSelect;
  }


  if (
    cpfConfirmed &&
    !cpfConfirmed.checked
  ) {
    valid = false;

    showMessage({
      title:
        "Conferência do CPF",

      message:
        "Consulte o CPF na Receita Federal e confirme os dados antes de salvar o cadastro.",

      type:
        "information"
    });
  }


  firstError?.focus();

  return valid;
}


/* =========================
   DADOS DO CADASTRO
========================= */

function buildRegistrationData() {
  return {
    nome_completo:
      fullNameInput.value.trim(),

    cpf:
      cpfInput.value
        .replace(/\D/g, ""),

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
      phoneInput.value
        .replace(/\D/g, ""),

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
      numberInput.value.trim(),

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
      cpfConfirmed?.checked
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
        fields[fieldName];

      const message =
        Array.isArray(
          messages
        )
          ? messages.join(" ")
          : String(messages);

      if (field) {
        showFieldError(
          field,
          message
        );
      } else {
        console.error(
          fieldName,
          message
        );
      }
    }
  );
}


/* =========================
   SALVAR
========================= */

async function saveRegistration() {
  const data =
    buildRegistrationData();

  const response =
    await apiFetch(
      "/pessoas/",
      {
        method:
          "POST",

        body:
          JSON.stringify(
            data
          )
      }
    );

  if (
    response.status === 201
  ) {
    return response.json();
  }

  let errors = {};

  try {
    errors =
      await response.json();
  } catch (error) {
    console.error(
      "Resposta do cadastro sem JSON:",
      error
    );
  }

  if (
    errors &&
    typeof errors ===
      "object"
  ) {
    showBackendErrors(
      errors
    );
  }

  throw new Error(
    errors.detail ||
    errors.mensagem ||
    "Não foi possível salvar o cadastro."
  );
}


/* =========================
   ENVIO DO FORMULÁRIO
========================= */

registrationForm?.addEventListener(
  "submit",
  async function (event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    saveButton.disabled =
      true;

    const buttonText =
      saveButton.querySelector(
        "span"
      );

    if (buttonText) {
      buttonText.textContent =
        "Salvando...";
    }

    try {
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

      if (successModal) {
        successModal.classList.add(
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

    } catch (error) {
      console.error(
        "Erro ao cadastrar:",
        error
      );

      await showMessage({
        title:
          "Erro ao cadastrar",

        message:
          error.message ||
          "Não foi possível salvar o cadastro.",

        type:
          "warning"
      });

    } finally {
      saveButton.disabled =
        false;

      if (buttonText) {
        buttonText.textContent =
          "Salvar cadastro";
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
      registrationForm.reset();

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

      if (characterTotal) {
        characterTotal.textContent =
          "0";
      }

      resetCpfConfirmation();

      resetVoterTitleConfirmation();

      clearAllFieldErrors();

      sessionStorage.removeItem(
        "cpfEmValidacao"
      );

      sessionStorage.removeItem(
        "nascimentoEmValidacao"
      );

      sessionStorage.removeItem(
        "tituloEmValidacao"
      );

      successModal
        ?.classList
        .remove(
          "visible"
        );

      document.body.style.overflow =
        "";

      fullNameInput.focus();
    }
  );


/* =========================
   LOGOUT DE SEGURANÇA
========================= */

logoutButton?.addEventListener(
  "click",
  async function () {
    /*
      modal.js controla normalmente.
      Este trecho é fallback.
    */

    if (window.SystemModal) {
      return;
    }

    const confirmLogout =
      window.confirm(
        "Deseja realmente sair do sistema?"
      );

    if (confirmLogout) {
      fazerLogout();
    }
  }
);


/* =========================
   NOTIFICAÇÕES
========================= */

notificationButton
  ?.addEventListener(
    "click",
    function () {
      if (!window.SystemModal) {
        window.alert(
          "Você não possui novas notificações."
        );
      }
    }
  );


/* =========================
   TECLADO
========================= */

document.addEventListener(
  "keydown",
  function (event) {
    if (
      event.key === "Escape" &&
      successModal
        ?.classList
        .contains(
          "visible"
        )
    ) {
      successModal.classList.remove(
        "visible"
      );

      document.body.style.overflow =
        "";
    }

    if (
      event.key === "Escape"
    ) {
      closeMenu();
    }
  }
);


/* =========================
   INICIALIZAÇÃO
========================= */

async function initializePage() {
  try {
    currentUser =
      await buscarUsuarioLogado();

    if (!currentUser) {
      throw new Error(
        "Usuário não autenticado."
      );
    }

    if (
      currentUser.tipo !==
        "ADMINISTRADOR" &&
      currentUser.tipo !==
        "CADASTRADOR"
    ) {
      throw new Error(
        "Perfil sem permissão."
      );
    }

    fillCurrentUser(
      currentUser
    );

    configureMenuByProfile(
      currentUser
    );

    await loadRegions();

    if (window.lucide) {
      window.lucide.createIcons();
    }

  } catch (error) {
    console.error(
      "Erro ao iniciar página:",
      error
    );

    limparSessao();

    window.location.href =
      "index.html";
  }
}


document.addEventListener(
  "DOMContentLoaded",
  initializePage
);