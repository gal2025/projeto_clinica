// ─── PACIENTES (Supabase) ───
let pacientesState = { pagina: 0, limite: 20, filtro: "" };

Router.register("pacientes", async () => {
  if (!Auth.requireAuth("medica")) return;
  pacientesState.pagina = 0;
  pacientesState.filtro = "";
  await renderPacientes();
});

async function renderPacientes() {
  const { pagina, limite, filtro } = pacientesState;

  document.getElementById("app").innerHTML = `
    <div class="app-shell">
      ${renderSidebar("pacientes")}
      <main class="main-content">
        <div style="display:flex;align-items:center;justify-content:center;height:60vh;flex-direction:column;gap:12px">
          <i class="ti ti-loader-2" style="font-size:28px;color:var(--teal-400);animation:spin 1s linear infinite"></i>
          <div style="font-size:13px;color:var(--gray-400)">A carregar pacientes...</div>
        </div>
      </main>
    </div>`;

  const total = await SB.getTotalPacientes();
  const totalPaginas = Math.ceil(total / limite);

  let lista;
  if (filtro) {
    const todos = await SB.getPerfis();
    lista = todos.filter(p =>
      p.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      (p.nif || "").includes(filtro)
    );
  } else {
    lista = await SB.getPerfisComConsultas(limite, pagina * limite);
  }

  const rows = lista.map(p => {
    const consultas = p.consultas || [];
    const ultima = consultas.sort((a, b) => b.data.localeCompare(a.data))[0];
    const pendente = consultas.some(c => c.estado === "pendente");
    const estado = pendente ? "pendente" : consultas.length > 0 ? "ativo" : "novo";
    const map = { ativo: "badge-green", pendente: "badge-amber", novo: "badge-blue" };
    const label = { ativo: "Ativo", pendente: "Pag. pendente", novo: "Novo" };
    const iniciais = (p.nome || "?").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
    return `
      <tr>
        <td>
          <div class="flex-center gap-3">
            <div class="avatar-circle patient" style="font-size:11px">${esc(iniciais)}</div>
            <div>
              <div class="font-medium">${esc(p.nome)}</div>
              <div class="text-sm text-muted">${esc(p.id)}</div>
            </div>
          </div>
        </td>
        <td class="text-sm text-muted">${esc(p.nif || "—")}</td>
        <td class="text-sm">${esc(p.telefone || "—")}</td>
        <td class="text-sm">${ultima ? fmtData(ultima.data) : "—"}</td>
        <td style="text-align:center;font-size:13px">${consultas.length}</td>
        <td><span class="badge ${map[estado]}">${label[estado]}</span></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="verFichaPaciente('${p.id}')">
            <i class="ti ti-eye"></i> Ver ficha
          </button>
        </td>
      </tr>`;
  }).join("");

  const paginacaoHtml = !filtro ? `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:1rem">
      <div class="text-sm text-muted">
        Página ${pagina + 1} de ${totalPaginas} (${total} pacientes)
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary btn-sm" onclick="mudarPagina(-1)" ${pagina === 0 ? "disabled" : ""}>
          <i class="ti ti-chevron-left"></i> Anterior
        </button>
        <button class="btn btn-secondary btn-sm" onclick="mudarPagina(1)" ${pagina >= totalPaginas - 1 ? "disabled" : ""}>
          Seguinte <i class="ti ti-chevron-right"></i>
        </button>
      </div>
    </div>` : "";

  document.getElementById("app").innerHTML = `
    <div class="app-shell">
      ${renderSidebar("pacientes")}
      <main class="main-content">
        <div class="page-header">
          <div class="page-header-row">
            <div>
              <div class="page-title">Pacientes</div>
              <div class="page-sub">${total} pacientes registados</div>
            </div>
          </div>
        </div>
        <div class="card">
          <div style="display:flex;gap:8px;margin-bottom:1rem">
            <input class="form-input" type="text" placeholder="Pesquisar por nome ou NIF..."
              value="${filtro}" oninput="pacientesState.filtro=this.value;pacientesState.pagina=0;renderPacientes()"
              style="max-width:400px">
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Paciente</th><th>NIF</th><th>Contacto</th>
                  <th>Ultima consulta</th><th style="text-align:center">Consultas</th>
                  <th>Estado</th><th>Acoes</th>
                </tr>
              </thead>
              <tbody>${rows || `<tr><td colspan="7"><div class="empty-state"><i class="ti ti-search"></i><p>Nenhum paciente encontrado</p></div></td></tr>`}</tbody>
            </table>
          </div>
          ${paginacaoHtml}
        </div>
      </main>
    </div>`;
}

function mudarPagina(dir) {
  pacientesState.pagina += dir;
  renderPacientes();
}

async function verFichaPaciente(id) {
  const [p, consultas] = await Promise.all([SB.getPerfil(id), SB.getConsultasPaciente(id)]);
  const iniciais = (p.nome || "?").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  const consultasHtml = consultas.length
    ? consultas.map(c => `
        <div class="appt-item" style="margin-bottom:7px">
          <span class="appt-time" style="min-width:80px">${fmtData(c.data)}</span>
          <div class="appt-info">
            <div class="appt-name">${c.tipos_consulta?.label || c.tipo}</div>
            <div class="appt-type">${c.hora?.substring(0, 5)}</div>
          </div>
          ${badgeEstado(c.estado)}
        </div>`).join("")
    : `<div class="empty-state"><i class="ti ti-calendar-off"></i><p>Sem consultas</p></div>`;

  showModal(`
    <div class="modal" style="max-width:540px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:1.25rem">
        <div class="avatar-circle patient lg">${esc(iniciais)}</div>
        <div>
          <div style="font-size:17px;font-weight:500">${esc(p.nome)}</div>
          <div class="text-sm text-muted">${esc(p.nif || "Sem NIF")}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1.25rem">
        <div style="background:var(--bg-subtle);border-radius:var(--radius-md);padding:.75rem">
          <div class="text-sm text-muted">NIF</div>
          <div class="font-medium" style="font-size:13px">${esc(p.nif || "—")}</div>
        </div>
        <div style="background:var(--bg-subtle);border-radius:var(--radius-md);padding:.75rem">
          <div class="text-sm text-muted">Telefone</div>
          <div class="font-medium" style="font-size:13px">${esc(p.telefone || "—")}</div>
        </div>
        <div style="background:var(--bg-subtle);border-radius:var(--radius-md);padding:.75rem">
          <div class="text-sm text-muted">Data de nascimento</div>
          <div class="font-medium" style="font-size:13px">${p.data_nascimento ? fmtData(p.data_nascimento) : "—"}</div>
        </div>
        <div style="background:var(--bg-subtle);border-radius:var(--radius-md);padding:.75rem">
          <div class="text-sm text-muted">Total de consultas</div>
          <div class="font-medium" style="font-size:13px">${consultas.length}</div>
        </div>
      </div>
      <div class="card-title">Historico de consultas</div>
      <div style="max-height:260px;overflow-y:auto">${consultasHtml}</div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Fechar</button>
        <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove();Router.go('agenda')">
          <i class="ti ti-calendar-plus"></i> Nova consulta
        </button>
      </div>
    </div>
  `);
}