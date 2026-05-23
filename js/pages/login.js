// ─── LOGIN PAGE ───
Router.register("login", () => {
  document.getElementById("app").innerHTML = `
    ${renderTopbar(false)}
    <div style="min-height:calc(100vh - 56px);display:flex;align-items:center;justify-content:center;padding:2rem;background:var(--bg)">
      <div style="width:100%;max-width:400px">
        <div style="text-align:center;margin-bottom:2rem">
          <div style="width:52px;height:52px;border-radius:14px;background:var(--teal-400);display:flex;align-items:center;justify-content:center;margin:0 auto .875rem">
            <i class="ti ti-brain" style="color:#fff;font-size:24px"></i>
          </div>
          <h1 style="font-family:'DM Serif Display',serif;font-size:24px;font-weight:400;margin-bottom:.25rem">Bem-vindo</h1>
          <p style="font-size:13px;color:var(--gray-400)">Aceda à sua área pessoal</p>
        </div>

        <div class="card" id="login-card">
          <div id="login-form">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input class="form-input" type="email" id="login-email" placeholder="email@exemplo.pt" autofocus>
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input class="form-input" type="password" id="login-pass" placeholder="••••••••">
            </div>
            <div id="login-err" style="display:none;font-size:12px;color:var(--red-400);margin-bottom:.75rem;padding:8px 10px;background:var(--red-50);border-radius:var(--radius-sm)">
              <i class="ti ti-alert-circle"></i> Email ou password incorretos
            </div>
            <button class="btn btn-primary btn-full" id="btn-login" onclick="doLogin()">
              <i class="ti ti-login"></i> Entrar
            </button>
            <div style="text-align:center;margin-top:1rem">
              <button class="btn btn-ghost btn-sm" onclick="toggleRegisto()">
                Criar conta de paciente
              </button>
            </div>
          </div>

          <div id="registo-form" style="display:none">
            <div style="font-size:14px;font-weight:500;margin-bottom:1rem">Nova conta</div>
            <div class="form-group">
              <label class="form-label">Nome completo</label>
              <input class="form-input" type="text" id="reg-nome" placeholder="O seu nome">
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input class="form-input" type="email" id="reg-email" placeholder="email@exemplo.pt">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">NIF</label>
                <input class="form-input" type="text" id="reg-nif" placeholder="123 456 789">
              </div>
              <div class="form-group">
                <label class="form-label">Telefone</label>
                <input class="form-input" type="tel" id="reg-tel" placeholder="+351 9XX XXX XXX">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input class="form-input" type="password" id="reg-pass" placeholder="Mínimo 6 caracteres">
            </div>
            <div id="reg-err" style="display:none;font-size:12px;color:var(--red-400);margin-bottom:.75rem;padding:8px 10px;background:var(--red-50);border-radius:var(--radius-sm)"></div>
            <button class="btn btn-primary btn-full" onclick="doRegisto()">
              <i class="ti ti-user-plus"></i> Criar conta
            </button>
            <div style="text-align:center;margin-top:.75rem">
              <button class="btn btn-ghost btn-sm" onclick="toggleRegisto()">Já tenho conta</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("login-pass")?.addEventListener("keydown", e => {
    if (e.key === "Enter") doLogin();
  });
});

function toggleRegisto() {
  const lf = document.getElementById("login-form");
  const rf = document.getElementById("registo-form");
  lf.style.display = lf.style.display === "none" ? "" : "none";
  rf.style.display = rf.style.display === "none" ? "" : "none";
}

async function doLogin() {
  const email = document.getElementById("login-email").value.trim();
  const pass  = document.getElementById("login-pass").value;
  const btn   = document.getElementById("btn-login");

  btn.disabled = true;
  btn.innerHTML = `<i class="ti ti-loader-2" style="animation:spin 1s linear infinite"></i> A entrar...`;

  const perfil = await Auth.login(email, pass);
  if (perfil) {
    showToast(`Bem-vindo, ${perfil.nome?.split(" ")[0]}!`);
    if (Auth.isMedica()) Router.go("dashboard");
    else Router.go("paciente-area");
  } else {
    document.getElementById("login-err").style.display = "block";
    btn.disabled = false;
    btn.innerHTML = `<i class="ti ti-login"></i> Entrar`;
  }
}

async function doRegisto() {
  const nome  = document.getElementById("reg-nome").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const nif   = document.getElementById("reg-nif").value.trim();
  const tel   = document.getElementById("reg-tel").value.trim();
  const pass  = document.getElementById("reg-pass").value;
  const errEl = document.getElementById("reg-err");

  if (!nome || !email || !pass) {
    errEl.style.display = "block";
    errEl.innerHTML = "<i class='ti ti-alert-circle'></i> Preencha todos os campos obrigatórios";
    return;
  }

  const result = await Auth.register(email, pass, nome, nif, tel);
  if (result.error) {
    errEl.style.display = "block";
    errEl.innerHTML = `<i class='ti ti-alert-circle'></i> ${result.error.message}`;
  } else {
    showToast("Conta criada! Verifique o seu email para confirmar.", "info");
    toggleRegisto();
  }
}

// Spin animation
const style = document.createElement("style");
style.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
document.head.appendChild(style);
