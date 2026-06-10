// ─── DASHBOARD (MÉDICA) — Supabase ───
Router.register("dashboard", async () => {
  if (!Auth.requireAuth("medica")) return;

  document.getElementById("app").innerHTML = `
    <div class="app-shell">
      ${renderSidebar("dashboard")}
      <main class="main-content">
        <div style="display:flex;align-items:center;justify-content:center;height:60vh;flex-direction:column;gap:12px">
          <i class="ti ti-loader-2" style="font-size:28px;color:var(--teal-400);animation:spin 1s linear infinite"></i>
          <div style="font-size:13px;color:var(--gray-400)">A carregar dados...</div>
        </div>
      </main>
    </div>
  `;

  const today = getToday();
  const anoMes = today.substring(0, 7);

  const [consultasHoje, pendentes, consultasMes, pacientes] = await Promise.all([
    SB.getConsultasDia(today),
    SB.getConsultasPendentes(),
    SB.getConsultasMes(anoMes),
    SB.getPerfis(),
  ]);

  // Separar: marcações a aprovar (sem pagamento) vs pagamentos pendentes (com pagamento)
  const aAprovar = pendentes.filter(c => !c.pagamentos || c.pagamentos.length === 0);
  const pagPendentes = pendentes.filter(c => c.pagamentos && c.pagamentos.length > 0);

  const pagas = consultasMes.filter(c => c.pagamentos?.length > 0);
  const receita = pagas.reduce((s, c) => {
    const pago = c.pagamentos?.find(p => p.estado === 'pago');
    return s + (pago ? parseFloat(pago.valor) : 0);
  }, 0);

  const apptHtml = consultasHoje.length
    ? consultasHoje.map(c => {
        const pac = c.perfis;
        const tipo = c.tipos_consulta;
        const isPending = c.estado === 'pendente';
        const iniciais = pac?.nome?.split(' ').map(n => n[0]).slice(0,2).join('') || '??';
        return `
          <div class="appt-item ${isPending ? 'pending' : ''}">
            <span class="appt-time">${c.hora?.substring(0,5)}</span>
            <div class="avatar-circle" style="font-size:11px">${esc(iniciais)}</div>
            <div class="appt-info">
              <div class="appt-name">${esc(pac?.nome || '—')}</div>
              <div class="appt-type">${esc(tipo?.label || '')} · ${DB.clinica.duracao} min</div>
            </div>
            <div class="appt-actions">
              ${badgeEstado(c.estado)}
              ${c.meet_link
                ? `<a href="${c.meet_link}" target="_blank" class="btn btn-meet btn-sm"><i class="ti ti-video"></i> Entrar</a>`
                : isPending
                  ? `<button class="btn btn-secondary btn-sm" onclick="confirmarPagamentoModal('${c.id}')"><i class="ti ti-check"></i> Confirmar pag.</button>`
                  : ''
              }
            </div>
          </div>`;
      }).join('')
    : `<div class="empty-state"><i class="ti ti-calendar-off"></i><p>Sem consultas para hoje</p></div>`;

  // Marcações a aprovar
  const aAprovarHtml = aAprovar.length
    ? aAprovar.map(c => {
        const pac = c.perfis;
        const tipo = c.tipos_consulta;
        const iniciais = pac?.nome?.split(' ').map(n => n[0]).slice(0,2).join('') || '??';
        return `
          <div class="appt-item pending">
            <span class="appt-time" style="min-width:72px">${fmtData(c.data)}</span>
            <div class="avatar-circle" style="font-size:11px;background:var(--blue-50);color:var(--blue-800)">${esc(iniciais)}</div>
            <div class="appt-info">
              <div class="appt-name">${esc(pac?.nome || '—')}</div>
              <div class="appt-type">${esc(tipo?.label || '')} · ${c.hora?.substring(0,5)}</div>
            </div>
            <div style="display:flex;gap:6px">
              <button class="btn btn-primary btn-sm" onclick="aprovarMarcacao('${c.id}')">
                <i class="ti ti-check"></i> Aprovar
              </button>
              <button class="btn btn-secondary btn-sm" style="color:var(--red-400)" onclick="rejeitarMarcacaoModal('${c.id}')">
                <i class="ti ti-x"></i> Rejeitar
              </button>
            </div>
          </div>`;
      }).join('')
    : `<div class="empty-state" style="padding:.75rem 0"><i class="ti ti-circle-check"></i><p>Sem marcações por aprovar</p></div>`;

  // Pagamentos pendentes
  const pagPendentesHtml = pagPendentes.length
    ? pagPendentes.map(c => {
        const pac = c.perfis;
        const tipo = c.tipos_consulta;
        const iniciais = pac?.nome?.split(' ').map(n => n[0]).slice(0,2).join('') || '??';
        return `
          <div class="appt-item pending">
            <span class="appt-time">${fmtData(c.data)}</span>
            <div class="avatar-circle" style="font-size:11px;background:var(--amber-50);color:var(--amber-800)">${esc(iniciais)}</div>
            <div class="appt-info">
              <div class="appt-name">${esc(pac?.nome || '—')}</div>
              <div class="appt-type">${esc(tipo?.label || '')} · ${c.hora?.substring(0,5)}</div>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="confirmarPagamentoModal('${c.id}')">
              <i class="ti ti-check"></i> Confirmar
            </button>
          </div>`;
      }).join('')
    : `<div class="empty-state" style="padding:.75rem 0"><i class="ti ti-circle-check"></i><p>Sem pagamentos pendentes</p></div>`;

  const totalAcoes = aAprovar.length + pagPendentes.length;

  document.getElementById("app").innerHTML = `
    <div class="app-shell">
      ${renderSidebar("dashboard")}
      <main class="main-content">
        <div class="page-header">
          <div class="page-header-row">
            <div>
              <div class="page-title">Bom dia, ${esc(Auth.currentPerfil?.nome?.split(' ').slice(-1)[0] || '')} 👋</div>
              <div class="page-sub">${getTodayLabel()}</div>
            </div>
            <button class="btn btn-primary" onclick="Router.go('agenda')">
              <i class="ti ti-calendar"></i> Ver agenda completa
            </button>
          </div>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label"><i class="ti ti-video"></i> Videoconsultas hoje</div>
            <div class="stat-value">${consultasHoje.length}</div>
            <div class="stat-sub">${consultasHoje.find(c => c.estado === 'confirmada')?.hora?.substring(0,5) ? `Próxima: ${consultasHoje.find(c => c.estado === 'confirmada').hora.substring(0,5)}` : '—'}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label"><i class="ti ti-clock"></i> Ações pendentes</div>
            <div class="stat-value">${totalAcoes}</div>
            <div class="stat-sub">${totalAcoes > 0 ? 'Requer atenção' : 'Tudo em dia'}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label"><i class="ti ti-users"></i> Pacientes</div>
            <div class="stat-value">${pacientes.length}</div>
            <div class="stat-sub">Total registados</div>
          </div>
          <div class="stat-card">
            <div class="stat-label"><i class="ti ti-coin-euro"></i> Receita este mês</div>
            <div class="stat-value">${receita.toLocaleString('pt-PT')}€</div>
            <div class="stat-sub">${pagas.length} consultas faturadas</div>
          </div>
        </div>
        <div class="two-col">
          <div class="card">
            <div class="card-title">Agenda de hoje</div>
            ${apptHtml}
          </div>
          <div class="card">
            ${aAprovar.length > 0 ? `
            <div class="card-header" style="margin-bottom:.75rem">
              <div class="card-title" style="margin-bottom:0">Marcações a aprovar</div>
              <span class="badge badge-blue">${aAprovar.length}</span>
            </div>
            ${aAprovarHtml}
            <div style="border-top:1px solid var(--border);margin:.75rem 0"></div>` : ''}
            <div class="card-header">
              <div class="card-title" style="margin-bottom:0">Pagamentos pendentes</div>
              ${pagPendentes.length > 0 ? `<span class="badge badge-amber">${pagPendentes.length}</span>` : ''}
            </div>
            ${pagPendentesHtml}
            <div style="margin-top:1.25rem">
              <div class="card-title">Como entrar nas consultas</div>
              <div class="meet-notice">
                <i class="ti ti-brand-google"></i>
                <div>Clique em <strong>"Entrar"</strong> ao lado de cada consulta confirmada para abrir o Google Meet. O paciente recebe o mesmo link por email após o pagamento.</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;
});

// ─── APROVAR MARCAÇÃO ───
async function aprovarMarcacao(consultaId) {
  const { error } = await SB.updateConsulta(consultaId, { estado: 'pendente' });
  if (error) { showToast("Erro ao aprovar: " + error.message, "error"); return; }
  showToast("Marcação aprovada! Aguarda pagamento do paciente.", "success");
  Router.go("dashboard");
}

// ─── REJEITAR MARCAÇÃO ───
function rejeitarMarcacaoModal(consultaId) {
  window._rejeitarId = consultaId;
  showModal(`
    <div class="modal">
      <div class="modal-title" style="color:var(--red-400)">
        <i class="ti ti-x"></i> Rejeitar marcação
      </div>
      <p style="margin-bottom:1rem;color:var(--text-2);font-size:13px">
        A consulta será cancelada e o paciente notificado.
      </p>
      <div class="form-group">
        <label class="form-label">Motivo (opcional)</label>
        <textarea class="form-input" id="rejeitar-motivo" rows="3"
          placeholder="Ex: Horário não disponível, agenda completa..."></textarea>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Voltar</button>
        <button class="btn btn-primary" style="background:var(--red-400);border-color:var(--red-400)"
          onclick="executarRejeitar()">
          <i class="ti ti-x"></i> Confirmar rejeição
        </button>
      </div>
    </div>
  `);
}

async function executarRejeitar() {
  const id = window._rejeitarId;
  const overlay = document.querySelector(".modal-overlay");
  const btn = overlay?.querySelector(".btn-primary");
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="ti ti-loader ti-spin"></i> A processar...'; }

  const { error } = await SB.cancelarConsulta(id);
  if (error) {
    showToast("Erro ao rejeitar: " + error.message, "error");
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="ti ti-x"></i> Confirmar rejeição'; }
    return;
  }

  overlay?.remove();
  showToast("Marcação rejeitada.", "success");
  Router.go("dashboard");
}

// ─── CONFIRMAR PAGAMENTO ───
async function confirmarPagamentoModal(consultaId) {
  let metodoSel = 'mbway';
  showModal(`
    <div class="modal">
      <div class="modal-title">Confirmar pagamento</div>
      <div style="font-size:13px;color:var(--gray-600);margin-bottom:1.25rem">Valor: <strong>${DB.clinica.preco}€</strong></div>
      <div class="payment-option selected" id="opt-mbway" onclick="selMetodo('mbway')">
        <i class="ti ti-device-mobile" style="font-size:20px;color:var(--teal-400)"></i>
        <div><div class="payment-option-name">MB Way</div></div>
      </div>
      <div class="payment-option" id="opt-cartao" onclick="selMetodo('cartao')">
        <i class="ti ti-credit-card" style="font-size:20px;color:var(--gray-400)"></i>
        <div><div class="payment-option-name">Cartão de crédito/débito</div></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
        <button class="btn btn-primary" onclick="executarConfirmacao('${consultaId}')">
          <i class="ti ti-check"></i> Confirmar e emitir recibo
        </button>
      </div>
    </div>
  `);
  window._metodoSel = metodoSel;
}

function selMetodo(m) {
  window._metodoSel = m;
  document.getElementById('opt-mbway').classList.toggle('selected', m === 'mbway');
  document.getElementById('opt-cartao').classList.toggle('selected', m === 'cartao');
}

async function executarConfirmacao(consultaId) {
  document.querySelector('.modal-overlay')?.remove();
  await SB.confirmarPagamento(consultaId, window._metodoSel || 'mbway');
  showToast('Pagamento confirmado! Link Meet gerado e recibo emitido.');
  Router.go('dashboard');
}
