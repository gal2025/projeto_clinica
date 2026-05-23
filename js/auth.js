// ─── AUTH MODULE (Supabase) ───
const Auth = {
  currentUser: null,
  currentPerfil: null,

  async login(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return null;
    await this.loadPerfil(data.user.id);
    return this.currentPerfil;
  },

  async register(email, password, nome, nif, telefone) {
    const { data, error } = await sb.auth.signUp({
      email, password,
      options: { data: { nome, role: 'paciente' } }
    });
    if (error) return { error };
    // Update perfil with extra fields
    if (data.user) {
      await sb.from('perfis').update({ nif, telefone }).eq('id', data.user.id);
      await this.loadPerfil(data.user.id);
    }
    return { user: data.user };
  },

  async loadPerfil(uid) {
    const { data } = await sb.from('perfis').select('*').eq('id', uid).single();
    this.currentUser = uid;
    this.currentPerfil = data;
    return data;
  },

  async logout() {
    await sb.auth.signOut();
    this.currentUser = null;
    this.currentPerfil = null;
    Router.go('landing');
  },

  async restore() {
    const { data } = await sb.auth.getSession();
    if (data.session) {
      await this.loadPerfil(data.session.user.id);
      return this.currentPerfil;
    }
    return null;
  },

  isMedica() {
    return this.currentPerfil?.role === 'medica';
  },

  isPaciente() {
    return this.currentPerfil?.role === 'paciente';
  },

  requireAuth(role) {
    if (!this.currentPerfil) { Router.go('login'); return false; }
    if (role && this.currentPerfil.role !== role) { Router.go('login'); return false; }
    return true;
  },
};
