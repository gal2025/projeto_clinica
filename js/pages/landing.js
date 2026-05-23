// ─── LANDING PAGE ───
Router.register("landing", () => {
  document.getElementById("app").innerHTML = `
    ${renderTopbar()}
    <main>
      <section class="landing-hero">
        <div class="hero-text">
          <div class="hero-eyebrow">
            <i class="ti ti-video" aria-hidden="true"></i>
            Consultas 100% online
          </div>
          <h1 class="hero-title">
            Cuidar da sua<br><em>saúde mental</em><br>onde estiver
          </h1>
          <p class="hero-desc">
            Videoconsultas de psiquiatria com a Dra. Sofia Rodrigues.
            Marcação simples, pagamento seguro, link de videochamada enviado por email.
          </p>
          <div class="hero-cta">
            <button class="btn btn-primary btn-lg" onclick="Router.go('portal')">
              <i class="ti ti-calendar-plus"></i>
              Marcar consulta
            </button>
            <button class="btn btn-secondary btn-lg" onclick="Router.go('login')">
              <i class="ti ti-login"></i>
              Área do paciente
            </button>
          </div>
          <div class="hero-features">
            <div class="hero-feature"><i class="ti ti-video"></i> Google Meet</div>
            <div class="hero-feature"><i class="ti ti-device-mobile"></i> MB Way & Cartão</div>
            <div class="hero-feature"><i class="ti ti-file-invoice"></i> Recibo automático</div>
            <div class="hero-feature"><i class="ti ti-shield-check"></i> Dados protegidos (RGPD)</div>
          </div>
        </div>
      </section>

      <section style="background:var(--bg-card);border-top:1px solid var(--border);padding:3rem 2rem">
        <div style="max-width:900px;margin:0 auto">
          <div style="text-align:center;margin-bottom:2.5rem">
            <h2 style="font-family:'DM Serif Display',serif;font-size:30px;font-weight:400;margin-bottom:.5rem">Como funciona</h2>
            <p style="color:var(--gray-400);font-size:14px">Marcar uma consulta demora menos de 3 minutos</p>
          </div>
          <div class="three-col">
            <div style="text-align:center;padding:1.5rem">
              <div style="width:48px;height:48px;border-radius:50%;background:var(--teal-50);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:22px;color:var(--teal-400)"><i class="ti ti-calendar-plus"></i></div>
              <div style="font-weight:500;margin-bottom:.5rem">1. Escolha data e hora</div>
              <div style="font-size:13px;color:var(--gray-400)">Selecione o dia e horário disponível que mais lhe convém</div>
            </div>
            <div style="text-align:center;padding:1.5rem">
              <div style="width:48px;height:48px;border-radius:50%;background:var(--teal-50);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:22px;color:var(--teal-400)"><i class="ti ti-credit-card"></i></div>
              <div style="font-weight:500;margin-bottom:.5rem">2. Pague em segurança</div>
              <div style="font-size:13px;color:var(--gray-400)">MB Way ou cartão de crédito/débito. Pagamento processado via Stripe</div>
            </div>
            <div style="text-align:center;padding:1.5rem">
              <div style="width:48px;height:48px;border-radius:50%;background:var(--teal-50);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:22px;color:var(--teal-400)"><i class="ti ti-video"></i></div>
              <div style="font-weight:500;margin-bottom:.5rem">3. Receba o link Meet</div>
              <div style="font-size:13px;color:var(--gray-400)">Receberá por email o link do Google Meet e o recibo da consulta</div>
            </div>
          </div>
        </div>
      </section>

      <section style="padding:3rem 2rem">
        <div style="max-width:680px;margin:0 auto;text-align:center">
          <div style="background:var(--teal-50);border-radius:var(--radius-xl);padding:2.5rem">
            <div style="width:60px;height:60px;border-radius:50%;background:var(--teal-100);display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem">
              <i class="ti ti-stethoscope" style="font-size:26px;color:var(--teal-600)"></i>
            </div>
            <h3 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:.75rem">${DB.clinica.nome}</h3>
            <p style="font-size:13px;color:var(--gray-600);line-height:1.7;margin-bottom:1.5rem">
              Especialista em Psiquiatria. Consultas online para adultos.<br>
              Disponível de segunda a sexta-feira, das 09h00 às 18h00.
            </p>
            <button class="btn btn-primary" onclick="Router.go('portal')">
              <i class="ti ti-calendar-plus"></i> Agendar consulta — ${DB.clinica.preco}€
            </button>
          </div>
        </div>
      </section>

      <footer style="border-top:1px solid var(--border);padding:1.5rem 2rem;text-align:center">
        <p style="font-size:12px;color:var(--gray-400)">
          © 2026 ${DB.clinica.nome} · NIF ${DB.clinica.nif} ·
          <a onclick="Router.go('login')" style="color:var(--teal-400);cursor:pointer">Área do paciente</a> ·
          Os seus dados são protegidos nos termos do RGPD
        </p>
      </footer>
    </main>
  `;
});
