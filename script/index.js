const API_URL = 'https://desafio-estagio.onrender.com/api';


const wrappers = document.querySelectorAll('.wrapper-left .wrapper');
const telas = document.querySelectorAll('.tela');

wrappers.forEach((item, index) => {
 
  if (index === 0) return;

  item.addEventListener('click', () => {
    telas.forEach(tela => tela.style.display = 'none');

    
    if (index === 1) document.getElementById('tela-inicio').style.display = 'block';
    if (index === 2) {
      document.getElementById('tela-pessoas').style.display = 'block';
      carregarPessoas();
    }
    if (index === 3) {
      document.getElementById('tela-transacoes').style.display = 'block';
      carregarSelectPessoas();
    }
    if (index === 4) {
      document.getElementById('tela-totais').style.display = 'block';
      carregarTotais();
    }
  });
});


async function carregarPessoas() {
  const resposta = await fetch(`${API_URL}/pessoas`);
  const pessoas = await resposta.json();
  const tbody = document.querySelector('#tabela-pessoas tbody');
  tbody.innerHTML = '';

  pessoas.forEach(p => {
    tbody.innerHTML += `
      <tr>
        <td>${p.nome}</td>
        <td>${p.idade}</td>
        <td><button onclick="deletarPessoa('${p.id}')">Excluir</button></td>
      </tr>
    `;
  });
}

document.getElementById('form-pessoa').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = document.getElementById('nome-pessoa').value;
  const idade = document.getElementById('idade-pessoa').value;

  await fetch(`${API_URL}/pessoas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, idade: parseInt(idade) })
  });

  document.getElementById('form-pessoa').reset();
  carregarPessoas();
});

async function deletarPessoa(id) {
  if (confirm('Tem certeza? Isso excluirá todas as transações da pessoa.')) {
    await fetch(`${API_URL}/pessoas/${id}`, { method: 'DELETE' });
    carregarPessoas();
  }
}


async function carregarSelectPessoas() {
  const resposta = await fetch(`${API_URL}/pessoas`);
  const pessoas = await resposta.json();
  const select = document.getElementById('select-pessoa');
  select.innerHTML = '<option value="">Selecione a pessoa</option>';

  pessoas.forEach(p => {
    select.innerHTML += `<option value="${p.id}">${p.nome} (${p.idade} anos)</option>`;
  });
}

document.getElementById('form-transacao').addEventListener('submit', async (e) => {
  e.preventDefault();
  const pessoaId = document.getElementById('select-pessoa').value;
  const descricao = document.getElementById('desc-transacao').value;
  const valor = document.getElementById('valor-transacao').value;
  const tipo = document.getElementById('tipo-transacao').value;
  const msgErro = document.getElementById('msg-erro');
  if (msgErro) msgErro.innerText = '';

  const resposta = await fetch(`${API_URL}/transacoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      descricao,
      valor: parseFloat(valor),
      tipo,
      pessoa: { id: pessoaId }
    })
  });

  if (resposta.ok) {
    alert('Transação cadastrada com sucesso!');
    document.getElementById('form-transacao').reset();
  } else {
    // Lê como texto para evitar quebrar caso o back-end retorne uma mensagem simples
    const erroTexto = await resposta.text();
    alert('Erro ao cadastrar transação: ' + erroTexto);
    if (msgErro) msgErro.innerText = erroTexto; 
  }
});

document.getElementById('btn-atualizar-totais').addEventListener('click', carregarTotais);

async function carregarTotais() {
  const resposta = await fetch(`${API_URL}/transacoes/totais`);
  const relatorio = await resposta.json();

  document.getElementById('geral-receita').innerText = relatorio.geralReceitas.toFixed(2);
  document.getElementById('geral-despesa').innerText = relatorio.geralDespesas.toFixed(2);
  document.getElementById('geral-saldo').innerText = relatorio.saldoLiquidoGeral.toFixed(2);

  const tbody = document.querySelector('#tabela-totais-pessoas tbody');
  tbody.innerHTML = '';

  relatorio.pessoas.forEach(tp => {
    tbody.innerHTML += `
      <tr>
        <td>${tp.nomePessoa}</td>
        <td>${tp.idade}</td>
        <td>R$ ${tp.totalReceitas.toFixed(2)}</td>
        <td>R$ ${tp.totalDespesas.toFixed(2)}</td>
        <td>R$ ${tp.saldo.toFixed(2)}</td>
      </tr>
    `;
  });
}