// ─── STRIPE INTEGRATION ───
const STRIPE_PK = "pk_test_51TaHZ9Rw7XTsoePi5eWV8cByz4kKL9vbd9JdcIq2C9YNLKqxQ031aD1QC56rtnEwEI4xcm3iJ61rSQ7DCyPzpQ1g00kVVBari6";
const EDGE_URL  = "https://obxacsofujzghcycvftm.supabase.co/functions/v1/criar-pagamento";

let stripeInstance = null;

function getStripe() {
  if (!stripeInstance) stripeInstance = Stripe(STRIPE_PK);
  return stripeInstance;
}

async function criarPaymentIntent(valor, consultaId, nome, email) {
  const res = await fetch(EDGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + SUPABASE_ANON,
    },
    body: JSON.stringify({
      valor,
      consulta_id: consultaId,
      paciente_nome: nome,
      paciente_email: email,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.clientSecret;
}
