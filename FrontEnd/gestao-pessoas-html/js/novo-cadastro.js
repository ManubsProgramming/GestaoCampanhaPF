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
const cepInput =
  document.querySelector(
    "#cep"
  );

const searchCepButton =
  document.querySelector(
    "#search-cep-button"
  );

const cepStatus =
  document.querySelector(
    "#cep-status"
  );
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


/* =========================
   MODO CADASTRO / EDIÇÃO
========================= */

const pageParams = new URLSearchParams(
  window.location.search
);

const editingPersonId = pageParams.get("id");

const isEditing = Boolean(editingPersonId);

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

  document.body.style.overflow =
    "hidden";
}


function closeMenu() {
  sidebar?.classList.remove("open");
  menuOverlay?.classList.remove("visible");

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
   FORMATAÇÃO
========================= */

function formatCpfValue(value) {
  const numbers = String(value || "")
    .replace(/\D/g, "")
    .slice(0, 11);

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


function formatPhoneValue(value) {
  const numbers = String(value || "")
    .replace(/\D/g, "")
    .slice(0, 11);

  if (numbers.length > 10) {
    return numbers.replace(
      /^(\d{2})(\d{5})(\d{0,4})/,
      "($1) $2-$3"
    );
  }

  if (numbers.length > 6) {
    return numbers.replace(
      /^(\d{2})(\d{4})(\d{0,4})/,
      "($1) $2-$3"
    );
  }

  if (numbers.length > 2) {
    return numbers.replace(
      /^(\d{2})(\d{0,5})/,
      "($1) $2"
    );
  }

  return numbers
    ? `(${numbers}`
    : "";
}


/* =========================
   MÁSCARA DO TELEFONE
========================= */

phoneInput?.addEventListener(
  "input",
  function () {
    phoneInput.value =
      formatPhoneValue(
        phoneInput.value
      );
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
    cpfInput.value =
      formatCpfValue(
        cpfInput.value
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
   CEP
========================= */

function onlyNumbers(
  value
) {
  return String(
    value || ""
  ).replace(
    /\D/g,
    ""
  );
}


function formatCepValue(
  value
) {
  const numbers =
    onlyNumbers(
      value
    ).slice(
      0,
      8
    );

  if (
    numbers.length <= 5
  ) {
    return numbers;
  }

  return (
    numbers.slice(
      0,
      5
    ) +
    "-" +
    numbers.slice(5)
  );
}


function setCepStatus(
  message,
  type = ""
) {
  if (!cepStatus) {
    return;
  }

  cepStatus.textContent =
    message;

  cepStatus.classList.remove(
    "success",
    "error"
  );

  if (type) {
    cepStatus.classList.add(
      type
    );
  }
}


cepInput?.addEventListener(
  "input",
  function () {
    cepInput.value =
      formatCepValue(
        cepInput.value
      );

    setCepStatus(
      "Informe o CEP para consultar o endereço."
    );
  }
);


async function searchCep() {
  console.log(
    "ENTROU EM searchCep"
  );

  const cep =
    onlyNumbers(
      cepInput?.value
    );

  console.log(
    "CEP LIDO:",
    cep
  );

  // continue com o código que já existe aqui


  if (
    cep.length !== 8
  ) {
    setCepStatus(
      "Informe um CEP válido com 8 números.",
      "error"
    );

    showFieldError(
      cepInput,
      "Informe um CEP válido."
    );

    cepInput?.focus();

    return;
  }

  clearFieldError(
    cepInput
  );

  searchCepButton.disabled =
    true;

  const buttonText =
    searchCepButton
      ?.querySelector(
        "span"
      );

  if (buttonText) {
    buttonText.textContent =
      "Buscando...";
  }

  setCepStatus(
    "Consultando CEP..."
  );

  try {
    const response =
      await fetch(
        `https://viacep.com.br/ws/${cep}/json/`
      );

    if (!response.ok) {
      throw new Error(
        "Não foi possível consultar o CEP."
      );
    }

    const address =
      await response.json();

    if (
      address.erro
    ) {
      throw new Error(
        "CEP não encontrado."
      );
    }

    const parts = [
      address.logradouro,
      address.bairro,
      address.localidade,
      address.uf
    ].filter(Boolean);

    setCepStatus(
      parts.join(" - ") ||
      "CEP localizado.",
      "success"
    );

    /*
     * Município eleitoral:
     * não alteramos automaticamente,
     * pois ele pertence aos dados
     * eleitorais, não necessariamente
     * ao endereço residencial.
     */

    /*
     * Tenta encontrar automaticamente
     * localidade e rua entre as opções
     * já cadastradas no sistema.
     */

    await trySelectAddressFromCep(
      address
    );

  } catch (error) {
    console.error(
      "Erro ao consultar CEP:",
      error
    );

    setCepStatus(
      error.message ||
      "Não foi possível consultar o CEP.",
      "error"
    );

  } finally {
    searchCepButton.disabled =
      false;

    if (buttonText) {
      buttonText.textContent =
        "Buscar CEP";
    }
  }
}





cepInput?.addEventListener(
  "blur",
  function () {
    const cep =
      onlyNumbers(
        cepInput.value
      );

    if (
      cep.length === 8
    ) {
      searchCep();
    }
  }
  
);


function normalizeAddressText(
  value
) {
  return String(
    value || ""
  )
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .replace(
      /^(rua|avenida|av\.?|travessa|estrada|rodovia)\s+/,
      ""
    )
    .trim();
}


function findSelectOption(
  select,
  text
) {
  if (
    !select ||
    !text
  ) {
    return null;
  }

  const target =
    normalizeAddressText(
      text
    );

  return Array.from(
    select.options
  ).find(
    function (
      option
    ) {
      const optionText =
        normalizeAddressText(
          option.textContent
        );

      return (
        optionText ===
          target ||
        optionText.includes(
          target
        ) ||
        target.includes(
          optionText
        )
      );
    }
  );
}


async function trySelectAddressFromCep(address) {
  console.log(
    "ENDEREÇO RECEBIDO:",
    address
  );

  const bairroCep =
    normalizeAddressText(
      address.bairro
    );

  const ruaCep =
    normalizeAddressText(
      address.logradouro
    );

  console.log(
    "BAIRRO NORMALIZADO:",
    bairroCep
  );

  console.log(
    "RUA NORMALIZADA:",
    ruaCep
  );

  /*
   * =========================
   * 1. REGIÃO
   * =========================
   */

  const regionOptions =
    Array.from(
      regionSelect.options
    ).filter(
      option => option.value
    );

  console.log(
    "REGIÕES DISPONÍVEIS:",
    regionOptions.map(
      option => ({
        id: option.value,
        nome: option.textContent.trim()
      })
    )
  );

  let selectedRegion = null;

  /*
   * Primeiro tenta encontrar
   * uma região urbana pelo nome.
   */
  selectedRegion =
    regionOptions.find(
      option => {
        const nome =
          normalizeAddressText(
            option.textContent
          );

        return (
          nome.includes("urbana") ||
          nome.includes("urbano")
        );
      }
    );

  /*
   * Se só existir uma região
   * cadastrada, usa essa região.
   */
  if (
    !selectedRegion &&
    regionOptions.length === 1
  ) {
    selectedRegion =
      regionOptions[0];
  }

  if (!selectedRegion) {
    console.warn(
      "Não foi possível determinar a região."
    );

    setCepStatus(
      "CEP encontrado. Selecione a região para continuar.",
      "success"
    );

    return;
  }

  regionSelect.value =
    selectedRegion.value;

  console.log(
    "REGIÃO SELECIONADA:",
    selectedRegion.value,
    selectedRegion.textContent.trim()
  );


  /*
   * =========================
   * 2. LOCALIDADES
   * =========================
   */

  await loadNeighborhoods(
    selectedRegion.value
  );

  const neighborhoodOptions =
    Array.from(
      neighborhoodSelect.options
    ).filter(
      option => option.value
    );

  console.log(
    "LOCALIDADES DISPONÍVEIS:",
    neighborhoodOptions.map(
      option => ({
        id: option.value,
        nome: option.textContent.trim()
      })
    )
  );

  /*
   * Se o CEP não trouxe bairro,
   * não temos informação suficiente
   * para escolher uma localidade.
   */
  if (!bairroCep) {
    setCepStatus(
      "CEP encontrado. Região preenchida. Selecione a localidade.",
      "success"
    );

    return;
  }

  const selectedNeighborhood =
    neighborhoodOptions.find(
      option => {
        const nome =
          normalizeAddressText(
            option.textContent
          );

        return (
          nome === bairroCep ||
          nome.includes(bairroCep) ||
          bairroCep.includes(nome)
        );
      }
    );

  if (!selectedNeighborhood) {
    console.warn(
      "Localidade não encontrada para:",
      address.bairro
    );

    setCepStatus(
      `CEP encontrado. Região preenchida, mas a localidade "${address.bairro}" não existe no sistema.`,
      "success"
    );

    return;
  }

  neighborhoodSelect.value =
    selectedNeighborhood.value;

  console.log(
    "LOCALIDADE SELECIONADA:",
    selectedNeighborhood.value,
    selectedNeighborhood.textContent.trim()
  );


  /*
   * =========================
   * 3. RUAS
   * =========================
   */

  await loadStreets(
    selectedNeighborhood.value
  );

  const streetOptions =
    Array.from(
      streetSelect.options
    ).filter(
      option => option.value
    );

  console.log(
    "RUAS DISPONÍVEIS:",
    streetOptions.map(
      option => ({
        id: option.value,
        nome: option.textContent.trim()
      })
    )
  );

  if (!ruaCep) {
    setCepStatus(
      "CEP encontrado. Região e localidade preenchidas. Selecione a rua.",
      "success"
    );

    return;
  }

  const selectedStreet =
    streetOptions.find(
      option => {
        const nome =
          normalizeAddressText(
            option.textContent
          );

        return (
          nome === ruaCep ||
          nome.includes(ruaCep) ||
          ruaCep.includes(nome)
        );
      }
    );

  if (!selectedStreet) {
    console.warn(
      "Rua não encontrada para:",
      address.logradouro
    );

    setCepStatus(
      `CEP encontrado. Região e localidade preenchidas, mas a rua "${address.logradouro}" não existe no sistema.`,
      "success"
    );

    return;
  }

  streetSelect.value =
    selectedStreet.value;

  console.log(
    "RUA SELECIONADA:",
    selectedStreet.value,
    selectedStreet.textContent.trim()
  );

  setCepStatus(
    "CEP encontrado e endereço preenchido automaticamente.",
    "success"
  );

  numberInput?.focus();
}
  /*
   * 2. Carrega as localidades
   * da região selecionada.
   */
  await loadNeighborhoods(
    regionSelect.value
  );

  /*
   * 3. Procura a localidade
   * pelo bairro retornado pelo CEP.
   */
  let neighborhoodOption =
    Array.from(
      neighborhoodSelect.options
    ).find(
      function (option) {
        const optionText =
          normalizeAddressText(
            option.textContent
          );

        return (
          optionText === bairroCep ||
          optionText.includes(
            bairroCep
          ) ||
          bairroCep.includes(
            optionText
          )
        );
      }
    );

  /*
   * Se o ViaCEP não retornar bairro,
   * não temos como descobrir a localidade.
   */
  if (!bairroCep) {
    setCepStatus(
      "CEP encontrado. Região selecionada. Escolha a localidade.",
      "success"
    );

    return;
  }

  if (!neighborhoodOption) {
    setCepStatus(
      `CEP encontrado. Região selecionada, mas a localidade "${address.bairro}" não foi encontrada no sistema.`,
      "success"
    );

    return;
  }

  neighborhoodSelect.value =
    neighborhoodOption.value;

  /*
   * 4. Carrega as ruas da localidade.
   */
  await loadStreets(
    neighborhoodOption.value
  );

  /*
   * 5. Procura a rua.
   */
  const streetOption =
    Array.from(
      streetSelect.options
    ).find(
      function (option) {
        const optionText =
          normalizeAddressText(
            option.textContent
          );

        return (
          optionText === ruaCep ||
          optionText.includes(
            ruaCep
          ) ||
          ruaCep.includes(
            optionText
          )
        );
      }
    );

  if (streetOption) {
    streetSelect.value =
      streetOption.value;

    setCepStatus(
      "CEP encontrado e endereço preenchido automaticamente.",
      "success"
    );

    numberInput?.focus();

    return;
  }

  setCepStatus(
    `CEP encontrado. Região e localidade preenchidas, mas a rua "${address.logradouro}" não foi encontrada no sistema.`,
    "success"
  );

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
    cep:
      cepInput
        ?.value
       .trim() || "",
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
    
    cep:
      cepInput,

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
   CARREGAR PESSOA PARA EDIÇÃO
========================= */

async function loadPersonForEditing() {
  if (!isEditing) {
    return;
  }

  const response = await apiFetch(
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

    throw new Error(message);
  }

  const pessoa =
    await response.json();


  /* =========================
     DADOS PESSOAIS
  ========================= */

  fullNameInput.value =
    pessoa.nome_completo || "";

  cpfInput.value =
    formatCpfValue(
      pessoa.cpf
    );

  birthDateInput.value =
    pessoa.data_nascimento || "";

  phoneInput.value =
    formatPhoneValue(
      pessoa.telefone
    );
    
    if (cepInput) {
  cepInput.value =
    formatCepValue(
      pessoa.cep || ""
    );
}

  /* =========================
     DADOS ELEITORAIS
  ========================= */

  if (voterTitleInput) {
    voterTitleInput.value =
      String(
        pessoa.titulo_eleitor || ""
      ).replace(/\D/g, "");
  }

  if (electoralZoneInput) {
    electoralZoneInput.value =
      pessoa.zona_eleitoral || "";
  }

  if (electoralSectionInput) {
    electoralSectionInput.value =
      pessoa.secao_eleitoral || "";
  }

  if (electoralMunicipalityInput) {
    electoralMunicipalityInput.value =
      pessoa.municipio_eleitoral || "";
  }


  /* =========================
     ENDEREÇO
  ========================= */

  if (pessoa.regiao) {
    regionSelect.value =
      String(
        pessoa.regiao
      );

    await loadNeighborhoods(
      pessoa.regiao
    );
  }

  if (pessoa.localidade) {
    neighborhoodSelect.value =
      String(
        pessoa.localidade
      );

    await loadStreets(
      pessoa.localidade
    );
  }

  if (pessoa.rua) {
    streetSelect.value =
      String(
        pessoa.rua
      );
  }

  numberInput.value =
    pessoa.numero || "";

  if (complementInput) {
    complementInput.value =
      pessoa.complemento || "";
  }


  /* =========================
     OBSERVAÇÕES
  ========================= */

  if (observationsInput) {
    observationsInput.value =
      pessoa.observacoes || "";
  }

  if (characterTotal) {
    characterTotal.textContent =
      String(
        observationsInput
          ?.value
          .length || 0
      );
  }


  /* =========================
     RESPONSÁVEL
  ========================= */

  if (registeredBy) {
    registeredBy.textContent =
      pessoa.cadastrada_por_nome ||
      getUserName(currentUser);
  }


  /* =========================
     CONFERÊNCIA CPF
  ========================= */

  if (cpfConfirmed) {
    cpfConfirmed.checked =
      pessoa.status_verificacao_cpf ===
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
    } else if (
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


  /* =========================
     CONFERÊNCIA TÍTULO
  ========================= */

  if (voterTitleConfirmed) {
    voterTitleConfirmed.checked =
      pessoa.status_verificacao_titulo ===
      "CONSULTADO";

    if (
      voterTitleConfirmed.checked &&
      voterTitleValidationStatus
    ) {
      voterTitleValidationStatus.textContent =
        "Consulta realizada e título conferido.";

      voterTitleValidationStatus
        .classList
        .add(
          "confirmed"
        );
    } else if (
      voterTitleValidationStatus
    ) {
      voterTitleValidationStatus.textContent =
        "Título ainda não conferido.";

      voterTitleValidationStatus
        .classList
        .remove(
          "confirmed"
        );
    }
  }


  if (
    pessoa.titulo_eleitor &&
    pessoa.zona_eleitoral &&
    pessoa.secao_eleitoral &&
    pessoa.municipio_eleitoral
  ) {
    setVoterTitleStatus(
      "Dados eleitorais carregados do cadastro.",
      "success"
    );
  } else if (
    pessoa.titulo_eleitor
  ) {
    setVoterTitleStatus(
      "Título carregado. Confira os dados eleitorais.",
      ""
    );
  }


  /* =========================
     ALTERA TÍTULOS DA PÁGINA
  ========================= */

  document.title =
    "Editar cadastro | Gestão de Cadastros";

  const topbarTitle =
    document.querySelector(
      ".topbar h1"
    );

  if (topbarTitle) {
    topbarTitle.textContent =
      "Editar cadastro";
  }

  const topbarDescription =
    document.querySelector(
      ".topbar-left p"
    );

  if (topbarDescription) {
    topbarDescription.textContent =
      "Atualize os dados da pessoa cadastrada";
  }

  const introductionTitle =
    document.querySelector(
      ".page-introduction h2"
    );

  if (introductionTitle) {
    introductionTitle.textContent =
      "Editar pessoa";
  }

  const introductionDescription =
    document.querySelector(
      ".page-introduction p"
    );

  if (introductionDescription) {
    introductionDescription.textContent =
      "Altere os dados necessários e salve as alterações.";
  }

  const buttonText =
    saveButton?.querySelector(
      "span"
    );

  if (buttonText) {
    buttonText.textContent =
      "Salvar alterações";
  }
}


/* =========================
   SALVAR
========================= */

async function saveRegistration() {
  const data =
    buildRegistrationData();

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

        body:
          JSON.stringify(
            data
          )
      }
    );

  if (response.ok) {
    return response.json();
  }

  let errors = {};

  try {
    errors =
      await response.json();
  } catch (error) {
    console.error(
      "Resposta do servidor sem JSON:",
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
    (
      isEditing
        ? "Não foi possível atualizar o cadastro."
        : "Não foi possível salvar o cadastro."
    )
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
        isEditing
          ? "Salvando alterações..."
          : "Salvando...";
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


      /* =========================
         EDIÇÃO
      ========================= */

      if (isEditing) {
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


      /* =========================
         NOVO CADASTRO
      ========================= */

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
        isEditing
          ? "Erro ao atualizar cadastro:"
          : "Erro ao cadastrar:",
        error
      );

      await showMessage({
        title:
          isEditing
            ? "Erro ao atualizar"
            : "Erro ao cadastrar",

        message:
          error.message ||
          (
            isEditing
              ? "Não foi possível atualizar o cadastro."
              : "Não foi possível salvar o cadastro."
          ),

        type:
          "warning"
      });

    } finally {
      saveButton.disabled =
        false;

      if (buttonText) {
        buttonText.textContent =
          isEditing
            ? "Salvar alterações"
            : "Salvar cadastro";
      }
    }
  }
);


/* =========================
   NOVO CADASTRO APÓS SALVAR
========================= */

newRegistrationButton
  ?.addEventListener(
    "click",
    function () {
      /*
       * Se por algum motivo o modal aparecer
       * enquanto estiver no modo de edição,
       * volta para a página limpa de cadastro.
       */

      if (isEditing) {
        window.location.href =
          "novo-cadastro.html";

        return;
      }

      registrationForm.reset();
      if (cepInput) {
       cepInput.value = "";
      }

setCepStatus(
  "Informe o CEP para consultar o endereço."
);
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

    /*
     * Primeiro carrega as regiões.
     * Isso precisa acontecer antes de carregar
     * uma pessoa no modo de edição.
     */

    await loadRegions();


    /*
     * Se a URL for:
     *
     * novo-cadastro.html?id=12
     *
     * busca a pessoa 12 no banco
     * e preenche o formulário.
     */

    if (isEditing) {
      await loadPersonForEditing();
    }


    if (window.lucide) {
      window.lucide.createIcons();
    }

  } catch (error) {
    console.error(
      "Erro ao iniciar página:",
      error
    );


    /*
     * Se estamos editando e a pessoa
     * não pôde ser carregada, não queremos
     * necessariamente apagar uma sessão válida.
     */

    if (isEditing) {
      await showMessage({
        title:
          "Não foi possível editar",

        message:
          error.message ||
          "Não foi possível carregar o cadastro.",

        type:
          "warning"
      });

      window.location.href =
        "pessoas.html";

      return;
    }


    limparSessao();

    window.location.href =
      "index.html";
  }
}


document.addEventListener(
  "DOMContentLoaded",
  initializePage
);