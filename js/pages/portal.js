// PORTAL DE MARCACAO (com Stripe)
let portalState = {
  step: 1,
  tipo: "acompanhamento",
  data: "",
  hora: "",
  nome: "",
  email: "",
  nif: "",
  consultaId: null,
  clientSecret: null,
  stripeElements: null,
};

Router.register("portal", () => {
  if (Auth.isPaciente()) {
    portalState.nome  = Auth.currentPerfil.nome || "";
    portalState.email = Auth.currentPerfil.email || "";
    portalState.nif   = Auth.currentPerfil.nif || "";
  }
  portalState.step = 1;
  portalState.consultaId = null;
  portalState.clientSecret = null;
  renderPortal();
});

function renderPortal() {
  const s = portalState;
  const isSidebar = !!Auth.currentPerfil;

  document.getElementById("app").innerHTML =
    (isSidebar ? '<div class="app-shell">' + renderSidebar("portal") + '<div class="main-content">' : renderTopbar()) +
    '<div style="max-width:900px;margin:0 auto;padding:' + (isSidebar ? "0" : "2rem") + '">' +
    renderPortalSteps() +
    (s.step === 1 ? renderStep1() : s.step === 2 ? renderStep2() : renderStep3()) +
    '</div>' +
    (isSidebar ? '</div></div>' : '');

  if (s.step === 2 && s.clientSecret) {
    initStripeElements();
  }
}

function renderPortalSteps() {
  const steps = [
    {n:1, label:"Dados da consulta"},
    {n:2, label:"Pagamento"},
    {n:3, label:"Confirmacao"},
  ];
  let html = '<div class="portal-steps">';
  steps.forEach((st, i) => {
    const cls = st.n < portalState.step ? "done" : st.n === portalState.step ? "active" : "";
    const icon = st.n < portalState.step ? '<i class="ti ti-check" style="font-size:11px"></i>' : st.n;
    if (i > 0) html += '<div class="step-sep"></div>';
    html += '<div class="portal-step ' + cls + '"><div class="step-num">' + icon + '</div>' + st.label + '</div>';
  });
  return html + '</div>';
}

function renderStep1() {
  const s = portalState;
  const tipos = DB.tiposConsulta.map(t =>
    '<option value="' + t.id + '"' + (s.tipo === t.id ? " selected" : "") + '>' + t.label + '</option>'
  ).join("");

  const dates = [];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (dates.length < 14) {
    const dow = d.getDay();
    if (dow >= 1 && dow <= 5) dates.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }

  const meses = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
  const diasS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sab"];
  let datesHtml = '<div style="display:flex;flex-wrap:wrap;gap:6px">';
  dates.forEach(iso => {
    const [y,m,dd] = iso.split("-");
    const label = diasS[new Date(iso).getDay()] + " " + parseInt(dd) + " " + meses[parseInt(m)-1];
    const sel = s.data === iso;
    datesHtml += '<button style="padding:6px 10px;border:1px solid ' + (sel ? "var(--teal-400)" : "var(--border-md)") + ';border-radius:var(--radius-sm);font-size:12px;font-weight:500;background:' + (sel ? "var(--teal-400)" : "var(--bg-card)") + ';color:' + (sel ? "#fff" : "var(--gray-900)") + ';cursor:pointer" onclick="selData(\'' + iso + '\')">' + label + '</button>';
  });
  datesHtml += '</div>';

  const allSlots = ["09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00"];
  let slotsHtml = '<div class="slots-grid">';
  allSlots.forEach(h => {
    const sel = s.hora === h;
    slotsHtml += '<button class="slot-btn' + (sel ? " selected" : "") + '" onclick="selHora(\'' + h + '\')">' + h + '</button>';
  });
  slotsHtml += '</div>';

  return '<div class="two-col" style="align-items:start">' +
    '<div class="card">' +
    '<div style="font-size:16px;font-weight:500;margin-bottom:1.25rem">Marcar videoconsulta</div>' +
    '<div class="form-group"><label class="form-label">Nome completo</label><input class="form-input" id="p-nome" type="text" value="' + s.nome + '" placeholder="O seu nome"></div>' +
    '<div class="form-group"><label class="form-label">Email</label><input class="form-input" id="p-email" type="email" value="' + s.email + '" placeholder="email@exemplo.pt"></div>' +
    '<div class="form-group"><label class="form-label">NIF (para o recibo)</label><input class="form-input" id="p-nif" type="text" value="' + s.nif + '" placeholder="123 456 789"></div>' +
    '<div class="form-group"><label class="form-label">Tipo de consulta</label><select class="form-input" id="p-tipo">' + tipos + '</select></div>' +
    '<div class="form-group"><label class="form-label">Data</label>' + datesHtml + '</div>' +
    '<div class="form-group"><label class="form-label">Horario disponivel</label>' + slotsHtml + '</div>' +
    '<button class="btn btn-primary btn-full mt-4" onclick="avancarStep2()"><i class="ti ti-arrow-right"></i> Continuar para pagamento</button>' +
    '</div>' +
    '<div>' +
    '<div class="card" style="margin-bottom:1rem"><div class="card-title">Resumo</div>' +
    '<div style="font-size:13px;display:flex;flex-direction:column;gap:8px">' +
    '<div class="flex-between"><span class="text-muted">Tipo</span><span>' + (DB.getTipoConsulta(s.tipo)?.label || "-") + '</span></div>' +
    '<div class="flex-between"><span class="text-muted">Data</span><span>' + (s.data ? fmtData(s.data) : "-") + '</span></div>' +
    '<div class="flex-between"><span class="text-muted">Hora</span><span>' + (s.hora || "-") + '</span></div>' +
    '<div class="flex-between"><span class="text-muted">Formato</span><span><i class="ti ti-video" style="color:var(--blue-400);font-size:12px"></i> Videoconsulta</span></div>' +
    '<div style="border-top:1px solid var(--border);padding-top:8px" class="flex-between"><span class="font-medium">Total</span><span class="font-medium">' + DB.clinica.preco + ',00&euro;</span></div>' +
    '</div></div>' +
    '<div class="meet-notice"><i class="ti ti-brand-google"></i><div>Apos o pagamento, recebera um email com o <strong>link do Google Meet</strong> e o recibo.</div></div>' +
    '</div></div>';
}

function renderStep2() {
  return '<div class="two-col" style="align-items:start">' +
    '<div class="card">' +
    '<div style="font-size:16px;font-weight:500;margin-bottom:1.25rem">Pagamento seguro</div>' +
    '<div id="stripe-element" style="padding:12px;border:1px solid var(--border-md);border-radius:var(--radius-md);min-height:44px;background:var(--bg-card)"></div>' +
    '<div id="stripe-error" style="color:var(--red-400);font-size:12px;margin-top:8px;display:none"></div>' +
    '<div style="background:var(--bg-subtle);border-radius:var(--radius-md);padding:.875rem 1rem;margin-top:1rem;font-size:12px;color:var(--gray-400);display:flex;align-items:center;gap:8px">' +
    '<i class="ti ti-shield-check" style="color:var(--teal-400);font-size:16px"></i>' +
    'Pagamento processado em segurança via Stripe. Os seus dados bancarios nunca sao guardados.' +
    '</div>' +
    '<div style="display:flex;gap:8px;margin-top:1.25rem">' +
    '<button class="btn btn-secondary" onclick="portalState.step=1;renderPortal()"><i class="ti ti-arrow-left"></i> Voltar</button>' +
    '<button id="btn-pagar" class="btn btn-primary" style="flex:1;justify-content:center" onclick="processarPagamento()"><i class="ti ti-lock"></i> Pagar ' + DB.clinica.preco + ',00&euro;</button>' +
    '</div></div>' +
    '<div class="card"><div class="card-title">Resumo</div>' +
    '<div style="font-size:13px;display:flex;flex-direction:column;gap:8px">' +
    '<div class="flex-between"><span class="text-muted">Paciente</span><span class="font-medium">' + portalState.nome + '</span></div>' +
    '<div class="flex-between"><span class="text-muted">Tipo</span><span>' + (DB.getTipoConsulta(portalState.tipo)?.label || "-") + '</span></div>' +
    '<div class="flex-between"><span class="text-muted">Data</span><span>' + fmtData(portalState.data) + '</span></div>' +
    '<div class="flex-between"><span class="text-muted">Hora</span><span>' + portalState.hora + '</span></div>' +
    '<div style="border-top:1px solid var(--border);padding-top:8px" class="flex-between"><span class="font-medium">Total</span><span class="font-medium">' + DB.clinica.preco + ',00&euro;</span></div>' +
    '</div></div></div>';
}

function renderStep3() {
  const meetLink = "https://meet.google.com/test-demo-link";
  return '<div style="max-width:520px;margin:0 auto;text-align:center">' +
    '<div style="width:64px;height:64px;border-radius:50%;background:var(--teal-50);display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem">' +
    '<i class="ti ti-circle-check" style="font-size:30px;color:var(--teal-400)"></i></div>' +
    '<h2 style="font-family:\'DM Serif Display\',serif;font-size:26px;font-weight:400;margin-bottom:.5rem">Consulta marcada!</h2>' +
    '<p style="font-size:14px;color:var(--gray-400);margin-bottom:2rem">O link do Google Meet e o recibo foram enviados para <strong>' + portalState.email + '</strong></p>' +
    '<div class="card" style="text-align:left;margin-bottom:1rem"><div class="card-title">Detalhes</div>' +
    '<div style="font-size:13px;display:flex;flex-direction:column;gap:8px">' +
    '<div class="flex-between"><span class="text-muted">Data</span><span class="font-medium">' + fmtData(portalState.data) + '</span></div>' +
    '<div class="flex-between"><span class="text-muted">Hora</span><span class="font-medium">' + portalState.hora + '</span></div>' +
    '<div class="flex-between"><span class="text-muted">Tipo</span><span>' + (DB.getTipoConsulta(portalState.tipo)?.label || "-") + '</span></div>' +
    '<div class="flex-between"><span class="text-muted">Valor pago</span><span class="font-medium">' + DB.clinica.preco + ',00&euro;</span></div>' +
    '</div></div>' +
    '<div class="meet-notice" style="text-align:left;margin-bottom:1.5rem">' +
    '<i class="ti ti-brand-google"></i>' +
    '<div><div style="font-weight:500;margin-bottom:3px">Link do Google Meet</div>' +
    '<a href="' + meetLink + '" target="_blank" style="color:var(--blue-400);font-size:12px">' + meetLink + '</a></div></div>' +
    '<div style="display:flex;gap:8px;justify-content:center">' +
    '<button class="btn btn-secondary" onclick="Router.go(\'paciente-area\')"><i class="ti ti-user"></i> Area do paciente</button>' +
    '<button class="btn btn-primary" onclick="portalState.step=1;renderPortal()"><i class="ti ti-calendar-plus"></i> Marcar outra consulta</button>' +
    '</div></div>';
}

function selData(iso) { portalState.data = iso; renderPortal(); }
function selHora(h)   { portalState.hora = h; renderPortal(); }

async function avancarStep2() {
  const nome  = document.getElementById("p-nome")?.value.trim();
  const email = document.getElementById("p-email")?.value.trim();
  const nif   = document.getElementById("p-nif")?.value.trim();
  const tipo  = document.getElementById("p-tipo")?.value;

  if (!nome || !email) { showToast("Preencha o nome e email", "error"); return; }
  if (!portalState.data) { showToast("Escolha uma data", "error"); return; }
  if (!portalState.hora) { showToast("Escolha um horario", "error"); return; }

  portalState.nome  = nome;
  portalState.email = email;
  portalState.nif   = nif;
  portalState.tipo  = tipo;

  // Criar consulta pendente no Supabase
  const pacienteId = Auth.currentPerfil?.id;
  if (!pacienteId) { showToast("Faca login para marcar consulta", "error"); Router.go("login"); return; }

  const { data: consulta, error } = await SB.addConsulta({
    paciente_id: pacienteId,
    tipo, data: portalState.data,
    hora: portalState.hora + ":00",
    estado: "pendente",
  });
  if (error) { showToast("Erro ao criar marcacao: " + error.message, "error"); return; }
  portalState.consultaId = consulta.id;

  // Criar Payment Intent no Stripe
  try {
    const clientSecret = await criarPaymentIntent(
      DB.clinica.preco, consulta.id, nome, email
    );
    portalState.clientSecret = clientSecret;
    portalState.step = 2;
    renderPortal();
  } catch (err) {
    showToast("Erro no pagamento: " + err.message, "error");
  }
}

function initStripeElements() {
  const stripe = getStripe();
  const elements = stripe.elements({ clientSecret: portalState.clientSecret });
  const paymentElement = elements.create("payment");
  paymentElement.mount("#stripe-element");
  portalState.stripeElements = elements;
}

async function processarPagamento() {
  const btn = document.getElementById("btn-pagar");
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader-2" style="animation:spin 1s linear infinite"></i> A processar...';

  const stripe = getStripe();
  const { error } = await stripe.confirmPayment({
    elements: portalState.stripeElements,
    confirmParams: { return_url: window.location.href },
    redirect: "if_required",
  });

  if (error) {
    document.getElementById("stripe-error").style.display = "block";
    document.getElementById("stripe-error").textContent = error.message;
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-lock"></i> Pagar ' + DB.clinica.preco + ',00EUR';
    return;
  }

  // Confirmar consulta no Supabase
  await SB.confirmarPagamento(portalState.consultaId, "cartao");
  portalState.step = 3;
  showToast("Pagamento confirmado!");
  renderPortal();
}
