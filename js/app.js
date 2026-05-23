// ─── APP BOOTSTRAP ───
document.addEventListener("DOMContentLoaded", async () => {
  showLoading();
  const perfil = await Auth.restore();
  hideLoading();
  if (perfil) {
    if (Auth.isMedica()) Router.go("dashboard");
    else Router.go("paciente-area");
  } else {
    Router.go("landing");
  }
});

function showLoading() {
  document.getElementById("app").innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px">
      <div style="width:36px;height:36px;border-radius:50%;background:var(--teal-400);display:flex;align-items:center;justify-content:center">
        <i class="ti ti-brain" style="color:#fff;font-size:18px"></i>
      </div>
      <div style="font-size:13px;color:var(--gray-400)">A carregar...</div>
    </div>
  `;
}

function hideLoading() {}
