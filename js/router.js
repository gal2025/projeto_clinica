// ─── ROUTER ───
const Router = {
  current: null,
  routes: {},

  register(name, fn) {
    this.routes[name] = fn;
  },

  go(name, params) {
    this.current = name;
    const fn = this.routes[name];
    if (fn) fn(params);
    else document.getElementById("app").innerHTML = `<p style="padding:2rem">Página não encontrada: ${name}</p>`;
  },
};
