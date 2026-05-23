// ─── MOCK DATA ───
// Substitui por Supabase na fase de produção

const DB = {

  clinica: {
    nome: "Dra. Sofia Rodrigues",
    especialidade: "Psiquiatria",
    subtitulo: "Consultas Online",
    nif: "198 765 432",
    email: "sofia.rodrigues@psiquiatria-online.pt",
    telefone: "+351 912 345 678",
    preco: 90,
    duracao: 50, // minutos
    horario: { inicio: "09:00", fim: "18:00" },
    diasSemana: [1, 2, 3, 4, 5], // seg-sex
  },

  utilizadores: [
    {
      id: "u-medica",
      nome: "Dra. Sofia Rodrigues",
      email: "sofia@clinica.pt",
      password: "sofia123",
      role: "medica",
      iniciais: "SR",
    },
    {
      id: "u-p1",
      nome: "Ana Mendes",
      email: "ana@paciente.pt",
      password: "ana123",
      role: "paciente",
      iniciais: "AM",
      nif: "123 456 789",
      telefone: "+351 912 000 001",
      dataNascimento: "1985-03-14",
    },
    {
      id: "u-p2",
      nome: "João Pinheiro",
      email: "joao@paciente.pt",
      password: "joao123",
      role: "paciente",
      iniciais: "JP",
      nif: "234 567 890",
      telefone: "+351 963 000 002",
      dataNascimento: "1990-07-22",
    },
    {
      id: "u-p3",
      nome: "Maria Santos",
      email: "maria@paciente.pt",
      password: "maria123",
      role: "paciente",
      iniciais: "MS",
      nif: "345 678 901",
      telefone: "+351 934 000 003",
      dataNascimento: "1978-11-05",
    },
    {
      id: "u-p4",
      nome: "Rui Ferreira",
      email: "rui@paciente.pt",
      password: "rui123",
      role: "paciente",
      iniciais: "RF",
      nif: "456 789 012",
      telefone: "+351 918 000 004",
      dataNascimento: "1995-01-30",
    },
    {
      id: "u-p5",
      nome: "Luísa Costa",
      email: "luisa@paciente.pt",
      password: "luisa123",
      role: "paciente",
      iniciais: "LC",
      nif: "567 890 123",
      telefone: "+351 926 000 005",
      dataNascimento: "1988-09-18",
    },
    {
      id: "u-p6",
      nome: "Pedro Lopes",
      email: "pedro@paciente.pt",
      password: "pedro123",
      role: "paciente",
      iniciais: "PL",
      nif: "678 901 234",
      telefone: "+351 910 000 006",
      dataNascimento: "1972-06-11",
    },
  ],

  tiposConsulta: [
    { id: "primeira",    label: "Primeira consulta",     preco: 90, duracao: 50 },
    { id: "acompanhamento", label: "Acompanhamento",     preco: 90, duracao: 50 },
    { id: "reavaliacao", label: "Reavaliação",            preco: 90, duracao: 50 },
    { id: "medicacao",   label: "Revisão de medicação",  preco: 90, duracao: 50 },
  ],

  consultas: [
    {
      id: "c001",
      pacienteId: "u-p1",
      data: "2026-05-19",
      hora: "09:00",
      tipo: "acompanhamento",
      estado: "confirmada",
      pagamentoId: "pag001",
      meetLink: "https://meet.google.com/abc-aaaa-111",
      notas: "",
    },
    {
      id: "c002",
      pacienteId: "u-p2",
      data: "2026-05-19",
      hora: "10:00",
      tipo: "primeira",
      estado: "confirmada",
      pagamentoId: "pag002",
      meetLink: "https://meet.google.com/abc-bbbb-222",
      notas: "",
    },
    {
      id: "c003",
      pacienteId: "u-p3",
      data: "2026-05-19",
      hora: "11:30",
      tipo: "reavaliacao",
      estado: "pendente",
      pagamentoId: null,
      meetLink: null,
      notas: "",
    },
    {
      id: "c004",
      pacienteId: "u-p4",
      data: "2026-05-19",
      hora: "14:00",
      tipo: "acompanhamento",
      estado: "confirmada",
      pagamentoId: "pag003",
      meetLink: "https://meet.google.com/abc-cccc-333",
      notas: "",
    },
    {
      id: "c005",
      pacienteId: "u-p5",
      data: "2026-05-19",
      hora: "16:30",
      tipo: "medicacao",
      estado: "concluida",
      pagamentoId: "pag004",
      meetLink: "https://meet.google.com/abc-dddd-444",
      notas: "Ajuste de dose feito.",
    },
    {
      id: "c006",
      pacienteId: "u-p1",
      data: "2026-05-20",
      hora: "09:00",
      tipo: "acompanhamento",
      estado: "confirmada",
      pagamentoId: "pag005",
      meetLink: "https://meet.google.com/abc-eeee-555",
      notas: "",
    },
    {
      id: "c007",
      pacienteId: "u-p6",
      data: "2026-05-20",
      hora: "11:00",
      tipo: "acompanhamento",
      estado: "confirmada",
      pagamentoId: "pag006",
      meetLink: "https://meet.google.com/abc-ffff-666",
      notas: "",
    },
    {
      id: "c008",
      pacienteId: "u-p3",
      data: "2026-05-21",
      hora: "10:00",
      tipo: "acompanhamento",
      estado: "confirmada",
      pagamentoId: "pag007",
      meetLink: "https://meet.google.com/abc-gggg-777",
      notas: "",
    },
    {
      id: "c009",
      pacienteId: "u-p4",
      data: "2026-05-21",
      hora: "14:00",
      tipo: "reavaliacao",
      estado: "confirmada",
      pagamentoId: "pag008",
      meetLink: "https://meet.google.com/abc-hhhh-888",
      notas: "",
    },
    {
      id: "c010",
      pacienteId: "u-p1",
      data: "2026-05-07",
      hora: "09:00",
      tipo: "acompanhamento",
      estado: "concluida",
      pagamentoId: "pag009",
      meetLink: "https://meet.google.com/abc-iiii-999",
      notas: "",
    },
    {
      id: "c011",
      pacienteId: "u-p5",
      data: "2026-05-12",
      hora: "16:00",
      tipo: "acompanhamento",
      estado: "concluida",
      pagamentoId: "pag010",
      meetLink: "https://meet.google.com/abc-jjjj-000",
      notas: "",
    },
  ],

  pagamentos: [
    { id: "pag001", consultaId: "c001", valor: 90, metodo: "cartao", estado: "pago", data: "2026-05-17", reciboNum: "0082" },
    { id: "pag002", consultaId: "c002", valor: 90, metodo: "mbway",  estado: "pago", data: "2026-05-18", reciboNum: "0083" },
    { id: "pag003", consultaId: "c004", valor: 90, metodo: "mbway",  estado: "pago", data: "2026-05-17", reciboNum: "0084" },
    { id: "pag004", consultaId: "c005", valor: 90, metodo: "cartao", estado: "pago", data: "2026-05-19", reciboNum: "0085" },
    { id: "pag005", consultaId: "c006", valor: 90, metodo: "cartao", estado: "pago", data: "2026-05-18", reciboNum: "0086" },
    { id: "pag006", consultaId: "c007", valor: 90, metodo: "mbway",  estado: "pago", data: "2026-05-19", reciboNum: "0087" },
    { id: "pag007", consultaId: "c008", valor: 90, metodo: "cartao", estado: "pago", data: "2026-05-19", reciboNum: "0088" },
    { id: "pag008", consultaId: "c009", valor: 90, metodo: "mbway",  estado: "pago", data: "2026-05-19", reciboNum: "0089" },
    { id: "pag009", consultaId: "c010", valor: 90, metodo: "cartao", estado: "pago", data: "2026-05-06", reciboNum: "0080" },
    { id: "pag010", consultaId: "c011", valor: 90, metodo: "mbway",  estado: "pago", data: "2026-05-11", reciboNum: "0081" },
  ],

  // ─── HELPERS ───
  getPaciente(id) {
    return this.utilizadores.find(u => u.id === id);
  },
  getTipoConsulta(id) {
    return this.tiposConsulta.find(t => t.id === id);
  },
  getPagamento(id) {
    return this.pagamentos.find(p => p.id === id);
  },
  getConsultasDia(data) {
    return this.consultas
      .filter(c => c.data === data)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  },
  getConsultasPaciente(pacienteId) {
    return this.consultas
      .filter(c => c.pacienteId === pacienteId)
      .sort((a, b) => b.data.localeCompare(a.data));
  },
  getConsultasPendentes() {
    return this.consultas.filter(c => c.estado === "pendente");
  },
  getConsultasMes(anoMes) {
    return this.consultas.filter(c => c.data.startsWith(anoMes));
  },
  getDiasComConsultas(anoMes) {
    return this.consultas
      .filter(c => c.data.startsWith(anoMes))
      .map(c => parseInt(c.data.split("-")[2]));
  },
  getReceita(anoMes) {
    const ids = this.getConsultasMes(anoMes)
      .filter(c => c.pagamentoId)
      .map(c => c.pagamentoId);
    return this.pagamentos
      .filter(p => ids.includes(p.id) && p.estado === "pago")
      .reduce((s, p) => s + p.valor, 0);
  },
  // Adicionar nova consulta (mock)
  addConsulta(nova) {
    const id = "c" + String(this.consultas.length + 1).padStart(3, "0");
    this.consultas.push({ id, ...nova });
    return id;
  },
  // Confirmar pagamento (mock)
  confirmarPagamento(consultaId, metodo) {
    const consulta = this.consultas.find(c => c.id === consultaId);
    if (!consulta) return;
    const reciboNum = String(parseInt(this.pagamentos[this.pagamentos.length - 1]?.reciboNum || "0089") + 1).padStart(4, "0");
    const pagId = "pag" + String(this.pagamentos.length + 1).padStart(3, "0");
    this.pagamentos.push({
      id: pagId, consultaId,
      valor: DB.clinica.preco, metodo, estado: "pago",
      data: new Date().toISOString().split("T")[0],
      reciboNum,
    });
    consulta.pagamentoId = pagId;
    consulta.estado = "confirmada";
    consulta.meetLink = "https://meet.google.com/abc-" + Math.random().toString(36).substring(2, 6) + "-" + Math.random().toString(36).substring(2, 6);
    return pagId;
  },
};

// ─── FORMAT HELPERS ───
function fmtData(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  const meses = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
  return `${parseInt(d)} ${meses[parseInt(m)-1]} ${y}`;
}
function fmtMetodo(m) {
  return m === "mbway" ? "MB Way" : m === "cartao" ? "Cartão" : m;
}
function fmtEstado(e) {
  const map = { confirmada:"Confirmada", pendente:"Pendente", concluida:"Concluída", cancelada:"Cancelada" };
  return map[e] || e;
}
function fmtTipo(id) {
  return DB.getTipoConsulta(id)?.label || id;
}
function badgeEstado(estado) {
  const map = {
    confirmada: "badge-teal",
    pendente:   "badge-amber",
    concluida:  "badge-gray",
    cancelada:  "badge-red",
    pago:       "badge-green",
  };
  return `<span class="badge ${map[estado] || 'badge-gray'}">${fmtEstado(estado)}</span>`;
}
function getToday() {
  return new Date().toISOString().split("T")[0];
}
function getTodayLabel() {
  const d = new Date();
  const dias = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
  const meses = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]}`;
}
