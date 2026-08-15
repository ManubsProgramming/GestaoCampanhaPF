const userDetailsData = {
  joao: {
    nome: "João Silva",
    iniciais: "JS",
    email: "joao.silva@sistema.com",
    status: "Ativo",
    total: 185,
    hoje: 12,
    semana: 48,
    mes: 185,

    bairros: [
      { nome: "Centro", quantidade: 68 },
      { nome: "Alvorada", quantidade: 52 },
      { nome: "Flores", quantidade: 39 },
      { nome: "Compensa", quantidade: 26 },
    ],

    ruas: [
      {
        nome: "Rua das Flores",
        bairro: "Centro",
        quantidade: 32,
      },
      {
        nome: "Avenida Brasil",
        bairro: "Alvorada",
        quantidade: 27,
      },
      {
        nome: "Rua Amazonas",
        bairro: "Flores",
        quantidade: 21,
      },
      {
        nome: "Avenida Central",
        bairro: "Compensa",
        quantidade: 18,
      },
    ],
  },

  maria: {
    nome: "Maria Santos",
    iniciais: "MS",
    email: "maria.santos@sistema.com",
    status: "Ativo",
    total: 142,
    hoje: 9,
    semana: 39,
    mes: 142,

    bairros: [
      { nome: "Alvorada", quantidade: 54 },
      { nome: "Centro", quantidade: 41 },
      { nome: "Flores", quantidade: 29 },
      { nome: "Compensa", quantidade: 18 },
    ],

    ruas: [
      {
        nome: "Avenida Brasil",
        bairro: "Alvorada",
        quantidade: 29,
      },
      {
        nome: "Rua das Flores",
        bairro: "Centro",
        quantidade: 24,
      },
      {
        nome: "Rua Amazonas",
        bairro: "Flores",
        quantidade: 17,
      },
      {
        nome: "Avenida Central",
        bairro: "Compensa",
        quantidade: 13,
      },
    ],
  },

  pedro: {
    nome: "Pedro Oliveira",
    iniciais: "PO",
    email: "pedro.oliveira@sistema.com",
    status: "Ativo",
    total: 97,
    hoje: 7,
    semana: 31,
    mes: 97,

    bairros: [
      { nome: "Flores", quantidade: 38 },
      { nome: "Centro", quantidade: 27 },
      { nome: "Alvorada", quantidade: 19 },
      { nome: "Compensa", quantidade: 13 },
    ],

    ruas: [
      {
        nome: "Rua Amazonas",
        bairro: "Flores",
        quantidade: 23,
      },
      {
        nome: "Rua das Flores",
        bairro: "Centro",
        quantidade: 18,
      },
      {
        nome: "Avenida Brasil",
        bairro: "Alvorada",
        quantidade: 14,
      },
      {
        nome: "Avenida Central",
        bairro: "Compensa",
        quantidade: 10,
      },
    ],
  },

  ana: {
    nome: "Ana Costa",
    iniciais: "AC",
    email: "ana.costa@sistema.com",
    status: "Inativo",
    total: 76,
    hoje: 0,
    semana: 8,
    mes: 76,

    bairros: [
      { nome: "Compensa", quantidade: 28 },
      { nome: "Centro", quantidade: 21 },
      { nome: "Alvorada", quantidade: 16 },
      { nome: "Flores", quantidade: 11 },
    ],

    ruas: [
      {
        nome: "Avenida Central",
        bairro: "Compensa",
        quantidade: 19,
      },
      {
        nome: "Rua das Flores",
        bairro: "Centro",
        quantidade: 15,
      },
      {
        nome: "Avenida Brasil",
        bairro: "Alvorada",
        quantidade: 11,
      },
      {
        nome: "Rua Amazonas",
        bairro: "Flores",
        quantidade: 8,
      },
    ],
  },
}

const detailsPageParameters = new URLSearchParams(
  window.location.search
)

const selectedUserKey =
  detailsPageParameters.get("usuario") || "joao"

const selectedUserDetails =
  userDetailsData[selectedUserKey] ||
  userDetailsData.joao

const detailsAvatar = document.querySelector(
  "#details-avatar"
)

const detailsName = document.querySelector("#details-name")

const detailsEmail = document.querySelector(
  "#details-email"
)

const detailsStatus = document.querySelector(
  "#details-status"
)

const totalRegistrations = document.querySelector(
  "#total-registrations"
)

const todayRegistrations = document.querySelector(
  "#today-registrations"
)

const weekRegistrations = document.querySelector(
  "#week-registrations"
)

const monthRegistrations = document.querySelector(
  "#month-registrations"
)

const neighborhoodChart = document.querySelector(
  "#user-neighborhood-chart"
)

const userStreetList = document.querySelector(
  "#user-street-list"
)

const detailsSearchInput = document.querySelector(
  "#details-search-input"
)

const detailsTableBody = document.querySelector(
  "#details-table-body"
)

const visibleRegisteredPeople = document.querySelector(
  "#visible-registered-people"
)

const detailsEmptyState = document.querySelector(
  "#details-empty-state"
)

const editUserButton = document.querySelector(
  "#edit-user-button"
)

function loadUserProfile() {
  document.title =
    `${selectedUserDetails.nome} | Gestão de Cadastros`

  detailsAvatar.textContent =
    selectedUserDetails.iniciais

  detailsName.textContent = selectedUserDetails.nome
  detailsEmail.textContent = selectedUserDetails.email

  detailsStatus.textContent =
    selectedUserDetails.status

  detailsStatus.className =
    selectedUserDetails.status === "Ativo"
      ? "details-status active"
      : "details-status inactive"

  totalRegistrations.textContent =
    selectedUserDetails.total

  todayRegistrations.textContent =
    selectedUserDetails.hoje

  weekRegistrations.textContent =
    selectedUserDetails.semana

  monthRegistrations.textContent =
    selectedUserDetails.mes
}

function loadNeighborhoodChart() {
  const largestQuantity = Math.max(
    ...selectedUserDetails.bairros.map(
      function (neighborhood) {
        return neighborhood.quantidade
      }
    )
  )

  neighborhoodChart.innerHTML =
    selectedUserDetails.bairros
      .map(function (neighborhood) {
        const percentage = Math.round(
          (neighborhood.quantidade /
            largestQuantity) *
            100
        )

        return `
          <div class="details-bar-item">
            <div>
              <span>${neighborhood.nome}</span>
              <strong>
                ${neighborhood.quantidade}
              </strong>
            </div>

            <div class="details-bar-track">
              <div
                class="details-bar-fill"
                style="width: ${percentage}%"
              ></div>
            </div>
          </div>
        `
      })
      .join("")
}

function loadStreetList() {
  userStreetList.innerHTML =
    selectedUserDetails.ruas
      .map(function (street) {
        return `
          <div>
            <span>
              <strong>${street.nome}</strong>
              <small>${street.bairro}</small>
            </span>

            <b>${street.quantidade}</b>
          </div>
        `
      })
      .join("")
}

function normalizeDetailsText(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function filterRegisteredPeople() {
  const searchedName = normalizeDetailsText(
    detailsSearchInput.value
  )

  const rows = Array.from(
    detailsTableBody.querySelectorAll("tr")
  )

  let visiblePeople = 0

  rows.forEach(function (row) {
    const personName = normalizeDetailsText(
      row.dataset.person || ""
    )

    const shouldShow =
      !searchedName ||
      personName.includes(searchedName)

    row.hidden = !shouldShow

    if (shouldShow) {
      visiblePeople += 1
    }
  })

  visibleRegisteredPeople.textContent = visiblePeople

  detailsEmptyState.classList.toggle(
    "visible",
    visiblePeople === 0
  )
}

detailsSearchInput.addEventListener(
  "input",
  filterRegisteredPeople
)

editUserButton.addEventListener("click", function () {
  window.alert(
    `Edição de ${selectedUserDetails.nome} será conectada ao banco de dados posteriormente.`
  )
})

loadUserProfile()
loadNeighborhoodChart()
loadStreetList()
filterRegisteredPeople()

if (window.lucide) {
  window.lucide.createIcons()
}