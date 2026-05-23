// ─── DATABASE LAYER (Supabase) ───
// Substitui as chamadas ao DB local (data.js)

const SB = {

  // ── PERFIS ──
  async getPerfis() {
    const { data } = await sb.from('perfis').select('*').eq('role', 'paciente').order('nome');
    return data || [];
  },

  async getPerfil(id) {
    const { data } = await sb.from('perfis').select('*').eq('id', id).single();
    return data;
  },

  // ── TIPOS DE CONSULTA ──
  async getTipos() {
    const { data } = await sb.from('tipos_consulta').select('*');
    return data || [];
  },

  // ── CONSULTAS ──
  async getConsultasDia(data) {
    const { data: rows } = await sb
      .from('consultas')
      .select('*, perfis(*), tipos_consulta(*)')
      .eq('data', data)
      .order('hora');
    return rows || [];
  },

  async getConsultasMes(anoMes) {
    const { data: rows } = await sb
      .from('consultas')
      .select('*, perfis(*), tipos_consulta(*), pagamentos(*)')
      .gte('data', anoMes + '-01')
      .lte('data', anoMes + '-31')
      .order('data').order('hora');
    return rows || [];
  },

  async getConsultasPaciente(pacienteId) {
    const { data: rows } = await sb
      .from('consultas')
      .select('*, tipos_consulta(*), pagamentos(*)')
      .eq('paciente_id', pacienteId)
      .order('data', { ascending: false });
    return rows || [];
  },

  async getConsultasPendentes() {
    const { data: rows } = await sb
      .from('consultas')
      .select('*, perfis(*), tipos_consulta(*)')
      .eq('estado', 'pendente')
      .order('data').order('hora');
    return rows || [];
  },

  async getDiasComConsultas(anoMes) {
    const { data: rows } = await sb
      .from('consultas')
      .select('data')
      .gte('data', anoMes + '-01')
      .lte('data', anoMes + '-31');
    return (rows || []).map(r => parseInt(r.data.split('-')[2]));
  },

  async addConsulta(nova) {
    const { data, error } = await sb.from('consultas').insert(nova).select().single();
    return { data, error };
  },

  async updateConsulta(id, campos) {
    const { data, error } = await sb.from('consultas').update(campos).eq('id', id).select().single();
    return { data, error };
  },

  // ── PAGAMENTOS ──
  async getPagamentos() {
    const { data } = await sb
      .from('pagamentos')
      .select('*, consultas(*, perfis(*), tipos_consulta(*))')
      .order('created_at', { ascending: false });
    return data || [];
  },

  async getReceitaMes(anoMes) {
    const { data } = await sb
      .from('pagamentos')
      .select('valor, consultas!inner(data)')
      .eq('estado', 'pago')
      .gte('consultas.data', anoMes + '-01')
      .lte('consultas.data', anoMes + '-31');
    return (data || []).reduce((s, p) => s + parseFloat(p.valor), 0);
  },

  async confirmarPagamento(consultaId, metodo) {
    // Gerar número de recibo
    const { count } = await sb.from('pagamentos').select('*', { count: 'exact', head: true });
    const reciboNum = String((count || 0) + 1).padStart(4, '0');

    // Inserir pagamento
    const { data: pag } = await sb.from('pagamentos').insert({
      consulta_id: consultaId,
      valor: DB.clinica.preco,
      metodo,
      estado: 'pago',
      recibo_num: reciboNum,
      data_pagamento: new Date().toISOString(),
    }).select().single();

    // Gerar link Meet fictício e confirmar consulta
    const meetLink = 'https://meet.google.com/' +
      Math.random().toString(36).substring(2, 5) + '-' +
      Math.random().toString(36).substring(2, 5) + '-' +
      Math.random().toString(36).substring(2, 5);

    await sb.from('consultas').update({
      estado: 'confirmada',
      meet_link: meetLink,
    }).eq('id', consultaId);

    return pag;
  },
};