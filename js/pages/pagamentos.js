// PAGAMENTOS (Supabase)
Router.register("pagamentos", async () => {
  if (!Auth.requireAuth("medica")) return;

  document.getElementById("app").innerHTML =
    '<div class="app-shell">' + renderSidebar("pagamentos") +
    '<main class="main-content">' +
    '<div style="display:flex;align-items:center;justify-content:center;height:60vh;flex-direction:column;gap:12px">' +
    '<i class="ti ti-loader-2" style="font-size:28px;color:var(--teal-400);animation:spin 1s linear infinite"></i>' +
    '<div style="font-size:13px;color:var(--gray-400)">A carregar pagamentos...</div>' +
    '</div></main></div>';

  const [pagamentos, pendentes] = await Promise.all([
    SB.getPagamentos(),
    SB.getConsultasPendentes(),
  ]);

  const receita = pagamentos
    .filter(p => p.estado === "pago")
    .reduce((s, p) => s + parseFloat(p.valor), 0);

  let rows = "";
  pagamentos.forEach(pag => {
    const c = pag.consultas;
    const pac = c ? c.perfis : null;
    const tipo = c ? c.tipos_consulta : null;
    const iniciais = (pac && pac.nome ? pac.nome : "?").split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase();
    const hora = c && c.hora ? c.hora.substring(0,5) : "";
    rows += "<tr>";
    rows += "<td><div class='flex-center gap-3'>";
    rows += "<div class='avatar-circle patient' style='font-size:11px'>" + iniciais + "</div>";
    rows += "<div><div class='font-medium'>" + (pac ? pac.nome : "-") + "</div>";
    rows += "<div class='text-sm text-muted'>" + (tipo ? tipo.label : "-") + "</div></div></div></td>";
    rows += "<td class='text-sm'>" + fmtData(c ? c.data : null) + " " + hora + "</td>";
    rows += "<td class='text-sm'>" + fmtMetodo(pag.metodo) + "</td>";
    rows += "<td class='font-medium'>" + pag.valor + ",00&euro;</td>";
    rows += "<td><span class='badge badge-green'>Pago</span></td>";
    rows += "<td><span class='text-sm text-muted'>Rec. #" + (pag.recibo_num || "-") + "</span></td>";
    rows += "</tr>";
  });

  let pendentesHtml = "";
  if (pendentes.length === 0) {
    pendentesHtml = "<div class='empty-state'><i class='ti ti-circle-check'></i><p>Sem pagamentos pendentes</p></div>";
  } else {
    pendentes.forEach(c => {
      const pac = c.perfis;
      const tipo = c.tipos_consulta;
      const iniciais = (pac && pac.nome ? pac.nome : "?").split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase();
      const hora = c.hora ? c.hora.substring(0,5) : "";
      pendentesHtml += "<div class='appt-item pending'>";
      pendentesHtml += "<span class='appt-time'>" + fmtData(c.data) + "</span>";
      pendentesHtml += "<div class='avatar-circle' style='font-size:11px;background:var(--amber-50);color:var(--amber-800)'>" + iniciais + "</div>";
      pendentesHtml += "<div class='appt-info'><div class='appt-name'>" + (pac ? pac.nome : "-") + "</div>";
      pendentesHtml += "<div class='appt-type'>" + (tipo ? tipo.label : "-") + " " + hora + "</div></div>";
      pendentesHtml += "<button class='btn btn-primary btn-sm' onclick=\"confirmarPagamentoModal('" + c.id + "')\"><i class='ti ti-check'></i> Confirmar pagamento</button>";
      pendentesHtml += "</div>";
    });
  }

  let pendentesSection = "";
  if (pendentes.length > 0) {
    pendentesSection = "<div class='card mb-6'><div class='card-header'><div class='card-title' style='margin-bottom:0'>Pagamentos pendentes</div><span class='badge badge-amber'>" + pendentes.length + "</span></div>" + pendentesHtml + "</div>";
  }

  document.getElementById("app").innerHTML =
    "<div class='app-shell'>" + renderSidebar("pagamentos") +
    "<main class='main-content'>" +
    "<div class='page-header'><div class='page-header-row'>" +
    "<div><div class='page-title'>Pagamentos</div><div class='page-sub'>Gestao de faturacao</div></div>" +
    "<button class='btn btn-secondary' onclick='exportarCSV()'><i class='ti ti-download'></i> Exportar CSV</button>" +
    "</div></div>" +
    "<div class='stats-grid' style='grid-template-columns:repeat(3,1fr)'>" +
    "<div class='stat-card'><div class='stat-label'><i class='ti ti-coin-euro'></i> Receita total</div><div class='stat-value'>" + receita.toLocaleString("pt-PT") + "&euro;</div><div class='stat-sub'>" + pagamentos.length + " consultas pagas</div></div>" +
    "<div class='stat-card'><div class='stat-label'><i class='ti ti-clock'></i> Pendentes</div><div class='stat-value'>" + pendentes.length + "</div><div class='stat-sub'>Aguardam confirmacao</div></div>" +
    "<div class='stat-card'><div class='stat-label'><i class='ti ti-file-invoice'></i> Recibos emitidos</div><div class='stat-value'>" + pagamentos.length + "</div><div class='stat-sub'>Total acumulado</div></div>" +
    "</div>" +
    pendentesSection +
    "<div class='card'><div class='card-title'>Historico de pagamentos</div>" +
    "<div class='table-wrap'><table><thead><tr>" +
    "<th>Paciente</th><th>Data Hora</th><th>Metodo</th><th>Valor</th><th>Estado</th><th>Recibo</th>" +
    "</tr></thead><tbody>" + (rows || "<tr><td colspan='6'><div class='empty-state'><i class='ti ti-receipt-off'></i><p>Sem pagamentos</p></div></td></tr>") +
    "</tbody></table></div></div>" +
    "</main></div>";
});

function exportarCSV() {
  showToast("Exportacao CSV em breve", "info");
}
