
function createUser(event){
    event.preventDefault();
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let confirmPassword = document.getElementById('confirmPassword').value;

    if(password != confirmPassword){
        console.log("As senhas não coincidem.");
        alert("As senhas não coincidem!.");
        //document.getElementById('message').innerText = "As senhas não coincidem.";
    }
    else{
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function(){
            console.log("Usuário criado com sucesso.");
            alert("Usuário criado com sucesso!.");
            location.href='index.html';
            //document.getElementById('message').innerText = "Usuário criado com sucesso.";
        })
        .catch(function(error){
            let errorCode = error.code;
            let errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
            document.getElementById('message').innerText = errorMessage;
        });
    }
}

function authenticateUser(event){
    event.preventDefault();
    let email = document.getElementById('emailLogin').value;
    let password = document.getElementById('passwordLogin').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(){
        console.log("Usuário logado com sucesso.");
        let user = firebase.auth().currentUser;
        
        console.log(user);
        if (email.match(/@prefeitura.com*/)) {
            location.href='./PoderPublico/principal_poderPublico.html';
        }
        else {
            location.href='./Usuario/principal_usuario.html';
            sessionStorage.setItem('idUser', user.uid);
            sessionStorage.setItem('idEmail', email);
        }
    })
    .catch(function(error){
        console.log("Usuário não autenticado.");
        let errorCode = error.code;
        let errorMessage = error.message;
        document.getElementById("messageLogin").innerText = errorMessage;
    });
}

function resetUser(event){
    event.preventDefault();
    var emailAddress = document.getElementById('emailLogin').value;
    firebase.auth().sendPasswordResetEmail(emailAddress)
    .then(function() {
        console.log("Email de recuperação Enviado!.");
        alert("Email de recuperação Enviado!.");
        document.location.reload();
    }).catch(function(error) {
        console.log("Não foi possível resetar a senha.");
        let errorCode = error.code;
        let errorMessage = error.message;
        document.getElementById("messageLogin").innerText = errorMessage;
    });
}

function deleteUset(event){
    event.preventDefault();
    var user = firebase.auth().currentUser;

    user.delete().then(function() {
        console.log("Usuário deletado com Sucesso!.");
        alert("Usuário deletado com Sucesso!.");
        document.location.reload();
    }).catch(function(error) {
        console.log("Não foi possível deletar o usuário.");
        let errorCode = error.code;
        let errorMessage = error.message;
        document.getElementById("messageLogin").innerText = errorMessage;
    });
}

var files = [];
var NomeImagem;

function escolherImg() {
    var reader;
    var input = document.createElement('input');
    input.type = 'file';
    input.click();

    input.onchange = e => {
        files = e.target.files;
        reader = new FileReader();
        reader.onload = function () {
            document.getElementById("imgVisualizar").src = reader.result;
            
            NomeImagem = files[0].name;
            //console.log(NomeImagem);
        }
        reader.readAsDataURL(files[0]);
    }
    input.click;
}

function enviarDados() {
    var storage = firebase.storage();
    var controle = 0;

    var local = document.getElementById("Local").value;
    var desc = document.getElementById("Descricao").value;

    if(local == "") {
        alert("O campo local deve ser preenchido!.");
        controle++;
    }
    else if(desc == "") {
        alert("O campo descrição deve ser preenchido!.")
        controle++;
    }
    else if(NomeImagem == null) {
        alert("Selecione uma imagem!.");
        controle++;
    }
    else {
        var imgName = NomeImagem.split('.')[0];
    }

    if(local.length > 100) {
        alert("O campo local deve ter no máximo 100 caracteres!.");
        controle++;
    }
    else if (desc.length > 500){
        alert("O campo descrição deve ter no máximo 500 caracteres!.");
        controle++;
    }
    
    if(controle == 0) {
        var imgNameFormato = NomeImagem;
        var path = "images/" + imgNameFormato;
        var uploadTask = firebase.storage().ref(path).put(files[0]);

        var uploadTask = firebase.storage().ref("images/" + imgNameFormato).put(files[0]);
        var imgUrl;

        var status = "Cadastrado";
        var resposta = "Aguardando";
        
        var user = sessionStorage.getItem('idUser');
        var email = sessionStorage.getItem('idEmail');

        uploadTask.on('state_changed', function (snapshot) {
        },
            function(error) {
                console.log("error");
            },
            function () {
                uploadTask.snapshot.ref.getDownloadURL().then(function (url){
                    imgUrl = url;

                    firebase.database().ref(user + "/" + imgName).set({
                        Name: imgName,
                        url: imgUrl,
                        Local: local,
                        Descricao: desc,
                        Status: status,
                        Resposta: resposta,
                        Email: email,
                        Imagem: imgNameFormato,
                        Usuario: user
                    });

                    firebase.database().ref('users/' + user).set({
                        Name: user
                    });
                    console.log("Adicionado ao Firebase");
                    alert("Problema cadastrado com Sucesso!.");
                    document.getElementById("Local").value = null;
                    document.getElementById("Descricao").value = null;
                    document.getElementById("imgVisualizar").src = null;
                }
            );
        });
        console.log("Concluido");
    }
}

function listarProblemas() {
    var userId = sessionStorage.getItem('idUser');
    var email = sessionStorage.getItem('idEmail');
    var $wrapper;

    return firebase.database().ref(userId+'/').orderByChild("Email").equalTo(email).once('value').then((snapshot) => {
        snapshot.forEach(function(childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            
            $wrapper = document.querySelector('.listaProblemas'),
            HTMLTemporario = $wrapper.innerHTML,
            HTMLNovo = '<option value="'+ childData.Name +'">'+ childData.Name +'</option>';
            HTMLTemporario = HTMLTemporario + HTMLNovo;
            $wrapper.innerHTML = HTMLTemporario;

        });
    });
}

function buscarProblema() {
    var userId = sessionStorage.getItem('idUser');
    var idProblema = document.getElementById("listaProblemas").value;

    return firebase.database().ref(userId+'/').orderByChild("Name").equalTo(idProblema).once('value').then((snapshot) => {
        snapshot.forEach(function(childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            
            document.getElementById("Local").value = childData.Local;
            document.getElementById("Descricao").value = childData.Descricao;
        });
    });
}

function atualizaDados() {
    var user = sessionStorage.getItem('idUser');
    var desc = document.getElementById("Descricao").value;
    var idProblema = document.getElementById("listaProblemas").value;

    if(desc == "") {
        alert("O campo descrição deve ser preenchido!.")
    }
    else if (desc.length > 500) {
        alert("O campo descrição deve ter no máximo 500 caracteres!.");
    }
    else {
        firebase.database().ref(user+'/'+idProblema+'/')
        .update({ Descricao: desc });

        console.log("Problema Atualizado com Sucesso!.");
        alert("Problema Atualizado com Sucesso!.");
        document.location.reload();
    }
}

function listarProblema() {
    var userId = sessionStorage.getItem('idUser');
    var idProblema = document.getElementById("listaProblemas").value;

    return firebase.database().ref(userId+'/').orderByChild("Name").equalTo(idProblema).once('value').then((snapshot) => {
        snapshot.forEach(function(childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            
            document.getElementById("Local").value = childData.Local;
            document.getElementById("Descricao").value = childData.Descricao;
            document.getElementById("Status").value = childData.Status;
            document.getElementById("Resposta").value = childData.Resposta;
            var image = childData.Imagem;

            var storage = firebase.storage();
            
            firebase.storage().ref().child('images/' + image).getDownloadURL().then(function(url) {
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function(event) {
                  var blob = xhr.response;
                };
                xhr.open('GET', url);
                xhr.send();
              
                var img = document.getElementById('imgVisualizar');
                img.src = url;
            });
        });
    });
}

function excluirDados() {
    let opcaoExcluir = confirm("Deseja realmente EXCLUIR esse problema?");
    
    if(opcaoExcluir){
        var user = sessionStorage.getItem('idUser');
        var desc = document.getElementById("Descricao").value;
        var idProblema = document.getElementById("listaProblemas").value;
        
        firebase.database().ref(user+'/'+idProblema+'/')
            .remove();

        document.getElementById("Descricao").value = null;
        document.getElementById("Local").value = null;

        console.log("Problema exclúido com Sucesso!.");
        alert("Problema exclúido com Sucesso!.");
        document.location.reload();
    }
}

function listarAnonimo() {
    var $wrapper;

    return firebase.database().ref('users/').orderByChild("Name").once('value').then((snapshot) => {
        snapshot.forEach(function(childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            
            firebase.database().ref(childData.Name).orderByChild("Name").once('value').then((snapshot) => {
                snapshot.forEach(function(childSnapshot) {
                    var key = childSnapshot.key;
                    var childData = childSnapshot.val();
                    $wrapper = document.querySelector('.listaProblemas'),
                    HTMLTemporario = $wrapper.innerHTML,
                    HTMLNovo = '<option id="'+ childData.Name +'" value="'+ childData.Usuario +'">'+ childData.Name +'</option>';
                    HTMLTemporario = HTMLTemporario + HTMLNovo;
                    $wrapper.innerHTML = HTMLTemporario;
                });
            });
        });
    });
}

function listarProblemaAnonimo() {
    var idProblema = document.getElementById("listaProblemas").value;

    var select = document.querySelector('select');
    var option = select.children[select.selectedIndex];
    var texto = option.textContent;

    return firebase.database().ref(idProblema).orderByChild("Name").equalTo(texto).once('value').then((snapshot) => {
        snapshot.forEach(function(childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            
            document.getElementById("Local").value = childData.Local;
            document.getElementById("Descricao").value = childData.Descricao;
            document.getElementById("Status").value = childData.Status;
            document.getElementById("Resposta").value = childData.Resposta;
            var image = childData.Imagem;

            var storage = firebase.storage();
            
            firebase.storage().ref().child('images/' + image).getDownloadURL().then(function(url) {
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function(event) {
                  var blob = xhr.response;
                };
                xhr.open('GET', url);
                xhr.send();
              
                var img = document.getElementById('imgVisualizar');
                img.src = url;
            });
        });
    });
}

function atualizarProblemaAnonimo() {
    var status = document.getElementById("Status").value;
    var resposta = document.getElementById("Resposta").value;

    var select = document.querySelector('select');
    var option = select.children[select.selectedIndex];
    var idProblema = option.textContent;
    var user = document.getElementById("listaProblemas").value;


    firebase.database().ref(user+'/'+idProblema+'/')
        .update({ 
            Status: status,
            Resposta: resposta
        });

    console.log("Problema Atualizado com Sucesso!.");
    alert("Problema Atualizado com Sucesso!.");
    document.location.reload();
}