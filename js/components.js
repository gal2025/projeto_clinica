// ─── SANITIZAÇÃO XSS ───
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
// ─── SHARED COMPONENTS ───

function renderSidebar(activePage) {
  const user = Auth.currentPerfil;
  if (!user) return "";
  const isMedica = user.role === "medica";

  // Iniciais a partir do nome
  const iniciais = (user.nome || "?").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  const navItems = isMedica ? [
    { id: "dashboard",  icon: "ti-layout-dashboard", label: "Dashboard" },
    { id: "agenda",     icon: "ti-calendar",         label: "Agenda" },
    { id: "pacientes",  icon: "ti-users",            label: "Pacientes" },
    { id: "pagamentos", icon: "ti-receipt",          label: "Pagamentos" },
  ] : [
    { id: "paciente-area", icon: "ti-home",          label: "Inicio" },
    { id: "portal",        icon: "ti-calendar-plus", label: "Marcar consulta" },
  ];

  const navHtml = navItems.map(item => `
    <button class="nav-item ${activePage === item.id ? 'active' : ''}" onclick="Router.go('${item.id}')">
      <i class="ti ${item.icon}" aria-hidden="true"></i>
      ${item.label}
    </button>
  `).join("");

  return `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo-mark"><i class="ti ti-brain" aria-hidden="true"></i></div>
        <div>
          <div class="sidebar-logo-name">${DB.clinica.nome.replace("Dra. ","Dra.\u00a0")}</div>
          <div class="sidebar-logo-sub">${DB.clinica.especialidade}</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        ${navHtml}
      </nav>
      <div class="nav-divider"></div>
      <div class="sidebar-user">
        <div class="avatar-circle ${isMedica ? '' : 'patient'}">${esc(iniciais)}</div>
        <div>
          <div class="sidebar-user-name">${esc(user.nome)}</div>
          <div class="sidebar-user-role">${isMedica ? 'Medica' : 'Paciente'}</div>
        </div>
      </div>
      <button class="nav-item mt-2" onclick="Auth.logout()" style="color:var(--red-400)">
        <i class="ti ti-logout" aria-hidden="true"></i>
        Sair
      </button>
    </aside>
  `;
}

function renderTopbar(showLogin = true) {
  return `
    <header class="topbar">
      <div class="topbar-logo" onclick="Router.go('landing')" style="cursor:pointer">
        <div class="topbar-logo-mark"><i class="ti ti-brain" aria-hidden="true"></i></div>
        <div>
          <div class="topbar-name">${esc(DB.clinica.nome)}</div>
        </div>
      </div>
      <div class="topbar-actions">
        ${Auth.currentPerfil
          ? `<button class="btn btn-secondary btn-sm" onclick="Router.go(Auth.isMedica() ? 'dashboard' : 'paciente-area')">
               <i class="ti ti-layout-dashboard"></i> Painel
             </button>`
          : showLogin
            ? `<button class="btn btn-ghost btn-sm" onclick="Router.go('login')">Entrar</button>
               <button class="btn btn-primary btn-sm" onclick="Router.go('portal')">
                 <i class="ti ti-calendar-plus"></i> Marcar consulta
               </button>`
            : ""
        }
      </div>
    </header>
  `;
}

function showToast(msg, type = "success") {
  const icons = { success: "ti-check", error: "ti-x", info: "ti-info-circle" };
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  const icon = document.createElement('i');
icon.className = `ti ${icons[type] || 'ti-check'}`;
icon.setAttribute('aria-hidden', 'true');
t.appendChild(icon);
;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function renderRecibo(consultaId) {
  const consulta = DB.consultas?.find(c => c.id === consultaId);
  if (!consulta || !consulta.pagamentoId) return "<p>Recibo nao disponivel</p>";
  const paciente = DB.getPaciente(consulta.pacienteId);
  const pagamento = DB.getPagamento(consulta.pagamentoId);
  const tipo = DB.getTipoConsulta(consulta.tipo);

  return `
    <div class="receipt">
      <div class="receipt-header">
        <div>
          <div class="flex-center gap-3 mb-4">
            <div class="sidebar-logo-mark" style="width:30px;height:30px;border-radius:8px"><i class="ti ti-brain" style="color:#fff;font-size:14px"></i></div>
            <div>
              <div class="font-medium" style="font-size:13px">${DB.clinica.nome}</div>
              <div class="text-sm text-muted">${DB.clinica.especialidade}</div>
            </div>
          </div>
          <div class="text-sm text-muted">NIF ${DB.clinica.nif}</div>
        </div>
        <div style="text-align:right">
          <div class="font-medium" style="font-size:13px">Recibo no ${pagamento.reciboNum}</div>
          <div class="text-sm text-muted">${fmtData(pagamento.data)}</div>
        </div>
      </div>
      <div style="margin-bottom:1rem">
        <div class="text-sm text-muted" style="text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">Paciente</div>
        <div class="font-medium">${esc(paciente.nome)}</div>
        <div class="text-sm text-muted">NIF: ${esc(paciente.nif)}</div>
      </div>
      <div style="margin-bottom:.875rem">
        <div class="text-sm text-muted" style="text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">Servico</div>
        <div class="receipt-row">
          <span>Videoconsulta - ${tipo?.label || consulta.tipo} (${DB.clinica.duracao} min)</span>
          <span>${pagamento.valor},00EUR</span>
        </div>
      </div>
      <div class="receipt-total">
        <span>Total pago</span>
        <span>${pagamento.valor},00EUR</span>
      </div>
      <div class="receipt-paid">
        Pago via ${fmtMetodo(pagamento.metodo)} - ${fmtData(pagamento.data)}
      </div>
    </div>
  `;
}

function showModal(html, onClose) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = html;
  overlay.addEventListener("click", e => {
    if (e.target === overlay) { overlay.remove(); if (onClose) onClose(); }
  });
  document.body.appendChild(overlay);
  return overlay;
}
