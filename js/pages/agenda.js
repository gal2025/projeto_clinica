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

function renderAgenda() {
  const { year, month, selectedDate } = agendaState;
  const anoMes = `${year}-${String(month + 1).padStart(2, "0")}`;
  const diasComConsultas = DB.getDiasComConsultas(anoMes);
  const consultasDia = DB.getConsultasDia(selectedDate);

  // Mini calendar
  const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const adjustedFirst = (firstDay === 0) ? 6 : firstDay - 1; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const today = getToday();

  let calCells = "";
  // prev month
  for (let i = adjustedFirst - 1; i >= 0; i--) {
    calCells += `<div class="cal-day other-month">${prevDays - i}</div>`;
  }
  // this month
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const isToday = iso === today;
    const isSel = iso === selectedDate;
    const hasAppt = diasComConsultas.includes(d);
    const cls = [
      "cal-day",
      isToday ? "today" : "",
      isSel && !isToday ? "selected" : "",
      hasAppt ? "has-appt" : "",
    ].filter(Boolean).join(" ");
    calCells += `<div class="${cls}" onclick="selectDia('${iso}')">${d}</div>`;
  }
  // next month
  const totalCells = Math.ceil((adjustedFirst + daysInMonth) / 7) * 7;
  for (let d = 1; d <= totalCells - adjustedFirst - daysInMonth; d++) {
    calCells += `<div class="cal-day other-month">${d}</div>`;
  }

  // Timeline
  const horarios = ["09:00","10:00","11:00","11:30","12:30","14:00","15:00","16:00","16:30","17:30"];
  const horariosSlots = Array.from(new Set([
    "09:00","10:00","11:00","11:30","12:00","12:30","13:00","14:00","15:00","16:00","16:30","17:00","17:30"
  ]));

  const consultasMap = {};
  consultasDia.forEach(c => { consultasMap[c.hora] = c; });

  const timelineHtml = horariosSlots.map(hora => {
    const c = consultasMap[hora];
    if (c) {
      const pac = DB.getPaciente(c.pacienteId);
      const tipo = DB.getTipoConsulta(c.tipo);
      return `
        <div class="timeline-slot">
          <span class="slot-time">${hora}</span>
          <div class="slot-block ${c.estado === 'pendente' ? 'slot-pending' : 'slot-filled'}">
            <div>
              <div class="slot-name">${pac.nome}</div>
              <div class="slot-detail">${tipo?.label} · ${fmtEstado(c.estado)}</div>
            </div>
            ${c.meetLink
              ? `<a href="${c.meetLink}" target="_blank" class="btn btn-meet btn-sm"><i class="ti ti-video"></i> Entrar</a>`
              : c.estado === "pendente"
                ? `<button class="btn btn-secondary btn-sm" onclick="confirmarPagamentoModal('${c.id}')"><i class="ti ti-check"></i> Confirmar pag.</button>`
                : ""
            }
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

function novaConsultaModal(data, hora) {
  const pacientes = DB.utilizadores.filter(u => u.role === "paciente");
  const tiposHtml = DB.tiposConsulta.map(t =>
    `<option value="${t.id}">${t.label}</option>`).join("");
  const pacHtml = pacientes.map(p =>
    `<option value="${p.id}">${p.nome}</option>`).join("");

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

function criarConsulta() {
  const pacienteId = document.getElementById("nm-pac").value;
  const data = document.getElementById("nm-data").value;
  const hora = document.getElementById("nm-hora").value;
  const tipo = document.getElementById("nm-tipo").value;
  if (!data || !hora) { showToast("Preencha todos os campos", "error"); return; }
  DB.addConsulta({ pacienteId, data, hora, tipo, estado: "pendente", pagamentoId: null, meetLink: null, notas: "" });
  document.querySelector(".modal-overlay")?.remove();
  agendaState.selectedDate = data;
  showToast("Marcação criada com sucesso!", "success");
  renderAgenda();
}
