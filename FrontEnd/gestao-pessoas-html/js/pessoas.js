const sidebar = document.querySelector("#sidebar");
const menuOverlay = document.querySelector("#menu-overlay");
const openMenuButton = document.querySelector("#open-menu");
const closeMenuButton = document.querySelector("#close-menu");
const logoutButton = document.querySelector("#logout-button");
const loggedUser = document.querySelector("#logged-user");
const notificationButton = document.querySelector(
  ".notification-button"
);

const searchInput = document.querySelector("#people-search");
const neighborhoodFilter = document.querySelector(
  "#neighborhood-filter"
);
const streetFilter = document.querySelector("#street-filter");
const userFilter = document.querySelector("#user-filter");
const periodFilter = document.querySelector("#period-filter");
const clearFiltersButton = document.querySelector(
  "#clear-filters"
);

const tableBody = document.querySelector("#people-table-body");
const emptyState = document.querySelector("#empty-state");
const visibleTotal = document.querySelector("#visible-total");
const peopleTotal = document.querySelector("#people-total");
const activePeopleTotal = document.querySelector(
  "#active-people-total"
);
const todayPeopleTotal = document.querySelector(
  "#today-people-total"
);

let pessoas = [];
let usuarioAtual = null;

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

openMenuButton?.addEventListener("click", openMenu);
closeMenuButton?.addEventListener("click", closeMenu);
menuOverlay?.addEventListener("click", closeMenu);

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeMenu();
  }
});

window.addEventListener("resize", function () {
  if (window.innerWidth >= 1024) {
    closeMenu();
  }
});

/* =========================
   FUNÇÕES AUXILIARES
========================= */

function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function protegerHTML(valor) {
  return String(valor || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatarData(data) {
  if (!data) {
    return "-";
  }

  const objetoData = new Date(data);

  if (Number.isNaN(objetoData.getTime())) {
    return "-";
  }

  return objetoData.toLocaleDateString("pt-BR");
}

function formatarTelefone(telefone) {
  if (!telefone) {
    return "-";
  }

  const numeros = String(telefone).replace(/\D/g, "");

  if (numeros.length === 11) {
    return numeros.replace(
      /^(\d{2})(\d{5})(\d{4})$/,
      "($1) $2-$3"
    );
  }

  if (numeros.length === 10) {
    return numeros.replace(
      /^(\d{2})(\d{4})(\d{4})$/,
      "($1) $2-$3"
    );
  }

  return telefone;
}

function obterNomeUsuario(usuario) {
  if (!usuario) {
    return "";
  }

  const nomeCompleto = [
    usuario.first_name,
    usuario.last_name
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return nomeCompleto || usuario.username || "";
}

function obterIniciais(nome) {
  const palavras = String(nome || "")
    .trim()
    .split(" ")
    .filter(Boolean);

  if (!palavras.length) {
    return "PS";
  }

  if (palavras.length === 1) {
    return palavras[0].slice(0, 2).toUpperCase();
  }

  return (
    palavras[0][0] +
    palavras[palavras.length - 1][0]
  ).toUpperCase();
}

function nomeLocalidade(pessoa) {
  return (
    pessoa.localidade_nome ||
    pessoa.localidade?.nome ||
    ""
  );
}

function nomeRua(pessoa) {
  return pessoa.rua_nome || pessoa.rua?.nome || "";
}

function nomeCadastrador(pessoa) {
  return (
    pessoa.cadastrada_por_nome ||
    pessoa.cadastrada_por_username ||
    pessoa.cadastrada_por?.username ||
    pessoa.cadastrada_por_nome_completo ||
    ""
  );
}

function usuarioEhAdministrador() {
  return usuarioAtual?.tipo === "ADMINISTRADOR";
}

/* =========================
   USUÁRIO LOGADO
========================= */

function preencherUsuario(usuario) {
  const nome = obterNomeUsuario(usuario) || "Usuário";
  const tipoTexto =
    usuario.tipo === "ADMINISTRADOR"
      ? "Administrador geral"
      : "Cadastrador";

  if (loggedUser) {
    loggedUser.textContent = nome;
  }

  const sidebarName = document.querySelector(
    ".sidebar-user-info strong"
  );

  if (sidebarName) {
    sidebarName.textContent = nome;
  }

  document
    .querySelectorAll(
      ".sidebar-user-info span, .profile-info small"
    )
    .forEach(function (elemento) {
      elemento.textContent = tipoTexto;
    });

  const iniciais = obterIniciais(nome);

  document
    .querySelectorAll(".user-avatar, .profile-avatar")
    .forEach(function (elemento) {
      elemento.textContent = iniciais;
    });

  if (usuario.tipo === "CADASTRADOR") {
    document
      .querySelectorAll(
        'a[href="painel.html"], ' +
        'a[href="usuarios.html"], ' +
        'a[href="regioes.html"], ' +
        'a[href="relatorios.html"], ' +
        'a[href="configuracoes.html"], ' +
        'a[href="auditoria.html"]'
      )
      .forEach(function (link) {
        link.style.display = "none";
      });

    const campoUsuario = userFilter?.closest(".filter-field");

    if (campoUsuario) {
      campoUsuario.style.display = "none";
    }
  }
}

/* =========================
   CARREGAR PESSOAS
========================= */

async function carregarPessoas() {
  const response = await apiFetch("/pessoas/");

  if (!response.ok) {
    throw new Error(
      `Erro ao carregar pessoas: ${response.status}`
    );
  }

  const dados = await response.json();

  pessoas = Array.isArray(dados)
    ? dados
    : dados.results || [];

  preencherFiltros();
  aplicarFiltros();
}

/* =========================
   FILTROS
========================= */

function adicionarOpcao(select, valor, texto) {
  const option = document.createElement("option");

  option.value = valor;
  option.textContent = texto;

  select.appendChild(option);
}

function preencherFiltros() {
  const localidadeSelecionada =
    neighborhoodFilter?.value || "";

  const ruaSelecionada = streetFilter?.value || "";
  const usuarioSelecionado = userFilter?.value || "";

  const localidades = new Set();
  const ruas = new Set();
  const usuarios = new Set();

  pessoas.forEach(function (pessoa) {
    const localidade = nomeLocalidade(pessoa);
    const rua = nomeRua(pessoa);
    const cadastrador = nomeCadastrador(pessoa);

    if (localidade) {
      localidades.add(localidade);
    }

    if (rua) {
      ruas.add(rua);
    }

    if (cadastrador) {
      usuarios.add(cadastrador);
    }
  });

  if (neighborhoodFilter) {
    neighborhoodFilter.innerHTML =
      '<option value="">Todas as localidades</option>';

    Array.from(localidades)
      .sort()
      .forEach(function (localidade) {
        adicionarOpcao(
          neighborhoodFilter,
          localidade,
          localidade
        );
      });

    neighborhoodFilter.value = localidadeSelecionada;
  }

  if (streetFilter) {
    streetFilter.innerHTML =
      '<option value="">Todas as ruas</option>';

    Array.from(ruas)
      .sort()
      .forEach(function (rua) {
        adicionarOpcao(streetFilter, rua, rua);
      });

    streetFilter.value = ruaSelecionada;
  }

  if (userFilter && usuarioEhAdministrador()) {
    userFilter.innerHTML =
      '<option value="">Todos os usuários</option>';

    Array.from(usuarios)
      .sort()
      .forEach(function (usuario) {
        adicionarOpcao(userFilter, usuario, usuario);
      });

    userFilter.value = usuarioSelecionado;
  }
}

function correspondePeriodo(pessoa, periodo) {
  if (!periodo) {
    return true;
  }

  if (!pessoa.criado_em) {
    return false;
  }

  const cadastro = new Date(pessoa.criado_em);
  const agora = new Date();

  if (periodo === "hoje") {
    return (
      cadastro.getDate() === agora.getDate() &&
      cadastro.getMonth() === agora.getMonth() &&
      cadastro.getFullYear() === agora.getFullYear()
    );
  }

  if (periodo === "semana") {
    const seteDias = 7 * 24 * 60 * 60 * 1000;

    return (
      agora.getTime() - cadastro.getTime() <= seteDias
    );
  }

  if (periodo === "mes") {
    return (
      cadastro.getMonth() === agora.getMonth() &&
      cadastro.getFullYear() === agora.getFullYear()
    );
  }

  return true;
}

function aplicarFiltros() {
  const pesquisa = normalizarTexto(searchInput?.value);

  const localidadeSelecionada =
    neighborhoodFilter?.value || "";

  const ruaSelecionada = streetFilter?.value || "";
  const usuarioSelecionado = userFilter?.value || "";
  const periodoSelecionado = periodFilter?.value || "";

  const pessoasFiltradas = pessoas.filter(function (pessoa) {
    const nome = normalizarTexto(pessoa.nome_completo);
    const telefone = normalizarTexto(pessoa.telefone);
    const cpf = normalizarTexto(pessoa.cpf);
    const titulo = normalizarTexto(pessoa.titulo_eleitor);

    const atendePesquisa =
      !pesquisa ||
      nome.includes(pesquisa) ||
      telefone.includes(pesquisa) ||
      cpf.includes(pesquisa) ||
      titulo.includes(pesquisa);

    const atendeLocalidade =
      !localidadeSelecionada ||
      nomeLocalidade(pessoa) === localidadeSelecionada;

    const atendeRua =
      !ruaSelecionada ||
      nomeRua(pessoa) === ruaSelecionada;

    const atendeUsuario =
      !usuarioSelecionado ||
      nomeCadastrador(pessoa) === usuarioSelecionado;

    const atendePeriodo = correspondePeriodo(
      pessoa,
      periodoSelecionado
    );

    return (
      atendePesquisa &&
      atendeLocalidade &&
      atendeRua &&
      atendeUsuario &&
      atendePeriodo
    );
  });

  renderizarTabela(pessoasFiltradas);
  atualizarResumo(pessoasFiltradas);
}

/* =========================
   RESUMO
========================= */

function atualizarResumo(pessoasFiltradas) {
  const totalAtivos = pessoas.filter(function (pessoa) {
    return pessoa.status === "ATIVO";
  }).length;

  const totalHoje = pessoas.filter(function (pessoa) {
    return correspondePeriodo(pessoa, "hoje");
  }).length;

  if (peopleTotal) {
    peopleTotal.textContent = pessoas.length;
  }

  if (visibleTotal) {
    visibleTotal.textContent = pessoasFiltradas.length;
  }

  if (activePeopleTotal) {
    activePeopleTotal.textContent = totalAtivos;
  }

  if (todayPeopleTotal) {
    todayPeopleTotal.textContent = totalHoje;
  }
}

/* =========================
   TABELA
========================= */

function renderizarTabela(lista) {
  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = "";

  if (!lista.length) {
    emptyState?.classList.add("visible");
    return;
  }

  emptyState?.classList.remove("visible");

  lista.forEach(function (pessoa) {
    const nome = pessoa.nome_completo || "-";
    const iniciais = obterIniciais(nome);
    const localidade = nomeLocalidade(pessoa) || "-";
    const rua = nomeRua(pessoa) || "-";
    const cadastrador = nomeCadastrador(pessoa) || "-";
    const statusAtivo = pessoa.status === "ATIVO";

    const deleteButton = usuarioEhAdministrador()
      ? `
        <button
          type="button"
          title="Excluir"
          class="delete-button"
          data-action="delete"
          aria-label="Excluir ${protegerHTML(nome)}"
        >
          <i data-lucide="trash-2"></i>
        </button>
      `
      : "";

    const tr = document.createElement("tr");

    tr.dataset.id = pessoa.id;

    tr.innerHTML = `
      <td data-label="Nome">
        <div class="person-name">
          <span class="person-avatar">
            ${protegerHTML(iniciais)}
          </span>

          <strong data-person-name>
            ${protegerHTML(nome)}
          </strong>
        </div>
      </td>

      <td data-label="Telefone">
        ${protegerHTML(formatarTelefone(pessoa.telefone))}
      </td>

      <td data-label="Localidade">
        ${protegerHTML(localidade)}
      </td>

      <td data-label="Rua">
        ${protegerHTML(rua)}
      </td>

      <td data-label="Data">
        ${protegerHTML(formatarData(pessoa.criado_em))}
      </td>

      <td data-label="Cadastrado por">
        ${protegerHTML(cadastrador)}
      </td>

      <td data-label="Status">
        <span class="status ${
          statusAtivo ? "active" : "inactive"
        }">
          ${statusAtivo ? "Ativo" : "Inativo"}
        </span>
      </td>

      <td data-label="Ações">
        <div class="table-actions">

          <button
            type="button"
            title="Visualizar"
            data-action="view"
            aria-label="Visualizar ${protegerHTML(nome)}"
          >
            <i data-lucide="eye"></i>
          </button>

          <button
            type="button"
            title="Editar"
            data-action="edit"
            aria-label="Editar ${protegerHTML(nome)}"
          >
            <i data-lucide="pencil"></i>
          </button>

          ${deleteButton}

        </div>
      </td>
    `;

    tableBody.appendChild(tr);
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/* =========================
   VISUALIZAR PESSOA
========================= */
async function visualizarPessoa(pessoa) {
  const dataNascimento =
    pessoa.data_nascimento
      ? new Date(
          `${pessoa.data_nascimento}T00:00:00`
        ).toLocaleDateString("pt-BR")
      : "-";

  const criadoEm =
    pessoa.criado_em
      ? new Date(
          pessoa.criado_em
        ).toLocaleString("pt-BR")
      : "-";

  const mensagem = [
    "DADOS PESSOAIS",
    "",
    `Nome completo: ${pessoa.nome_completo || "-"}`,
    `CPF: ${pessoa.cpf || "-"}`,
    `Data de nascimento: ${dataNascimento}`,
    `Telefone: ${formatarTelefone(pessoa.telefone)}`,
    "",
    "DADOS ELEITORAIS",
    "",
    `Título de eleitor: ${pessoa.titulo_eleitor || "-"}`,
    `Zona eleitoral: ${pessoa.zona_eleitoral || "-"}`,
    `Seção eleitoral: ${pessoa.secao_eleitoral || "-"}`,
    `Município eleitoral: ${pessoa.municipio_eleitoral || "-"}`,
    "",
    "ENDEREÇO",
    "",
    `Região: ${pessoa.regiao_nome || "-"}`,
    `Localidade: ${nomeLocalidade(pessoa) || "-"}`,
    `Rua: ${nomeRua(pessoa) || "-"}`,
    `Número: ${pessoa.numero || "-"}`,
    `Complemento: ${pessoa.complemento || "-"}`,
    "",
    "INFORMAÇÕES DO CADASTRO",
    "",
    `Status: ${pessoa.status || "-"}`,
    `Cadastrada por: ${pessoa.cadastrada_por_nome || "-"}`,
    `Data do cadastro: ${criadoEm}`
  ].join("\n");

  if (window.SystemModal) {
    await window.SystemModal.alert({
      title: "Dados da pessoa cadastrada",
      message: mensagem,
      confirmText: "Fechar",
      type: "information"
    });

    return;
  }

  window.alert(mensagem);
}



/* =========================
   EXCLUIR PESSOA
========================= */

async function excluirPessoa(pessoa) {
  if (!usuarioEhAdministrador()) {
    if (window.SystemModal) {
      await window.SystemModal.alert({
        title: "Acesso negado",
        message:
          "Somente administradores podem excluir cadastros.",
        type: "warning"
      });
    }

    return;
  }

  let confirmouExclusao = false;

  if (window.SystemModal) {
    confirmouExclusao = await window.SystemModal.confirm({
      title: "Excluir pessoa cadastrada?",
      message:
        `Você deseja excluir o cadastro de ` +
        `${pessoa.nome_completo}? ` +
        "Essa ação não poderá ser desfeita.",
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
      type: "danger"
    });
  } else {
    confirmouExclusao = window.confirm(
      `Deseja excluir o cadastro de ${pessoa.nome_completo}?`
    );
  }

  if (!confirmouExclusao) {
    return;
  }

  try {
    window.SystemModal?.loading.show(
      "Excluindo cadastro..."
    );

    const response = await apiFetch(
      `/pessoas/${pessoa.id}/`,
      {
        method: "DELETE"
      }
    );

    if (!response.ok && response.status !== 204) {
      let mensagemErro = "Não foi possível excluir o cadastro.";

      try {
        const dadosErro = await response.json();

        mensagemErro =
          dadosErro.detail ||
          dadosErro.mensagem ||
          mensagemErro;
      } catch (error) {
        console.error("Resposta sem JSON:", error);
      }

      throw new Error(mensagemErro);
    }

    pessoas = pessoas.filter(function (item) {
      return String(item.id) !== String(pessoa.id);
    });

    preencherFiltros();
    aplicarFiltros();

    window.SystemModal?.loading.hide();

    if (window.SystemModal) {
      await window.SystemModal.success(
        "A pessoa cadastrada foi excluída com sucesso.",
        "Cadastro excluído"
      );
    }
  } catch (error) {
    console.error("Erro ao excluir pessoa:", error);

    window.SystemModal?.loading.hide();

    if (window.SystemModal) {
      await window.SystemModal.alert({
        title: "Erro ao excluir",
        message:
          error.message ||
          "Não foi possível excluir o cadastro.",
        type: "warning"
      });
    } else {
      window.alert(
        error.message ||
        "Não foi possível excluir o cadastro."
      );
    }
  }
}

/* =========================
   EVENTOS DA TABELA
========================= */

tableBody?.addEventListener("click", async function (event) {
  const botao = event.target.closest("button[data-action]");

  if (!botao) {
    return;
  }

  const linha = botao.closest("tr");
  const pessoaId = linha?.dataset.id;

  if (!pessoaId) {
    return;
  }

  const pessoa = pessoas.find(function (item) {
    return String(item.id) === String(pessoaId);
  });

  if (!pessoa) {
    return;
  }

  const acao = botao.dataset.action;

  if (acao === "view") {
    await visualizarPessoa(pessoa);
    return;
  }

  if (acao === "edit") {
    window.location.href =
      `novo-cadastro.html?id=${pessoaId}`;
    return;
  }

  if (acao === "delete") {
    await excluirPessoa(pessoa);
  }
});

/* =========================
   EVENTOS DOS FILTROS
========================= */

searchInput?.addEventListener("input", aplicarFiltros);

neighborhoodFilter?.addEventListener(
  "change",
  aplicarFiltros
);

streetFilter?.addEventListener("change", aplicarFiltros);
userFilter?.addEventListener("change", aplicarFiltros);
periodFilter?.addEventListener("change", aplicarFiltros);

clearFiltersButton?.addEventListener("click", function () {
  if (searchInput) {
    searchInput.value = "";
  }

  if (neighborhoodFilter) {
    neighborhoodFilter.value = "";
  }

  if (streetFilter) {
    streetFilter.value = "";
  }

  if (userFilter) {
    userFilter.value = "";
  }

  if (periodFilter) {
    periodFilter.value = "";
  }

  aplicarFiltros();
  searchInput?.focus();
});

/* =========================
   LOGOUT
========================= */

logoutButton?.addEventListener("click", async function () {
  let confirmouSaida = false;

  if (window.SystemModal) {
    confirmouSaida = await window.SystemModal.confirm({
      title: "Sair do sistema?",
      message:
        "Você precisará entrar novamente para acessar o sistema.",
      confirmText: "Sim, sair",
      cancelText: "Cancelar",
      type: "warning"
    });
  } else {
    confirmouSaida = window.confirm(
      "Deseja realmente sair do sistema?"
    );
  }

  if (confirmouSaida) {
    fazerLogout();
  }
});

notificationButton?.addEventListener(
  "click",
  async function () {
    if (window.SystemModal) {
      await window.SystemModal.alert({
        title: "Notificações",
        message:
          "Você não possui novas notificações no momento.",
        type: "information"
      });

      return;
    }

    window.alert(
      "Você não possui novas notificações no momento."
    );
  }
);

/* =========================
   INICIALIZAÇÃO
========================= */

async function iniciarPagina() {
  try {
    usuarioAtual = await buscarUsuarioLogado();

    if (!usuarioAtual) {
      throw new Error("Usuário não autenticado.");
    }

    preencherUsuario(usuarioAtual);
    await carregarPessoas();
  } catch (error) {
    console.error(
      "Erro ao iniciar página de pessoas:",
      error
    );

    limparSessao();
    window.location.href = "index.html";
  }
}

document.addEventListener(
  "DOMContentLoaded",
  iniciarPagina
);