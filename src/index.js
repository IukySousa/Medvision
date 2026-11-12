// Worker do MedVision: serve o site estático e expõe a API em /api/*
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function criarContato(request, env) {
  let body;
  try { body = await request.json(); } catch { return json({ erro: 'JSON inválido' }, 400); }

  // Honeypot anti-spam: campo escondido que humanos não preenchem
  if (body.website) return json({ ok: true });

  const nome = clean(body.nome, 120);
  const email = clean(body.email, 160).toLowerCase();
  if (nome.length < 2) return json({ erro: 'Informe seu nome.' }, 400);
  if (!EMAIL_RE.test(email)) return json({ erro: 'E-mail inválido.' }, 400);

  await env.DB.prepare(
    `INSERT INTO contatos (nome, email, instituicao, cargo, interesse, mensagem)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
  ).bind(
    nome, email,
    clean(body.instituicao, 160), clean(body.cargo, 120),
    clean(body.interesse, 120), clean(body.mensagem, 2000)
  ).run();

  return json({ ok: true }, 201);
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/health') return json({ ok: true });

    if (pathname === '/api/contato') {
      if (request.method !== 'POST') return json({ erro: 'Método não permitido' }, 405);
      try { return await criarContato(request, env); }
      catch (e) { console.error(e); return json({ erro: 'Erro interno' }, 500); }
    }

    if (pathname.startsWith('/api/')) return json({ erro: 'Não encontrado' }, 404);
    return env.ASSETS.fetch(request); // qualquer outra rota = site estático
  },
};
