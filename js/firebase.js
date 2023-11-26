// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCJTmE8hbTG2jGAHN6sMSgj6LJ4bhejb7Q",
  authDomain: "projeto-erica.firebaseapp.com",
  projectId: "projeto-erica",
  storageBucket: "projeto-erica.appspot.com",
  messagingSenderId: "369432815189",
  appId: "1:369432815189:web:05c7fe3ee9984f2d0e96dc"
};

//Inicializando o Firebase
firebase.initializeApp(firebaseConfig)
//Definindo a URL padrão do site
const urlApp = 'https://ericasousav.github.io/projetoCrud-gti/'

// Função para fazer login usando o Google
function logaGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider()
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      window.location.href = 'menu.html'
    }).catch((error) => {
      alert(`Erro ao efetuar o login: ${error.message}`)
    })
}

// Função para verificar se o usuário está logado
function verificaLogado() {
  firebase.auth().onAuthStateChanged(user => {
    if (user) { //Contém dados do login?
      //Salvamos o id do usuário localmente
      localStorage.setItem('usuarioId', user.uid)

      //Inserindo a imagem do usuário      
      let imagem = document.getElementById('imagemUsuario')
      user.photoURL
        ? imagem.innerHTML += `<img src="${user.photoURL}" title="${user.displayName}" class="img rounded-circle" width="40"/>`
        : imagem.innerHTML += '<img src="images/person-circle.svg" title="Usuário sem foto" class="img rounded-circle " width="32" />'

    } else {
      // Se o usuário não estiver logado, redireciona para a tela de login
      localStorage.removeItem('usuarioId') //Removemos o id salvo
      window.location.href = 'index.html' //direcionamos para o login        
    }
  })
}

// Função para fazer logout
function logoutFirebase() {
  firebase.auth().signOut()
    .then(function () {
      localStorage.removeItem('usuarioId')
      window.location.href = 'index.html'
    })
    .catch(function (error) {
      alert(`Não foi possível efetuar o logout: ${error.message}`)
    })
}

// Função para salvar informações do colaborador no Firebase
async function salvaColaborador(colaborador) {
  // Obtém o modo de edição da URL
  const params = new URLSearchParams(window.location.search)
  const editar = params.get('editar')
  const id_colaborador = params.get('id')

  // Obtendo o usuário atual
  let usuarioAtual = firebase.auth().currentUser

  try {
    if (editar) {
      // Se estiver em modo de edição, atualiza os dados existentes
      await firebase.database().ref(`cadColaboradores/${id_colaborador}`).update({
        ...colaborador,
        usuarioInclusao: {
          uid: usuarioAtual.uid,
          nome: usuarioAtual.displayName,
        },
      })
      alert('✔ Registro atualizado com sucesso!')
    } else {
      // Se não estiver em modo de edição, cria um novo cadastro
      await firebase.database().ref('cadColaboradores').push({
        ...colaborador,
        usuarioInclusao: {
          uid: usuarioAtual.uid,
          nome: usuarioAtual.displayName,
        },
      })
      alert('✔ Registro incluído com sucesso!')
    }

    //Limpar o formulário 
    document.getElementById('formCadastro').reset()

    //Redireciona para a tela de registro
    window.location.href = `${urlApp}/cadColaboradores.html`

  } catch (error) {
    alert(`❌Erro ao salvar: ${error.message}`)
  }
}

// Submit do formulário
document.getElementById('formCadastro').addEventListener('submit', function (event) {
  event.preventDefault() //evita o recarregamento da página
  const colaborador = {
    nome: document.getElementById('nome').value,
    cpf: document.getElementById('cpf').value,
    data: document.getElementById('data').value,
    sexo: document.querySelector('input[name="sexo"]:checked').value,
    cep: document.getElementById('cep').value,
    endereco: document.getElementById('endereco').value,
    cargo: document.getElementById('cargo').value
  }
  salvaColaborador(colaborador)
})

// Carrega os dados dos colaboradores na tabela
async function carregacadColaboradores() {
  const tabela = document.getElementById('dadosTabela')
  const usuarioAtual = localStorage.getItem('usuarioId')

  await firebase.database().ref('cadColaboradores').orderByChild('nome')
    .on('value', (snapshot) => {
      //Limpamos a tabela
      tabela.innerHTML = ``
      if (!snapshot.exists()) {
        //Se não houver registros/snapshot, exibe uma mensagem
        tabela.innerHTML = `<tr class='table-danger text-center'><td colspan='8'>Ainda não existe nenhum registro cadastrado.</td></tr>`
      } else { //se existir o snapshot, montamos a tabela
        snapshot.forEach(item => {
          const dados = item.val() //Obtém os dados
          const id = item.key // Obtém o id
          const isUsuarioAtual = (dados.usuarioInclusao.uid === usuarioAtual)
          const botaoRemover = isUsuarioAtual
            ? `<button class='btn btn-sm btn-danger' onclick='removeColaborador("${id}")'
        title='Excluir o registro atual'>🗑 Excluir</button>`
            : `🚫indisponível`

          const botaoEditar = isUsuarioAtual
            ? `<button class='btn btn-sm btn-warning' onclick='editarColaborador("${id}")' title='Editar o registro atual'>✎ Editar</button>`
            : ``

          tabela.innerHTML += `
        <tr>
        <td>${dados.nome}</td>
        <td>${dados.cpf}</td>
        <td>${dados.data}</td>
        <td>${dados.sexo}</td>
        <td>${dados.endereco}-${dados.cep}</td>
        <td>${dados.cargo}</td>
        <td>${botaoEditar}  ${botaoRemover}</td>
          </tr>
          `
        })
      }
    })
}

// Função para remover um registro
async function removeColaborador(id) {
  if (confirm('Deseja realmente excluir o cadastro?')) {
    const colaboradorRef = await firebase.database().ref('cadColaboradores/' + id)

    //Remova o registro do Firebase
    colaboradorRef.remove()
      .then(function () {
        alert('Cadastro excluído com sucesso!')
      })
      .catch(function (error) {
        alert(`Erro ao excluir o cadastro: ${error.message}. Tente novamente`)
      })
  }
}

// Função para editar o cadastro
async function editarColaborador(id) {
  if (confirm('Deseja realmente editar o cadastro?')) {
    window.location.href = `${urlApp}/cadColaboradores.html?id=${id}&editar=true`
    //Remova o cadastro do Firebase
    colaboradorRef.editarColaborador()
      .then(function () {
        alert('Cadastro editado com sucesso!')
      })
      .catch(function (error) {
        alert(`Erro ao editar o cadastro: ${error.message}. Tente novamente`)
      })
  }
}

// Carrega dados para edição
document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search)
  const id = params.get('id')
  const editar = params.get('editar')

  if (editar) {
    // Carrega os dados do para edição
    const colaboradorRef = firebase.database().ref(`cadColaboradores/${id}`)
    colaboradorRef.once('value', (snapshot) => {
      const colaboradorData = snapshot.val()
      if (colaboradorData) {
        document.getElementById('nome').value = colaboradorData.nome
        document.getElementById('cpf').value = colaboradorData.cpf
        document.getElementById('data').value = colaboradorData.data
        document.querySelector(`input[name="sexo"][value="${colaboradorData.sexo}"]`).checked = true
        document.getElementById('cep').value = colaboradorData.cep
        document.getElementById('endereco').value = colaboradorData.endereco
        document.getElementById('cargo').value = colaboradorData.cargo
      }
    })
  }
})

//Formatação CPF
const cpf = document.querySelector("#cpf");
cpf.addEventListener("blur", () => {
  let value = cpf.value.replace(/^([\d]{3})([\d]{3})([\d]{3})([\d]{2})$/, "$1.$2.$3-$4");

  cpf.value = value;
});
