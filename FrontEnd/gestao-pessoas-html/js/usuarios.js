const userSearchInput = document.querySelector(
  "#user-search-input"
)

const userStatusFilter = document.querySelector(
  "#user-status-filter"
)

const usersListContainer = document.querySelector(
  "#users-list"
)

const visibleUsersTotal = document.querySelector(
  "#visible-users"
)

const usersEmptyState = document.querySelector(
  "#users-empty-state"
)

const openUserModalButton = document.querySelector(
  "#open-user-modal"
)

const closeUserModalButton = document.querySelector(
  "#close-user-modal"
)

const cancelUserModalButton = document.querySelector(
  "#cancel-user-modal"
)

const userModal = document.querySelector("#user-modal")
const newUserForm = document.querySelector("#new-user-form")

const newUserNameInput = document.querySelector(
  "#new-user-name"
)

const newUserEmailInput = document.querySelector(
  "#new-user-email"
)

const newUserTypeSelect = document.querySelector(
  "#new-user-type"
)

function normalizeUserText(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function getRegisteredUsers() {
  return Array.from(
    usersListContainer.querySelectorAll(
      ".registered-user"
    )
  )
}

function filterUsers() {
  const searchedText = normalizeUserText(
    userSearchInput.value
  )

  const selectedStatus = userStatusFilter.value

  let visibleUsers = 0

  getRegisteredUsers().forEach(function (userCard) {
    const userName = normalizeUserText(
      userCard.dataset.name || ""
    )

    const userStatus = userCard.dataset.status || ""

    const nameMatches =
      !searchedText || userName.includes(searchedText)

    const statusMatches =
      !selectedStatus || userStatus === selectedStatus

    const shouldShow = nameMatches && statusMatches

    userCard.hidden = !shouldShow

    if (shouldShow) {
      visibleUsers += 1
    }
  })

  visibleUsersTotal.textContent = visibleUsers

  usersEmptyState.classList.toggle(
    "visible",
    visibleUsers === 0
  )
}

function openUserModal() {
  userModal.classList.add("visible")
  document.body.style.overflow = "hidden"

  setTimeout(function () {
    newUserNameInput.focus()
  }, 100)
}

function closeUserModal() {
  userModal.classList.remove("visible")
  document.body.style.overflow = ""
  newUserForm.reset()
}

function createInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(function (part) {
      return part.charAt(0).toUpperCase()
    })
    .join("")
}

function createUserCard(name, email, type) {
  const userCard = document.createElement("article")

  userCard.className = "registered-user"
  userCard.dataset.name = name
  userCard.dataset.status = "Ativo"

  const initials = createInitials(name)

  userCard.innerHTML = `
    <span class="user-list-avatar">
      ${initials}
    </span>

    <div class="registered-user-data">
      <strong>${name}</strong>
      <span>${email}</span>
    </div>

    <div class="user-registration-data">
      <span>Pessoas cadastradas</span>
      <strong>0</strong>
    </div>

    <span class="user-status active">
      Ativo
    </span>

    <a
      href="usuario-detalhes.html?usuario=novo"
      class="user-details-button"
    >
      Ver detalhes
      <i data-lucide="arrow-right"></i>
    </a>
  `

  userCard.dataset.type = type

  usersListContainer.appendChild(userCard)

  if (window.lucide) {
    window.lucide.createIcons()
  }
}

function saveUserLocally(name, email, type) {
  const savedUsers = JSON.parse(
    localStorage.getItem("usuariosCadastradores") ||
      "[]"
  )

  savedUsers.push({
    id: Date.now(),
    nome: name,
    email: email,
    tipo: type,
    status: "Ativo",
    pessoasCadastradas: 0,
  })

  localStorage.setItem(
    "usuariosCadastradores",
    JSON.stringify(savedUsers)
  )
}

userSearchInput.addEventListener("input", filterUsers)

userStatusFilter.addEventListener(
  "change",
  filterUsers
)

openUserModalButton.addEventListener(
  "click",
  openUserModal
)

closeUserModalButton.addEventListener(
  "click",
  closeUserModal
)

cancelUserModalButton.addEventListener(
  "click",
  closeUserModal
)

userModal.addEventListener("click", function (event) {
  if (event.target === userModal) {
    closeUserModal()
  }
})

document.addEventListener("keydown", function (event) {
  if (
    event.key === "Escape" &&
    userModal.classList.contains("visible")
  ) {
    closeUserModal()
  }
})

newUserForm.addEventListener(
  "submit",
  function (event) {
    event.preventDefault()

    const name = newUserNameInput.value.trim()
    const email = newUserEmailInput.value.trim()
    const type = newUserTypeSelect.value

    if (!name || !email || !type) {
      window.alert(
        "Preencha todos os campos do usuário."
      )

      return
    }

    createUserCard(name, email, type)
    saveUserLocally(name, email, type)

    closeUserModal()
    filterUsers()

    window.alert(
      "Usuário cadastrado com sucesso nesta demonstração."
    )
  }
)

filterUsers()

if (window.lucide) {
  window.lucide.createIcons()
}