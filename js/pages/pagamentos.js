// ─── PAGAMENTOS (MÉDICA) ───
Router.register("pagamentos", () => {
  if (!Auth.requireAuth("medica")) return;
  renderPagamentos();
});

function renderPagamentos() {
  const today = getToday();
  const anoMes = today.substring(0, 7);
  const receita = DB.getReceita(anoMes);
  const totalConsultas = DB.getConsultasMes(anoMes).filter(c => c.pagamentoId).length;

  // Build full list sorted by date desc
  const lista = DB.pagamentos
    .slice()
    .sort((a, b) => b.data.localeCompare(a.data))
    .map(pag => {
      const consulta = DB.consultas.find(c => c.id === pag.consultaId);
      if (!consulta) return null;
      const pac = DB.getPaciente(consulta.pacienteId);
      const tipo = DB.getTipoConsulta(consulta.tipo);
      return { pag, consulta, pac, tipo };
    })
    .filter(Boolean);

  const rows = lista.map(({ pag, consulta, pac, tipo }) => `
    <tr>
      <td>
        <div class="flex-center gap-3">
          <div class="avatar-circle patient" style="font-size:11px">${pac.iniciais}</div>
          <div>
            <div class="font-medium">${pac.nome}</div>
            <div class="text-sm text-muted">${tipo?.label}</div>
          </div>
        </div>
      </td>
      <td class="text-sm">${fmtData(consulta.data)} · ${consulta.hora}</td>
      <td class="text-sm">${fmtMetodo(pag.metodo)}</td>
      <td class="font-medium">${pag.valor},00€</td>
      <td><span class="badge badge-green"><i class="ti ti-check" style="font-size:10px"></i> Pago</span></td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="verRecibo('${consulta.id}')">
          <i class="ti ti-file-invoice"></i> Recibo #${pag.reciboNum}
        </button>
      </td>
    </tr>
  `).join("");

  // Consultas pendentes
  const pendentes = DB.getConsultasPendentes();
  const pendentesHtml = pendentes.length
    ? pendentes.map(c => {
        const pac = DB.getPaciente(c.pacienteId);
        const tipo = DB.getTipoConsulta(c.tipo);
        return `
          <div class="appt-item pending">
            <span class="appt-time">${fmtData(c.data)}</span>
            <div class="avatar-circle" style="font-size:11px;background:var(--amber-50);color:var(--amber-800)">${pac.iniciais}</div>
            <div class="appt-info">
              <div class="appt-name">${pac.nome}</div>
              <div class="appt-type">${tipo?.label} · ${c.hora}</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="confirmarPagamentoModal('${c.id}')">
              <i class="ti ti-check"></i> Confirmar pagamento
            </button>
          </div>`;
      }).join("")
    : `<div class="empty-state"><i class="ti ti-circle-check"></i><p>Sem pagamentos pendentes</p></div>`;

  document.getElementById("app").innerHTML = `
    <div class="app-shell">
      ${renderSidebar("pagamentos")}
      <main class="main-content">
        <div class="page-header">
          <div class="page-header-row">
            <div>
              <div class="page-title">Pagamentos</div>
              <div class="page-sub">Gestão de faturação</div>
            </div>
            <button class="btn btn-secondary" onclick="exportarCSV()">
              <i class="ti ti-download"></i> Exportar CSV
            </button>
          </div>
        </div>

        <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
          <div class="stat-card">
            <div class="stat-label"><i class="ti ti-coin-euro"></i> Receita este mês</div>
            <div class="stat-value">${receita.toLocaleString("pt-PT")}€</div>
            <div class="stat-sub">${totalConsultas} consultas pagas</div>
          </div>
          <div class="stat-card">
            <div class="stat-label"><i class="ti ti-clock"></i> Pendentes</div>
            <div class="stat-value">${pendentes.length}</div>
            <div class="stat-sub">Aguardam confirmação</div>
          </div>
          <div class="stat-card">
            <div class="stat-label"><i class="ti ti-file-invoice"></i> Recibos emitidos</div>
            <div class="stat-value">${DB.pagamentos.length}</div>
            <div class="stat-sub">Total acumulado</div>
          </div>
        </div>

        ${pendentes.length > 0 ? `
          <div class="card mb-6">
            <div class="card-header">
              <div class="card-title" style="margin-bottom:0">Pagamentos pendentes</div>
              <span class="badge badge-amber">${pendentes.length}</span>
            </div>
            ${pendentesHtml}
          </div>
        ` : ""}

        <div class="card">
          <div class="card-title">Histórico de pagamentos</div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Data · Hora</th>
                  <th>Método</th>
                  <th>Valor</th>
                  <th>Estado</th>
                  <th>Recibo</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  `;
}

function exportarCSV() {
  const header = "Recibo,Paciente,NIF,Data,Hora,Tipo,Metodo,Valor,Estado\n";
  const rows = DB.pagamentos.map(pag => {
    const c = DB.consultas.find(x => x.id === pag.consultaId);
    const pac = c ? DB.getPaciente(c.pacienteId) : null;
    const tipo = c ? DB.getTipoConsulta(c.tipo) : null;
    return [
      pag.reciboNum,
      pac?.nome || "",
      pac?.nif || "",
      c?.data || "",
      c?.hora || "",
      tipo?.label || "",
      fmtMetodo(pag.metodo),
      pag.valor,
      pag.estado,
    ].join(",");
  }).join("\n");

  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `pagamentos_${getToday()}.csv`;
  a.click();
  showToast("CSV exportado com sucesso!");
}
