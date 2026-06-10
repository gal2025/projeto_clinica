// AREA DO PACIENTE (Supabase)
Router.register("paciente-area", async () => {
  if (!Auth.requireAuth("paciente")) return;
  const user = Auth.currentPerfil;

  document.getElementById("app").innerHTML = `
    <div class="app-shell">
      ${renderSidebar("paciente-area")}
      <main class="main-content">
        <div style="display:flex;align-items:center;justify-content:center;height:60vh;flex-direction:column;gap:12px">
          <i class="ti ti-loader-2" style="font-size:28px;color:var(--teal-400);animation:spin 1s linear infinite"></i>
          <div style="font-size:13px;color:var(--gray-400)">A carregar...</div>
        </div>
      </main>
    </div>
  `;

  const consultas = await SB.getConsultasPaciente(user.id);
  const hoje = getToday();
  const proximas = consultas.filter(c => c.data >= hoje && c.estado !== "cancelada");
  const passadas = consultas.filter(c => c.data < hoje || c.estado === "concluida");

  const proximasHtml = proximas.length
    ? proximas.map(c => {
        const tipo = c.tipos_consulta;
        // Pode reagendar se a consulta é pendente ou confirmada e falta mais de 24h
        const dataHoraConsulta = new Date(`${c.data}T${c.hora}`);
        const podeReagendar = (c.estado === "pendente" || c.estado === "confirmada")
          && (dataHoraConsulta - new Date()) > 24 * 60 * 60 * 1000;

        return `<div class="appt-item">
          <div style="min-width:90px">
            <div class="font-medium" style="font-size:13px">${fmtData(c.data)}</div>
            <div class="text-sm text-muted">${c.hora?.substring(0,5)}</div>
          </div>
          <div class="appt-info">
            <div class="appt-name">${esc(tipo?.label || c.tipo || '')}</div>
            <div class="appt-type"><i class="ti ti-video" style="font-size:11px;color:var(--blue-400)"></i> Videoconsulta</div>
          </div>
          <div class="appt-actions" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
            ${badgeEstado(c.estado)}
            ${c.meet_link
              ? `<a href="${c.meet_link}" target="_blank" class="btn btn-meet btn-sm"><i class="ti ti-video"></i> Entrar</a>`
              : `<span class="text-sm text-muted">Link em breve</span>`
            }
            ${podeReagendar ? `
              <button class="btn btn-secondary btn-sm" title="Reagendar" onclick="reagendarPacienteModal('${c.id}','${c.data}','${c.hora?.substring(0,5)}')">
                <i class="ti ti-calendar-event"></i> Reagendar
              </button>` : ''}
          </div>
        </div>`;
      }).join("")
    : `<div class="empty-state"><i class="ti ti-calendar-off"></i><p>Sem consultas agendadas</p></div>`;

  const passadasHtml = passadas.length
    ? passadas.slice(0, 5).map(c => {
        const tipo = c.tipos_consulta;
        const pag = c.pagamentos?.[0];
        return `<div class="appt-item">
          <div style="min-width:90px">
            <div class="font-medium" style="font-size:13px">${fmtData(c.data)}</div>
            <div class="text-sm text-muted">${c.hora?.substring(0,5)}</div>
          </div>
          <div class="appt-info">
            <div class="appt-name">${esc(tipo?.label || c.tipo || '')}</div>
            <div class="appt-type">${pag ? `${fmtMetodo(pag.metodo)} - ${pag.valor}EUR` : "-"}</div>
          </div>
          ${badgeEstado(c.estado)}
        </div>`;
      }).join("")
    : `<div class="empty-state"><i class="ti ti-history"></i><p>Sem historico</p></div>`;

  const iniciais = (user.nome || "?").split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase();
  const primeiroNome = (user.nome || "Paciente").split(" ")[0];

  document.getElementById("app").innerHTML = `
    <div class="app-shell">
      ${renderSidebar("paciente-area")}
      <main class="main-content">
        <div class="page-header">
          <div class="page-header-row">
            <div>
              <div class="page-title">Ola, ${esc(primeiroNome)}!</div>
              <div class="page-sub">Area do paciente</div>
            </div>
            <button class="btn btn-primary" onclick="Router.go('portal')">
              <i class="ti ti-calendar-plus"></i> Marcar consulta
            </button>
          </div>
        </div>
        <div class="two-col" style="margin-bottom:1.25rem">
          <div class="stat-card">
            <div class="stat-label"><i class="ti ti-calendar-check"></i> Proximas consultas</div>
            <div class="stat-value">${proximas.length}</div>
            <div class="stat-sub">${proximas[0] ? `Proxima: ${fmtData(proximas[0].data)}` : "Nenhuma agendada"}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label"><i class="ti ti-history"></i> Consultas realizadas</div>
            <div class="stat-value">${passadas.length}</div>
            <div class="stat-sub">Total acumulado</div>
          </div>
        </div>
        <div class="card mb-6">
          <div class="card-header">
            <div class="card-title" style="margin-bottom:0">Proximas consultas</div>
            <button class="btn btn-secondary btn-sm" onclick="Router.go('portal')"><i class="ti ti-plus"></i> Nova marcacao</button>
          </div>
          ${proximasHtml}
        </div>
        <div class="card mb-6">
          <div class="card-title">Historico</div>
          ${passadasHtml}
        </div>
        <div class="card mb-6">
          <div class="card-header">
            <div class="card-title" style="margin-bottom:0">Os meus dados</div>
            <button class="btn btn-secondary btn-sm" onclick="editarMeusDados()">
              <i class="ti ti-edit"></i> Editar
            </button>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-top:.75rem">
            <div style="background:var(--bg-subtle);border-radius:var(--radius-md);padding:.75rem">
              <div class="text-sm text-muted">Nome</div>
              <div class="font-medium" style="font-size:13px">${esc(user.nome || "—")}</div>
            </div>
            <div style="background:var(--bg-subtle);border-radius:var(--radius-md);padding:.75rem">
              <div class="text-sm text-muted">Email</div>
              <div class="font-medium" style="font-size:13px">${esc(user.email || "—")}</div>
            </div>
            <div style="background:var(--bg-subtle);border-radius:var(--radius-md);padding:.75rem">
              <div class="text-sm text-muted">NIF</div>
              <div class="font-medium" style="font-size:13px">${esc(user.nif || "—")}</div>
            </div>
            <div style="background:var(--bg-subtle);border-radius:var(--radius-md);padding:.75rem">
              <div class="text-sm text-muted">Telefone</div>
              <div class="font-medium" style="font-size:13px">${esc(user.telefone || "—")}</div>
            </div>
          </div>
        </div>
        <div class="card" style="background:var(--teal-50);border-color:var(--teal-100)">
          <div class="flex-center gap-3">
            <div style="width:40px;height:40px;border-radius:50%;background:var(--teal-100);display:flex;align-items:center;justify-content:center">
              <i class="ti ti-stethoscope" style="color:var(--teal-600);font-size:18px"></i>
            </div>
            <div>
              <div class="font-medium" style="color:var(--teal-800)">${DB.clinica.nome}</div>
              <div class="text-sm" style="color:var(--teal-600)">Disponivel seg-sex, 09h00-18h00 - Consultas online</div>
            </div>
            <button class="btn btn-primary btn-sm" style="margin-left:auto" onclick="Router.go('portal')">
              <i class="ti ti-calendar-plus"></i> Marcar
            </button>
          </div>
        </div>
      </main>
    </div>
  `;
});

// ─── REAGENDAR PELO PACIENTE ───
function reagendarPacienteModal(id, dataAtual, horaAtual) {
  window._reagendarPacId = id;
  window._reagendarPacDataAntiga = dataAtual;
  window._reagendarPacHoraAntiga = horaAtual;

  // Data mínima: amanhã
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  const minData = amanha.toISOString().split("T")[0];

  showModal(`
    <div class="modal">
      <div class="modal-title">
        <i class="ti ti-calendar-event"></i> Reagendar consulta
      </div>
      <p style="margin-bottom:1rem;color:var(--text-2);font-size:13px">
        Consulta atual: <strong>${fmtData(dataAtual)} às ${horaAtual}</strong>
      </p>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Nova data</label>
          <input class="form-input" type="date" id="re-pac-data" value="${dataAtual}" min="${minData}">
        </div>
        <div class="form-group">
          <label class="form-label">Nova hora</label>
          <input class="form-input" type="time" id="re-pac-hora" value="${horaAtual}" step="1800">
        </div>
      </div>
      <div style="background:var(--amber-50);border:1px solid var(--amber-200);border-radius:var(--radius-md);padding:.75rem;font-size:12px;color:var(--amber-700);margin-top:.5rem">
        <i class="ti ti-info-circle"></i> O reagendamento fica sujeito a confirmação pela clínica. Só é possível reagendar com mais de 24h de antecedência.
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
        <button class="btn btn-primary" onclick="confirmarReagendamentoPaciente()">
          <i class="ti ti-calendar-check"></i> Pedir reagendamento
        </button>
      </div>
    </div>
  `);
}

async function confirmarReagendamentoPaciente() {
  const id = window._reagendarPacId;
  const dataAntiga = window._reagendarPacDataAntiga;
  const horaAntiga = window._reagendarPacHoraAntiga;
  const novaData = document.getElementById("re-pac-data").value;
  const novaHora = document.getElementById("re-pac-hora").value;

  if (!novaData || !novaHora) { showToast("Preencha data e hora", "error"); return; }
  if (novaData === dataAntiga && novaHora === horaAntiga) {
    showToast("A data/hora é igual à atual", "error"); return;
  }

  // Verificar 24h de antecedência
  const dataHoraNova = new Date(`${novaData}T${novaHora}`);
  if ((dataHoraNova - new Date()) < 24 * 60 * 60 * 1000) {
    showToast("O reagendamento requer pelo menos 24h de antecedência", "error"); return;
  }

  // Verificar conflito
  const horasOcupadas = await SB.getHorasOcupadas(novaData);
  if (horasOcupadas.includes(novaHora)) {
    showToast("Esse horário já está ocupado. Escolha outro.", "error"); return;
  }

  const overlay = document.querySelector(".modal-overlay");
  const btn = overlay?.querySelector(".btn-primary");
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="ti ti-loader ti-spin"></i> A processar...'; }

  const { error } = await SB.updateConsulta(id, {
    data: novaData,
    hora: novaHora + ":00",
    estado: "pendente", // volta a pendente aguardando confirmação da médica
  });

  if (error) {
    showToast("Erro ao reagendar: " + error.message, "error");
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="ti ti-calendar-check"></i> Pedir reagendamento'; }
    return;
  }

  overlay?.remove();
  showToast("Reagendamento pedido para " + fmtData(novaData) + " às " + novaHora + ". Aguarda confirmação.", "success");
  Router.go("paciente-area");
}

// ─── EDITAR DADOS ───
function editarMeusDados() {
  const user = Auth.currentPerfil;
  showModal(`
    <div class="modal" style="max-width:480px">
      <div style="font-size:17px;font-weight:500;margin-bottom:1.25rem">
        <i class="ti ti-edit"></i> Editar os meus dados
      </div>
      <div class="form-group">
        <label class="form-label">Nome completo</label>
        <input class="form-input" id="edit-nome" type="text" value="${esc(user.nome || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">NIF</label>
        <input class="form-input" id="edit-nif" type="text" value="${esc(user.nif || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Telefone</label>
        <input class="form-input" id="edit-telefone" type="text" value="${esc(user.telefone || '')}">
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
        <button class="btn btn-primary" onclick="guardarMeusDados()">
          <i class="ti ti-check"></i> Guardar
        </button>
      </div>
    </div>
  `);
}

async function guardarMeusDados() {
  const nome = document.getElementById("edit-nome")?.value.trim();
  const nif = document.getElementById("edit-nif")?.value.trim();
  const telefone = document.getElementById("edit-telefone")?.value.trim();

  if (!nome) { showToast("O nome é obrigatório", "error"); return; }

  const { error } = await SB.updatePerfil(Auth.currentPerfil.id, { nome, nif, telefone });
  if (error) { showToast("Erro ao guardar: " + error.message, "error"); return; }

  Auth.currentPerfil.nome = nome;
  Auth.currentPerfil.nif = nif;
  Auth.currentPerfil.telefone = telefone;

  document.querySelector(".modal-overlay")?.remove();
  showToast("Dados atualizados com sucesso!");
  Router.go("paciente-area");
}

