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
        return `<div class="appt-item">
          <div style="min-width:90px">
            <div class="font-medium" style="font-size:13px">${fmtData(c.data)}</div>
            <div class="text-sm text-muted">${c.hora?.substring(0,5)}</div>
          </div>
          <div class="appt-info">
            <div class="appt-name">${tipo?.label || c.tipo}</div>
            <div class="appt-type"><i class="ti ti-video" style="font-size:11px;color:var(--blue-400)"></i> Videoconsulta</div>
          </div>
          <div class="appt-actions">
            ${badgeEstado(c.estado)}
            ${c.meet_link
              ? `<a href="${c.meet_link}" target="_blank" class="btn btn-meet btn-sm"><i class="ti ti-video"></i> Entrar</a>`
              : `<span class="text-sm text-muted">Link em breve</span>`
            }
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
            <div class="appt-name">${tipo?.label || c.tipo}</div>
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
              <div class="page-title">Ola, ${primeiroNome}!</div>
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

