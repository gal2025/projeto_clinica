// ─── PORTAL DE MARCAÇÃO (PÚBLICO) ───
let portalState = {
  step: 1,
  tipo: "acompanhamento",
  data: "",
  hora: "",
  metodo: "mbway",
  nome: "",
  email: "",
  nif: "",
  confirmado: false,
};

Router.register("portal", () => {
  // Pre-fill if logged in as patient
  if (Auth.isPaciente()) {
    portalState.nome  = Auth.currentUser.nome;
    portalState.email = Auth.currentUser.email;
    portalState.nif   = Auth.currentUser.nif || "";
  }
  portalState.step = 1;
  renderPortal();
});

function renderPortal() {
  const s = portalState;
  document.getElementById("app").innerHTML = `
    ${Auth.currentUser ? "" : renderTopbar()}
    <div class="${Auth.currentUser ? 'app-shell' : ''}">
      ${Auth.currentUser ? renderSidebar("portal") : ""}
      <div class="${Auth.currentUser ? 'main-content' : 'portal-container'}">
        ${renderPortalSteps()}
        ${s.step === 1 ? renderStep1() : s.step === 2 ? renderStep2() : renderStep3()}
      </div>
    </div>
  `;
  bindPortalEvents();
}

function renderPortalSteps() {
  const steps = [
    { n:1, label:"Dados da consulta" },
    { n:2, label:"Pagamento" },
    { n:3, label:"Confirmação" },
  ];
  return `
    <div class="portal-steps">
      ${steps.map((st, i) => {
        const cls = st.n < portalState.step ? "done" : st.n === portalState.step ? "active" : "";
        const icon = st.n < portalState.step ? `<i class="ti ti-check" style="font-size:11px"></i>` : st.n;
        return `
          ${i > 0 ? `<div class="step-sep"></div>` : ""}
          <div class="portal-step ${cls}">
            <div class="step-num">${icon}</div>
            ${st.label}
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderStep1() {
  const s = portalState;
  const tiposHtml = DB.tiposConsulta.map(t =>
    `<option value="${t.id}" ${s.tipo === t.id ? "selected" : ""}>${t.label}</option>`
  ).join("");

  // Available dates: next 14 weekdays
  const dates = [];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (dates.length < 14) {
    const dow = d.getDay();
    if (dow >= 1 && dow <= 5) {
      dates.push(d.toISOString().split("T")[0]);
    }
    d.setDate(d.getDate() + 1);
  }

  // Available slots for selected date
  const allSlots = ["09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00"];
  const occupied = s.data
    ? DB.getConsultasDia(s.data).map(c => c.hora)
    : [];

  const slotsHtml = s.data
    ? `<div class="slots-grid">
        ${allSlots.map(h => {
          const avail = !occupied.includes(h);
          return `<button class="slot-btn ${!avail ? 'unavailable' : s.hora === h ? 'selected' : ''}"
            ${avail ? `onclick="selHora('${h}')"` : "disabled"}>
            ${h}
          </button>`;
        }).join("")}
      </div>`
    : `<div style="font-size:13px;color:var(--gray-400);padding:.75rem 0">Escolha primeiro uma data</div>`;

  const datesHtml = `<div style="display:flex;flex-wrap:wrap;gap:6px">
    ${dates.map(iso => {
      const [y,m,dd] = iso.split("-");
      const meses = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
      const diasS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
      const label = `${diasS[new Date(iso).getDay()]} ${parseInt(dd)} ${meses[parseInt(m)-1]}`;
      const booked = DB.getConsultasDia(iso).length >= allSlots.length;
      return `<button style="padding:6px 10px;border:1px solid var(--border-md);border-radius:var(--radius-sm);font-size:12px;font-weight:500;
        background:${s.data===iso ? 'var(--teal-400)' : 'var(--bg-card)'};
        color:${s.data===iso ? '#fff' : 'var(--gray-900)'};
        cursor:${booked ? 'not-allowed' : 'pointer'};opacity:${booked?'.3':'1'}"
        onclick="${booked ? '' : `selData('${iso}')`}">${label}</button>`;
    }).join("")}
  </div>`;

  return `
    <div class="two-col" style="align-items:start">
      <div class="card">
        <div style="font-size:16px;font-weight:500;margin-bottom:1.25rem">Marcar videoconsulta</div>
        <div class="form-group">
          <label class="form-label">Nome completo</label>
          <input class="form-input" id="p-nome" type="text" placeholder="O seu nome" value="${s.nome}">
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-input" id="p-email" type="email" placeholder="email@exemplo.pt" value="${s.email}">
        </div>
        <div class="form-group">
          <label class="form-label">NIF (para o recibo)</label>
          <input class="form-input" id="p-nif" type="text" placeholder="123 456 789" value="${s.nif}">
        </div>
        <div class="form-group">
          <label class="form-label">Tipo de consulta</label>
          <select class="form-input" id="p-tipo">${tiposHtml}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Data</label>
          ${datesHtml}
        </div>
        <div class="form-group">
          <label class="form-label">Horário</label>
          ${slotsHtml}
        </div>
        <button class="btn btn-primary btn-full mt-4" onclick="avancarStep2()">
          <i class="ti ti-arrow-right"></i> Continuar para pagamento
        </button>
      </div>
      <div>
        <div class="card" style="margin-bottom:1rem">
          <div class="card-title">Resumo</div>
          <div style="font-size:13px;display:flex;flex-direction:column;gap:8px">
            <div class="flex-between"><span class="text-muted">Médica</span><span class="font-medium">${DB.clinica.nome}</span></div>
            <div class="flex-between"><span class="text-muted">Tipo</span><span>${DB.getTipoConsulta(s.tipo)?.label || "—"}</span></div>
            <div class="flex-between"><span class="text-muted">Data</span><span>${s.data ? fmtData(s.data) : "—"}</span></div>
            <div class="flex-between"><span class="text-muted">Hora</span><span>${s.hora || "—"}</span></div>
            <div class="flex-between"><span class="text-muted">Formato</span><span><i class="ti ti-video" style="color:var(--blue-400);font-size:12px"></i> Videoconsulta</span></div>
            <div style="border-top:1px solid var(--border);padding-top:8px" class="flex-between">
              <span class="font-medium">Total</span>
              <span class="font-medium">${DB.clinica.preco},00€</span>
            </div>
          </div>
        </div>
        <div class="meet-notice">
          <i class="ti ti-brand-google"></i>
          <div>Após o pagamento, receberá um email com o <strong>link do Google Meet</strong> e o recibo da consulta.</div>
        </div>
      </div>
    </div>
  `;
}

function renderStep2() {
  const s = portalState;
  return `
    <div class="two-col" style="align-items:start">
      <div class="card">
        <div style="font-size:16px;font-weight:500;margin-bottom:1.25rem">Pagamento</div>
        <div style="font-size:11px;font-weight:500;color:var(--gray-400);text-transform:uppercase;letter-spacing:.04em;margin-bottom:.75rem">Método de pagamento</div>
        <div class="payment-option ${s.metodo === 'mbway' ? 'selected' : ''}" onclick="selMetodoPaciente('mbway')">
          <i class="ti ti-device-mobile" style="font-size:22px;color:var(--teal-400)"></i>
          <div>
            <div class="payment-option-name">MB Way</div>
            <div class="payment-option-desc">Pagamento imediato pelo telemóvel</div>
          </div>
          ${s.metodo === 'mbway' ? `<i class="ti ti-circle-check" style="margin-left:auto;color:var(--teal-400);font-size:18px"></i>` : ""}
        </div>
        <div class="payment-option ${s.metodo === 'cartao' ? 'selected' : ''}" onclick="selMetodoPaciente('cartao')">
          <i class="ti ti-credit-card" style="font-size:22px;color:var(--gray-400)"></i>
          <div>
            <div class="payment-option-name">Cartão de crédito / débito</div>
            <div class="payment-option-desc">Visa, Mastercard, American Express</div>
          </div>
          ${s.metodo === 'cartao' ? `<i class="ti ti-circle-check" style="margin-left:auto;color:var(--teal-400);font-size:18px"></i>` : ""}
        </div>
        <div style="background:var(--bg-subtle);border-radius:var(--radius-md);padding:.875rem 1rem;margin-top:.5rem;font-size:12px;color:var(--gray-400);display:flex;align-items:center;gap:8px">
          <i class="ti ti-shield-check" style="color:var(--teal-400);font-size:16px"></i>
          Pagamento processado em segurança via Stripe. Os seus dados bancários nunca são guardados.
        </div>
        <div style="display:flex;gap:8px;margin-top:1.25rem">
          <button class="btn btn-secondary" onclick="portalState.step=1;renderPortal()">
            <i class="ti ti-arrow-left"></i> Voltar
          </button>
          <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="processarPagamento()">
            <i class="ti ti-lock"></i> Pagar ${DB.clinica.preco},00€
          </button>
        </div>
      </div>
      <div class="card">
        <div class="card-title">Resumo da consulta</div>
        <div style="font-size:13px;display:flex;flex-direction:column;gap:8px">
          <div class="flex-between"><span class="text-muted">Paciente</span><span class="font-medium">${s.nome}</span></div>
          <div class="flex-between"><span class="text-muted">Email</span><span>${s.email}</span></div>
          <div class="flex-between"><span class="text-muted">NIF</span><span>${s.nif || "—"}</span></div>
          <div class="flex-between"><span class="text-muted">Tipo</span><span>${DB.getTipoConsulta(s.tipo)?.label}</span></div>
          <div class="flex-between"><span class="text-muted">Data</span><span>${fmtData(s.data)}</span></div>
          <div class="flex-between"><span class="text-muted">Hora</span><span>${s.hora}</span></div>
          <div style="border-top:1px solid var(--border);padding-top:8px" class="flex-between">
            <span class="font-medium">Total</span>
            <span class="font-medium">${DB.clinica.preco},00€</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderStep3() {
  const s = portalState;
  const meetLink = "https://meet.google.com/abc-demo-xyz";
  return `
    <div style="max-width:520px;margin:0 auto;text-align:center">
      <div style="width:64px;height:64px;border-radius:50%;background:var(--teal-50);display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem">
        <i class="ti ti-circle-check" style="font-size:30px;color:var(--teal-400)"></i>
      </div>
      <h2 style="font-family:'DM Serif Display',serif;font-size:26px;font-weight:400;margin-bottom:.5rem">Consulta marcada!</h2>
      <p style="font-size:14px;color:var(--gray-400);margin-bottom:2rem">
        O link do Google Meet e o recibo foram enviados para <strong>${s.email}</strong>
      </p>
      <div class="card" style="text-align:left;margin-bottom:1rem">
        <div class="card-title">Detalhes da consulta</div>
        <div style="font-size:13px;display:flex;flex-direction:column;gap:8px">
          <div class="flex-between"><span class="text-muted">Data</span><span class="font-medium">${fmtData(s.data)}</span></div>
          <div class="flex-between"><span class="text-muted">Hora</span><span class="font-medium">${s.hora}</span></div>
          <div class="flex-between"><span class="text-muted">Tipo</span><span>${DB.getTipoConsulta(s.tipo)?.label}</span></div>
          <div class="flex-between"><span class="text-muted">Método</span><span>${fmtMetodo(s.metodo)}</span></div>
          <div class="flex-between"><span class="text-muted">Valor pago</span><span class="font-medium">${DB.clinica.preco},00€</span></div>
        </div>
      </div>
      <div class="meet-notice" style="text-align:left;margin-bottom:1.5rem">
        <i class="ti ti-brand-google"></i>
        <div>
          <div style="font-weight:500;margin-bottom:3px">Link do Google Meet</div>
          <a href="${meetLink}" target="_blank" style="color:var(--blue-400);font-size:12px">${meetLink}</a>
          <div style="font-size:11px;margin-top:2px;opacity:.7">O link foi enviado para o seu email. Guarde-o para entrar na consulta.</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:center">
        <button class="btn btn-secondary" onclick="Router.go('paciente-area')">
          <i class="ti ti-user"></i> Área do paciente
        </button>
        <button class="btn btn-primary" onclick="portalState.step=1;renderPortal()">
          <i class="ti ti-calendar-plus"></i> Marcar outra consulta
        </button>
      </div>
    </div>
  `;
}

function bindPortalEvents() {}

function selData(iso) {
  portalState.data = iso;
  portalState.hora = "";
  renderPortal();
}

function selHora(h) {
  portalState.hora = h;
  document.querySelectorAll(".slot-btn").forEach(b => b.classList.remove("selected"));
  event.target.classList.add("selected");
  // Update summary
  renderPortal();
}

function selMetodoPaciente(m) {
  portalState.metodo = m;
  renderPortal();
}

function avancarStep2() {
  const nome  = document.getElementById("p-nome")?.value.trim();
  const email = document.getElementById("p-email")?.value.trim();
  const nif   = document.getElementById("p-nif")?.value.trim();
  const tipo  = document.getElementById("p-tipo")?.value;

  if (!nome || !email) { showToast("Preencha o nome e email", "error"); return; }
  if (!portalState.data) { showToast("Escolha uma data", "error"); return; }
  if (!portalState.hora) { showToast("Escolha um horário", "error"); return; }

  portalState.nome  = nome;
  portalState.email = email;
  portalState.nif   = nif;
  portalState.tipo  = tipo;
  portalState.step  = 2;
  renderPortal();
}

function processarPagamento() {
  // Simula pagamento (em produção: Stripe checkout)
  const s = portalState;
  let pacienteId = Auth.currentUser?.id || null;
  if (!pacienteId) {
    // Mock: usar primeiro paciente ou criar
    pacienteId = DB.utilizadores.find(u => u.email === s.email)?.id || "u-p1";
  }
  const consultaId = DB.addConsulta({
    pacienteId, data: s.data, hora: s.hora, tipo: s.tipo,
    estado: "pendente", pagamentoId: null, meetLink: null, notas: "",
  });
  DB.confirmarPagamento(consultaId, s.metodo);
  portalState.step = 3;
  showToast("Pagamento processado com sucesso!");
  renderPortal();
}
