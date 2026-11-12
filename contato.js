const form = document.querySelector('.contact-form');
if (form) {
  const botao = form.querySelector('.form-button');
  const nota = form.querySelector('.form-note');
 
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dados = Object.fromEntries(new FormData(form));
    const textoOriginal = botao.innerHTML;
    botao.disabled = true;
    botao.textContent = 'Enviando...';
 
    try {
      const res = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.erro || 'Falha ao enviar');
      form.reset();
      nota.textContent = 'Solicitação enviada! Nossa equipe entrará em contato em breve.';
    } catch (err) {
      nota.textContent = err.message || 'Não foi possível enviar. Tente novamente.';
    } finally {
      botao.disabled = false;
      botao.innerHTML = textoOriginal;
    }
  });
}
 
