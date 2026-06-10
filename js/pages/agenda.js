// ─── AGENDA (MÉDICA) ───
let agendaState = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(), // 0-based
  selectedDate: getToday(),
};

Router.register("agenda", () => {
  if (!Auth.requireAuth("medica")) return;
  renderAgenda();
});

async function renderAgenda() {
  const { year, month, selectedDate } = agendaState;
  const anoMes = `${year}-${String(month + 1).padStart(2, "0")}`;
  const diasComConsultas = await SB.getDiasComConsultas(anoMes);
  const consultasDia = await SB.getConsultasDia(selectedDate);

  const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const firstDay = new Date(year, month, 1).getDay();
  const adjustedFirst = (firstDay === 0) ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const today = getToday();

  let calCells = "";
  for (let i = adjustedFirst - 1; i >= 0; i--) {
    calCells += `<div class="cal-day other-month">${prevDays - i}</div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const isToday = iso === today;
    const isSel = iso === selectedDate;
    const hasAppt = diasComConsultas.includes(d);
    const cls = ["cal-day", isToday ? "today" : "", isSel && !isToday ? "selected" : "", hasAppt ? "has-appt" : ""].filter(Boolean).join(" ");
    calCells += `<div class="${cls}" onclick="selectDia('${iso}')">${d}</div>`;
  }
  const totalCells = Math.ceil((adjustedFirst + daysInMonth) / 7) * 7;
  for (let d = 1; d <= totalCells - adjustedFirst - daysInMonth; d++) {
    calCells += `<div class="cal-day other-month">${d}</div>`;
  }

  const horariosSlots = Array.from(new Set([
    "09:00","10:00","11:00","11:30","12:00","12:30","13:00","14:00","15:00","16:00","16:30","17:00","17:30"
  ]));

  const consultasMap = {};
  consultasDia.forEach(c => { consultasMap[c.hora?.substring(0,5)] = c; });

  const timelineHtml = horariosSlots.map(hora => {
    const c = consultasMap[hora];
    if (c) {
      const pac = c.perfis;
      const tipo = c.tipos_consulta;
      const isFutura = c.estado !== 'cancelada';
      return `
        <div class="timeline-slot">
          <span class="slot-time">${hora}</span>
          <div class="slot-block ${c.estado === 'pendente' ? 'slot-pending' : c.estado === 'cancelada' ? 'slot-cancelled' : 'slot-filled'}" style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div class="slot-name">${esc(pac?.nome || '')}</div>
              <div class="slot-detail">${esc(tipo?.label || '')} · ${fmtEstado(c.estado)}</div>
            </div>
            <div style="display:flex;gap:6px;align-items:center">
              ${c.meet_link
                ? `<a href="${c.meet_link}" target="_blank" class="btn btn-meet btn-sm"><i class="ti ti-video"></i> Entrar</a>`
                : c.estado === "pendente"
                  ? `<button class="btn btn-secondary btn-sm" onclick="confirmarPagamentoModal('${c.id}')"><i class="ti ti-check"></i> Confirmar pag.</button>`
                  : ""}
              ${isFutura ? `
                <button class="btn btn-secondary btn-sm" title="Reagendar" onclick="reagendarConsultaModal('${c.id}','${c.data}','${c.hora?.substring(0,5)}')">
                  <i class="ti ti-calendar-event"></i>
                </button>
                <button class="btn btn-secondary btn-sm" title="Cancelar" style="color:var(--red-400)" onclick="cancelarConsultaConfirm('${c.id}')">
                  <i class="ti ti-x"></i>
                </button>` : ''}
            </div>
          </div>
        </div>`;
    }
    return `
      <div class="timeline-slot">
        <span class="slot-time">${hora}</span>
        <div class="slot-block slot-empty" onclick="novaConsultaModal('${selectedDate}','${hora}')">
          + Adicionar marcação
        </div>
      </div>`;
  }).join("");

  const [sy, sm, sd] = selectedDate.split("-");
  const diasSem = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
  const mesesArr = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  const selLabel = `${diasSem[new Date(selectedDate).getDay()]}, ${parseInt(sd)} de ${mesesArr[parseInt(sm)-1]}`;

  document.getElementById("app").innerHTML = `
    <div class="app-shell">
      ${renderSidebar("agenda")}
      <main class="main-content">
        <div class="page-header">
          <div class="page-title">Agenda</div>
          <div class="page-sub">Gerir videoconsultas</div>
        </div>
        <div class="agenda-layout">
          <div>
            <div class="card" style="margin-bottom:1rem">
              <div class="mini-cal-header">
                <button class="cal-nav-btn" onclick="agendaMes(-1)"><i class="ti ti-chevron-left"></i></button>
                <span class="mini-cal-title">${meses[month]} ${year}</span>
                <button class="cal-nav-btn" onclick="agendaMes(1)"><i class="ti ti-chevron-right"></i></button>
              </div>
              <div class="cal-grid">
                <div class="cal-day-hdr">Seg</div><div class="cal-day-hdr">Ter</div>
                <div class="cal-day-hdr">Qua</div><div class="cal-day-hdr">Qui</div>
                <div class="cal-day-hdr">Sex</div><div class="cal-day-hdr">Sáb</div>
                <div class="cal-day-hdr">Dom</div>
                ${calCells}
              </div>
            </div>
            <div class="card" style="font-size:12px">
              <div class="card-title">Legenda</div>
              <div style="display:flex;flex-direction:column;gap:8px">
                <div class="flex-center gap-2"><span style="width:10px;height:10px;border-radius:50%;background:var(--teal-400);display:inline-block"></span> Com consulta</div>
                <div class="flex-center gap-2"><span style="width:10px;height:10px;border-radius:50%;background:var(--amber-400);display:inline-block"></span> Pagamento pendente</div>
                <div class="flex-center gap-2"><span style="width:10px;height:10px;border-radius:50%;background:var(--border);display:inline-block"></span> Disponível</div>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-header">
              <div class="card-title" style="margin-bottom:0">${selLabel}</div>
              <button class="btn btn-primary btn-sm" onclick="novaConsultaModal('${selectedDate}', '')">
                <i class="ti ti-plus"></i> Nova marcação
              </button>
            </div>
            ${timelineHtml}
          </div>
        </div>
      </main>
    </div>
  `;
}

function selectDia(iso) {
  agendaState.selectedDate = iso;
  renderAgenda();
}

function agendaMes(delta) {
  agendaState.month += delta;
  if (agendaState.month < 0)  { agendaState.month = 11; agendaState.year--; }
  if (agendaState.month > 11) { agendaState.month = 0;  agendaState.year++; }
  renderAgenda();
}

async function novaConsultaModal(data, hora) {
  const pacientes = await SB.getPerfis();
  const tipos = await SB.getTipos();
  const tiposHtml = tipos.map(t => `<option value="${t.id}">${esc(t.label)}</option>`).join("");
  const pacHtml = pacientes.map(p => `<option value="${p.id}">${esc(p.nome)}</option>`).join("");

  showModal(`
    <div class="modal">
      <div class="modal-title">Nova marcação</div>
      <div class="form-group">
        <label class="form-label">Paciente</label>
        <select class="form-input" id="nm-pac">${pacHtml}</select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Data</label>
          <input class="form-input" type="date" id="nm-data" value="${data}">
        </div>
        <div class="form-group">
          <label class="form-label">Hora</label>
          <input class="form-input" type="time" id="nm-hora" value="${hora || '09:00'}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Tipo de consulta</label>
        <select class="form-input" id="nm-tipo">${tiposHtml}</select>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
        <button class="btn btn-primary" onclick="criarConsulta()">
          <i class="ti ti-calendar-plus"></i> Criar marcação
        </button>
      </div>
    </div>
  `);
}

async function criarConsulta() {
  const pacienteId = document.getElementById("nm-pac").value;
  const data = document.getElementById("nm-data").value;
  const hora = document.getElementById("nm-hora").value;
  const tipo = document.getElementById("nm-tipo").value;
  if (!data || !hora) { showToast("Preencha todos os campos", "error"); return; }
  const { error } = await SB.addConsulta({
    paciente_id: pacienteId,
    data,
    hora: hora + ":00",
    tipo_id: tipo,
    estado: "pendente",
  });
  if (error) { showToast("Erro ao criar marcação: " + error.message, "error"); return; }
  document.querySelector(".modal-overlay")?.remove();
  agendaState.selectedDate = data;
  showToast("Marcação criada com sucesso!", "success");
  renderAgenda();
}

// ─── CANCELAR ───
function cancelarConsultaConfirm(id) {
  window._cancelarId = id;
  const slot = document.querySelector(`[onclick*="cancelarConsultaConfirm('${id}')"]`);
  const nome = slot?.closest(".slot-block")?.querySelector(".slot-name")?.textContent || "este paciente";
  const hora = slot?.closest(".timeline-slot")?.querySelector(".slot-time")?.textContent || "";

  showModal(`
    <div class="modal">
      <div class="modal-title" style="color:var(--red-400)">
        <i class="ti ti-alert-triangle"></i> Cancelar consulta
      </div>
      <p style="margin-bottom:1rem;color:var(--text-2)">
        Tem a certeza que pretende cancelar a consulta de <strong>${esc(nome)}</strong>
        ${hora ? `às <strong>${hora}</strong>` : ""}?
      </p>
      <p style="font-size:13px;color:var(--text-3);margin-bottom:1.5rem">
        Esta ação não pode ser desfeita. O paciente será notificado por email.
      </p>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Voltar</button>
        <button class="btn btn-primary" style="background:var(--red-400);border-color:var(--red-400)"
          onclick="executarCancelar()">
          <i class="ti ti-x"></i> Confirmar cancelamento
        </button>
      </div>
    </div>
  `);
}

async function executarCancelar() {
  const id = window._cancelarId;
  const overlay = document.querySelector(".modal-overlay");
  const btn = overlay?.querySelector(".btn-primary");
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="ti ti-loader ti-spin"></i> A cancelar...'; }

  const { error } = await SB.cancelarConsulta(id);
  if (error) {
    showToast("Erro ao cancelar: " + error.message, "error");
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="ti ti-x"></i> Confirmar cancelamento'; }
    return;
  }

  overlay?.remove();
  showToast("Consulta cancelada.", "success");
  renderAgenda();
}

// ─── REAGENDAR ───
function reagendarConsultaModal(id, dataAtual, horaAtual) {
  window._reagendarId = id;
  window._reagendarDataAntiga = dataAtual;
  window._reagendarHoraAntiga = horaAtual;

  showModal(`
    <div class="modal">
      <div class="modal-title">
        <i class="ti ti-calendar-event"></i> Reagendar consulta
      </div>
      <p style="margin-bottom:1rem;color:var(--text-2);font-size:13px">
        Data/hora atual: <strong>${fmtData(dataAtual)} às ${horaAtual}</strong>
      </p>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Nova data</label>
          <input class="form-input" type="date" id="re-data" value="${dataAtual}" min="${getToday()}">
        </div>
        <div class="form-group">
          <label class="form-label">Nova hora</label>
          <input class="form-input" type="time" id="re-hora" value="${horaAtual}" step="1800">
        </div>
      </div>
      <p style="font-size:12px;color:var(--text-3);margin-top:0.25rem">
        O paciente será notificado por email com a nova data.
      </p>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
        <button class="btn btn-primary" onclick="executarReagendar()">
          <i class="ti ti-calendar-check"></i> Confirmar reagendamento
        </button>
      </div>
    </div>
  `);
}

async function executarReagendar() {
  const id = window._reagendarId;
  const dataAntiga = window._reagendarDataAntiga;
  const horaAntiga = window._reagendarHoraAntiga;
  const novaData = document.getElementById("re-data").value;
  const novaHora = document.getElementById("re-hora").value;

  if (!novaData || !novaHora) { showToast("Preencha data e hora", "error"); return; }
  if (novaData === dataAntiga && novaHora === horaAntiga) {
    showToast("A data/hora é igual à atual", "error"); return;
  }

  const horasOcupadas = await SB.getHorasOcupadas(novaData);
  if (horasOcupadas.includes(novaHora)) {
    showToast("Já existe uma consulta nesse horário", "error"); return;
  }

  const overlay = document.querySelector(".modal-overlay");
  const btn = overlay?.querySelector(".btn-primary");
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="ti ti-loader ti-spin"></i> A reagendar...'; }

  const { error } = await SB.updateConsulta(id, {
    data: novaData,
    hora: novaHora + ":00",
  });

  if (error) {
    showToast("Erro ao reagendar: " + error.message, "error");
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="ti ti-calendar-check"></i> Confirmar reagendamento'; }
    return;
  }

  overlay?.remove();
  showToast("Consulta reagendada para " + fmtData(novaData) + " às " + novaHora + "!", "success");
  agendaState.selectedDate = novaData;
  renderAgenda();
}