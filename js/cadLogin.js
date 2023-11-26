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
const urlApp = 'http://127.0.0.1:5500'

// Referência para o formulário de cadastro no HTML
const formCadastro = document.getElementById('formCadastro')

// Adicionando um ouvinte para o envio do formulário
formCadastro.addEventListener('submit', async function (event) {
    event.preventDefault()

    // Obtendo os valores dos campos do formulário
    const nome = document.getElementById('nome').value
    const cpf = document.getElementById('cpf').value
    const email = document.getElementById('email').value
    const senha = document.getElementById('senha').value

    try {
        // Criando um usuário no Firebase Authentication
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, senha)
        const user = userCredential.user

        // Adicionando informações adicionais do usuário ao Realtime Database
        await firebase.database().ref('usuarios/' + user.uid).set({
            nome,
            cpf,
            email
        })

        alert('Usuário cadastrado com sucesso!')

        //Redireciona para a tela de login
        window.location.href = `${urlApp}/index.html`

    } catch (error) {
        // Tratando erros
        const errorCode = error.code
        const errorMessage = error.message
        console.error('Erro ao cadastrar usuário:', errorCode, errorMessage)
        alert(`Erro ao cadastrar usuário: ${errorMessage}`)
    }
})

// Referência para o botão de voltar
const voltar = document.getElementById('voltar')

// Adicionando um ouvinte para o clique no botão de voltar
voltar.addEventListener('click', function () {
    // Redireciona para a tela de login ao clicar no botão "Voltar"
    window.location.href = `${urlApp}/index.html`
})

//Formatação CPF
const cpf = document.querySelector("#cpf");

cpf.addEventListener("blur", () => {
  let value = cpf.value.replace(/^([\d]{3})([\d]{3})([\d]{3})([\d]{2})$/, "$1.$2.$3-$4");
  
  cpf.value = value;
});

