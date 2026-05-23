// ─── PACIENTES (MÉDICA) ───
Router.register("pacientes", () => {
  if (!Auth.requireAuth("medica")) return;
  renderPacientes("");
});

function renderPacientes(filtro) {
  const todos = DB.utilizadores.filter(u => u.role === "paciente");
  const lista = filtro
    ? todos.filter(p =>
        p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
        p.email.toLowerCase().includes(filtro.toLowerCase()) ||
        (p.nif || "").includes(filtro)
      )
    : todos;

  const rows = lista.map(p => {
    const consultas = DB.getConsultasPaciente(p.id);
    const ultima = consultas[0];
    const pendente = consultas.some(c => c.estado === "pendente");
    const estado = pendente ? "pendente" : consultas.length > 0 ? "ativo" : "novo";
    const estadoMap = { ativo:"badge-green", pendente:"badge-amber", novo:"badge-blue" };
    const estadoLabel = { ativo:"Ativo", pendente:"Pag. pendente", novo:"Novo" };

    return `
      <tr>
        <td>
          <div class="flex-center gap-3">
            <div class="avatar-circle patient" style="font-size:11px">${p.iniciais}</div>
            <div>
              <div class="font-medium">${p.nome}</div>
              <div class="text-sm text-muted">${p.email}</div>
            </div>
          </div>
        </td>
        <td class="text-sm text-muted">${p.nif || "—"}</td>
        <td class="text-sm">${p.telefone || "—"}</td>
        <td class="text-sm">${ultima ? fmtData(ultima.data) : "—"}</td>
        <td style="text-align:center;font-size:13px">${consultas.length}</td>
        <td><span class="badge ${estadoMap[estado]}">${estadoLabel[estado]}</span></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="verFicha('${p.id}')">
            <i class="ti ti-eye"></i> Ver ficha
          </button>
        </td>
      </tr>`;
  }).join("");

  document.getElementById("app").innerHTML = `
    <div class="app-shell">
      ${renderSidebar("pacientes")}
      <main class="main-content">
        <div class="page-header">
          <div class="page-header-row">
            <div>
              <div class="page-title">Pacientes</div>
              <div class="page-sub">${todos.length} pacientes registados</div>
            </div>
          </div>
        </div>
        <div class="card">
          <div style="display:flex;gap:8px;margin-bottom:1rem">
            <input class="form-input" type="text" placeholder="Pesquisar por nome, NIF ou email..." value="${filtro}"
              oninput="renderPacientes(this.value)" style="max-width:400px">
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>NIF</th>
                  <th>Contacto</th>
                  <th>Última consulta</th>
                  <th style="text-align:center">Consultas</th>
                  <th>Estado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                ${rows || `<tr><td colspan="7"><div class="empty-state"><i class="ti ti-search"></i><p>Nenhum paciente encontrado</p></div></td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  `;
}

function verFicha(pacienteId) {
  const p = DB.getPaciente(pacienteId);
  const consultas = DB.getConsultasPaciente(pacienteId);

  const consultasHtml = consultas.length
    ? consultas.map(c => {
        const tipo = DB.getTipoConsulta(c.tipo);
        return `
          <div class="appt-item" style="margin-bottom:7px">
            <span class="appt-time" style="min-width:80px">${fmtData(c.data)}</span>
            <div class="appt-info">
              <div class="appt-name">${tipo?.label}</div>
              <div class="appt-type">${c.hora}</div>
            </div>
            ${badgeEstado(c.estado)}
            ${c.pagamentoId ? `<button class="btn btn-ghost btn-sm" onclick="verRecibo('${c.id}')"><i class="ti ti-file-invoice"></i> Recibo</button>` : ""}
          </div>`;
      }).join("")
    : `<div class="empty-state"><i class="ti ti-calendar-off"></i><p>Sem consultas</p></div>`;

  showModal(`
    <div class="modal" style="max-width:540px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:1.25rem">
        <div class="avatar-circle patient lg">${p.iniciais}</div>
        <div>
          <div style="font-size:17px;font-weight:500">${p.nome}</div>
          <div class="text-sm text-muted">${p.email}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1.25rem">
        <div style="background:var(--bg-subtle);border-radius:var(--radius-md);padding:.75rem">
          <div class="text-sm text-muted">NIF</div>
          <div class="font-medium" style="font-size:13px">${p.nif || "—"}</div>
        </div>
        <div style="background:var(--bg-subtle);border-radius:var(--radius-md);padding:.75rem">
          <div class="text-sm text-muted">Telefone</div>
          <div class="font-medium" style="font-size:13px">${p.telefone || "—"}</div>
        </div>
        <div style="background:var(--bg-subtle);border-radius:var(--radius-md);padding:.75rem">
          <div class="text-sm text-muted">Data de nascimento</div>
          <div class="font-medium" style="font-size:13px">${p.dataNascimento ? fmtData(p.dataNascimento) : "—"}</div>
        </div>
        <div style="background:var(--bg-subtle);border-radius:var(--radius-md);padding:.75rem">
          <div class="text-sm text-muted">Total de consultas</div>
          <div class="font-medium" style="font-size:13px">${consultas.length}</div>
        </div>
      </div>
      <div class="card-title">Histórico de consultas</div>
      <div style="max-height:260px;overflow-y:auto">${consultasHtml}</div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Fechar</button>
        <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove();novaConsultaModal('${getToday()}','')">
          <i class="ti ti-calendar-plus"></i> Nova consulta
        </button>
      </div>
    </div>
  `);
}

function verRecibo(consultaId) {
  document.querySelector(".modal-overlay")?.remove();
  showModal(`
    <div class="modal" style="max-width:480px">
      <div class="modal-title">Recibo</div>
      ${renderRecibo(consultaId)}
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Fechar</button>
        <button class="btn btn-secondary" onclick="window.print()"><i class="ti ti-printer"></i> Imprimir</button>
      </div>
    </div>
  `);
}
