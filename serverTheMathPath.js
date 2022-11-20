const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text());

const cors = require("cors");

// Resolvendo o CORS em desenvolvimento
app.use((req, res, next) => {
    //Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
       res.header("Access-Control-Allow-Origin", "*");
    //Quais são os métodos que a conexão pode realizar na API
       res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
       app.use(cors());
       next();
});

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://marilia_vaz:Gato1508@clinica-cloud-sp.ogg4e.mongodb.net/the-mathpath?retryWrites=true&w=majority";
const myDatabase = "the-mathpath";

//Criando variável global para flagWinStreak
var flagWinStreakServer = false;

app.get('/leitura', (req, res) => {

    //Lendo collection USUÁRIOS
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(myDatabase);
        dbo.collection("USUARIOS").find({}).toArray(function(err, result) {
          if (err) throw err;

          console.log(result);
          res.json(result); //enviando como objeto JSON


          db.close();
        });
      });

 }); //end of leitura

app.post('/cadastro', (req, res) => {
  console.log("\n---Rota cadastro---");
  console.log('Got body:', req.body);

    //Recebendo variáveis do formulário
    var nomeServer = req.body.nome;
    var idadeServer = req.body.idade;
    var serieServer = req.body.serie;
    var emailServer = req.body.email;
    var senhaServer = req.body.senha;
    var senhaConfirmadaServer = req.body.senhaConfirmada;

    //Obtendo data de cadastro do usuário
    const date = new Date();
    const diaCadastro = date.getDate();
    const mesCadastro = date.getMonth() + 1;
    const anoCadastro = date.getFullYear();
    const dataCadastro = diaCadastro + "/" + mesCadastro + "/" + anoCadastro;

    //Certificando que senha e senhaConfirmada são as mesmas
    if(senhaServer != senhaConfirmadaServer){
        console.log("Confirmação de senha inválida.");
        res.send("Confirmação de senha inválida.");
        return;
    }

    //Inserindo dados no banco de dados
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(myDatabase);

        var myobj = { _id: emailServer, email: emailServer, nome: nomeServer, idade: idadeServer, serie: serieServer, senha: senhaServer, senhaConfirmada: senhaConfirmadaServer, moedas: 0, itens: ["Relógio Místico"], dataCadastro: dataCadastro};

        dbo.collection("USUARIOS").insertOne(myobj, function(err, result) {

          if (typeof result == "undefined") {
              console.log("Email já em uso. Cadastre com novo email.");
              res.send("Email já em uso. Cadastre com novo email.");
          } else {
            console.log("1 document inserted");
            console.log(result);
            res.send("Usuário cadastrado com sucesso.");
          }
          db.close();
        });
      });
      
}); //end of cadastro

app.post('/login', (req, res) => {
  console.log("\n---Rota login---");
  console.log('Got body:', req.body);

  //Recebendo variáveis do formulário
  var emailServer = req.body.email.toString();
  var senhaServer = req.body.password.toString();

  //Find para localizar email fornecido na base
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(myDatabase);
    var query = { email: emailServer, senha: senhaServer };
    dbo.collection("USUARIOS").find(query).toArray(function(err, result) {
      if(result.length != 0) {
        console.log("Login efetuado com sucesso.");
        res.send("Login efetuado com sucesso.");
        console.log(result);
      } else{
          console.log("Usuário ou senha inválidos.");
          res.send("Usuário ou senha inválidos.");
      }   

      db.close();
    });
  });

}); //end of login

app.post('/cadastroQuestoes', (req, res) => {
  console.log("\n---Rota cadastroQuestoes---");
  console.log('Got body:', req.body);

    //Recebendo variáveis do formulário
    var enunciadoServer = req.body.enunciadoForm.toString();
    var respostaServer = req.body.respostaForm.toString();
    var alternativa1Server = req.body.alternativa1Form.toString();
    var alternativa2Server = req.body.alternativa2Form.toString();
    var alternativa3Server = req.body.alternativa3Form.toString();
    var alternativa4Server = req.body.alternativa4Form.toString();
    var alternativa5Server = req.body.alternativa5Form.toString();
    var resolucaoServer = req.body.resolucaoForm.toString();
    var idServer = req.body.idForm.toString();
    var filtroServer = idServer.substring(0,3);

    /*console.log("enunciadoServer: "+enunciadoServer+", respostaServer: "+respostaServer+
                ", alternativa1Server: "+alternativa1Server+", alternativa2Server: "+alternativa2Server+
                ", alternativa3Server: "+alternativa3Server+", alternativa4Server: "+alternativa4Server+
                ", alternativa5Server: "+alternativa5Server+", resolucaoServer: "+resolucaoServer+", idServer: "+idServer);*/

    //Inserindo dados no banco de dados
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db(myDatabase);

      var myobj = { _id: idServer, enunciado: enunciadoServer, resposta: respostaServer, alternativa1: alternativa1Server,
                    alternativa2: alternativa2Server, alternativa3: alternativa3Server, alternativa4: alternativa4Server, 
                    alternativa5: alternativa5Server, resolucao: resolucaoServer, filtro: filtroServer};

      dbo.collection("QUESTOES").insertOne(myobj, function(err, result) {

        if (typeof result == "undefined") {
            console.log("Erro ao inserir a questão.");
            res.send("Erro ao inserir a questão.");
        } else {
          console.log("1 document inserted");
          console.log(result);
          res.send("Questão cadastrada com sucesso!");
        }
        db.close();
      });
    });

}); //end of cadastroQuestoes

app.post('/recuperaSerie', (req, res) => {
  console.log("\n---Rota recuperaSerie---");
  console.log('Got body:', req.body);

  //Recuperando série do usuário a partir do emailForm 
  var emailRecuperadoServer = req.body.email;
  var dadosUsuario = 0;

  MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db(myDatabase);
      var querySerie = { email: emailRecuperadoServer };
      dbo.collection("USUARIOS").find(querySerie).toArray(function(err, result) {
      if (err) throw err;
      dadosUsuario = result[0].serie+","+result[0].dataCadastro; 
      res.send(dadosUsuario);
      db.close();
      });
  });
  
}); //end of recuperaSerie

app.post('/verificaJogada', (req, res) => {
  console.log("\n---Rota verificaJogada---");
  console.log('Got body:', req.body);

  var parametrosServer = req.body.parametros.toString(); //"_id" da tabela JOGADAS
  var indiceServer;
  var valorLista;
  var envioServer;
  var filtroQuestao;
  var flagRetryServer = req.body.flagRetryGlobal;

  //preparando filtro para leitura na tabela QUESTOES
  var parseVar = [];
  parseVar = parametrosServer.split(",");
  filtroQuestao = parseVar[3]+parseVar[1]+parseVar[2];

  //pegando a flag de retry dos parametros
  
  //Buscando última jogada do usuário na tabela JOGADAS
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(myDatabase);
    var querySerie = { _id: parametrosServer };
    dbo.collection("JOGADAS").find(querySerie).toArray(function(err, result) {
      if(result.length != 0 && flagRetryServer == "false") {
        console.log(result);

        indiceServer = parseInt(result[0].indice);
        valorLista = result[0].listaQuestoes[indiceServer];

        console.log("indiceServer: " + indiceServer);
        console.log("valorLista: " + valorLista);

        envioServer = { indice: indiceServer, valorLista: valorLista };

        res.json(envioServer);
      } else {
        //Buscando quantidade (length) de questões condizentes com o filtro para dar randomize
        var listaQuestoes = [];

        MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db(myDatabase);
          var query = { filtro: filtroQuestao };
          dbo.collection("QUESTOES").find(query).toArray(function(err, resultQuestoes) {
            if (err) throw err;
            listaQuestoes = randomize(resultQuestoes.length);

            //zerando jogada e pegando novo valorLista
            indiceServer = 0;
            valorLista = listaQuestoes[0];

            //em caso de retry, zerando índice e gerando nova listaQuestoes
            if(result.length != 0 && flagRetryServer == "true"){
              MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                var dbo = db.db(myDatabase);
                var myquery = { _id: parametrosServer };
                var newvalues = { $set: { indice: 0, listaQuestoes: listaQuestoes, acertos: 0, erros: 0, pontuacao: 0, winStreak: 0, flagWinStreak: false } };
                dbo.collection("JOGADAS").updateOne(myquery, newvalues, function(err, result2) {
                  if (err) throw err;
                  console.log("Retry efetuado.");
                  
                  envioServer = { indice: indiceServer, valorLista: valorLista };
                  //flagRetry = "false";
                  res.json(envioServer);
                });
              });
            } else {
               //Inserindo índice 0 e listaQuestoes em caso do jogador não ter explorado esse mapa ainda
              MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                var dbo = db.db(myDatabase);  
                var myobj = { _id: parametrosServer, indice: 0, listaQuestoes: listaQuestoes, acertos: 0, erros: 0, pontuacao: 0, winStreak: 0, flagWinStreak: false };  
                dbo.collection("JOGADAS").insertOne(myobj, function(err, result3) {
                envioServer = { indice: indiceServer, valorLista: valorLista };
                //flagRetry = "false";
                res.json(envioServer);
                }); 
                }); //end of connect JOGADAS 2   
              } //end of else 2 
          });
        }); //end of connect QUESTOES

      }  //end of else 1
    db.close();
    });
 }); //end of connect JOGADAS 1
}); //end of verificaJogada

app.post('/incrementaIndice', (req, res) => {
  console.log("\n---Rota incrementaIndice---");
  console.log('Got body:', req.body);

  var parametrosServer = req.body.parametros.toString();
  var indiceServer = req.body.novoIndice.toString();

  //indiceServer = parseInt(indiceServer);

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(myDatabase);
    var myquery = { _id: parametrosServer };
    var newvalues = { $set: { indice: indiceServer } };
    dbo.collection("JOGADAS").updateOne(myquery, newvalues, function(err, result) {
      if (err) throw err;
      console.log("Índice de jogada atualizado.");
      db.close();
    });
  });

  res.send(indiceServer);

}); //end of incrementaIndice

app.post('/incrementaAcerto', (req, res) => {
  console.log("\n---Rota incrementaAcerto---");
  console.log('Got body:', req.body);

  var parametrosServer = req.body.filtro.email+","
                        +req.body.filtro.modulo+","
                        +req.body.filtro.dificuldade+","
                        +req.body.filtro.serie;
  var nAcertos;
  var pontuacaoServer;
  var winStreakServer;
  flagWinStreakServer = false;

  //Parse para identificar dificuldade do mapa (número de fases)
  var dificuldadeServer = req.body.filtro.dificuldade;
  var emailServer = req.body.filtro.email;

  //Fazendo a leitura do número de acertos, pontuação e winStreak
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(myDatabase);
    var query = { _id: parametrosServer };
    dbo.collection("JOGADAS").find(query).toArray(function(err, result) {
      if (err) throw err;
      
      nAcertos = result[0].acertos;
      nAcertos++;

      //Verificando o número de fases para calcular o incremento de pontuação; F = 5, M = 10, D = 15
      pontuacaoServer = result[0].pontuacao;

      if(dificuldadeServer == "F"){
        pontuacaoServer = pontuacaoServer + 300;
      } else if(dificuldadeServer == "M"){
        pontuacaoServer = pontuacaoServer + 150;
      } else if(dificuldadeServer == "D"){
        pontuacaoServer = pontuacaoServer + 100;
      }

      //Verificando se o usuário conseguiu winStreak (3 acertos consecutivos)
      winStreakServer = result[0].winStreak;
      winStreakServer++;
      if(winStreakServer == 3){
        flagWinStreakServer = true;
        winStreakServer = 0;

        //atualizar as moedas bônus do usuário
        incrementaMoedas(emailServer,3);
      }

      //Fazendo update do número de acertos 
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(myDatabase);
        var newvalues = { $set: { acertos: nAcertos, pontuacao: pontuacaoServer, winStreak: winStreakServer, flagWinStreak: flagWinStreakServer } };
        dbo.collection("JOGADAS").updateOne(query, newvalues, function(err, result) {
          if (err) throw err;
          console.log("Número de acertos atualizado.");
        });
      });

      db.close();
    });
  }); //end of connect JOGADAS 1

  res.send();
}); //end of incrementaAcerto

app.post('/incrementaErro', (req, res) => {
  console.log("\n---Rota incrementaErro---");
  console.log('Got body:', req.body);

  var parametrosServer = req.body.filtro.email+","
                        +req.body.filtro.modulo+","
                        +req.body.filtro.dificuldade+","
                        +req.body.filtro.serie;
  var nErros;
  flagWinStreakServer = false;

  //Fazendo a leitura do número de erros
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(myDatabase);
    var query = { _id: parametrosServer };
    dbo.collection("JOGADAS").find(query).toArray(function(err, result) {
      if (err) throw err;
      
      nErros = result[0].erros;
      nErros++;

      //Fazendo update do número de erros, zerando winStreak no banco e voltando flag para false
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(myDatabase);
        var newvalues = { $set: { erros: nErros, winStreak: 0, flagWinStreak: false } };
        dbo.collection("JOGADAS").updateOne(query, newvalues, function(err, result) {
          if (err) throw err;
          console.log("Número de erros atualizado.");
        });
      });

      db.close();
    });
  }); //end of connect JOGADAS 1

  res.send();
}); //end of incrementaErro

app.post('/getResultado', (req, res) => {
  console.log("\n---Rota getResultado---");
  console.log('Got body:', req.body);

  var parametrosServer = req.body.parametros.toString();
  var pontuacaoServer;
  
  var parseVar = [];
  parseVar = parametrosServer.split(",");
  var emailServer = parseVar[0];

  //Pegando número de acertos e erros do registro JOGADA
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(myDatabase);
    var query = { _id: parametrosServer };
    dbo.collection("JOGADAS").find(query, { projection: { _id: 0, acertos: 1, erros: 1, pontuacao: 1 } }).toArray(function(err, result) {
      if (err) throw err;

      console.log(result);

      //Resetando flagWinStreak para false após o fim do jogo
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(myDatabase);
        var newvalues = { $set: { winStreak: 0, flagWinStreak: false } };
        dbo.collection("JOGADAS").updateOne(query, newvalues, function(err, result2) {
          if (err) throw err;
        });
      });
      db.close();

      //Calculando número de moedas baseado na pontuação do usuário
      pontuacaoServer = result[0].pontuacao;
      if(pontuacaoServer == 1500){
        incrementaMoedas(emailServer,10);
      } else if (pontuacaoServer > 749 && pontuacaoServer < 1500){
        incrementaMoedas(emailServer,5);
      } else if (pontuacaoServer > 0 && pontuacaoServer <= 749) {
        incrementaMoedas(emailServer,3);
      } else {
        incrementaMoedas(emailServer,0);
      }

      res.send(result);
    });
  });

  return;
}); //end of getResultado

app.post('/jogar', (req, res) => {
  console.log("\n---Rota jogar---");
  console.log('Got body:', req.body);

  //Fazendo split do filtro
  var parseVar = req.body.parametros.split(',');

  //Recuperando dados do jogador 
  var emailServer = parseVar[0];
  var flagModuloServer = parseVar[1];
  var flagDificuldadeServer = parseVar[2];
  var serieServer = parseVar[3];
  var valorListaServer = req.body.valorLista.toString();

  //Montando filtro de busca para query baseado nas escolhas e perfil do jogador
  var filtroBuscaQuestoes = serieServer+flagModuloServer+flagDificuldadeServer;

  //Declarando variável para recuperar e enviar o índice posteriormente
  var indice;

  //Recuperando resultados do banco baseado no filtro
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(myDatabase);
    var query = { filtro: filtroBuscaQuestoes };
    dbo.collection("QUESTOES").find(query).toArray(function(err, result) {
      if (err) throw err;
      
      //Escolher a questão
      var nQuestao = parseInt(valorListaServer);  

      //Envio das questões para o client
      var envioEnunciado = result[nQuestao].enunciado;
      var envioAlternativa1 = { alternativa: result[nQuestao].resposta.toString(), status: true }; //resposta correta
      var envioResolucao = result[nQuestao].resolucao;
      var envioFiltro = result[nQuestao].filtro;

      var sortAlternativas = []; 
      sortAlternativas[0] = result[nQuestao].alternativa1.toString();
      sortAlternativas[1] = result[nQuestao].alternativa2.toString();
      sortAlternativas[2] = result[nQuestao].alternativa3.toString();
      sortAlternativas[3] = result[nQuestao].alternativa4.toString();
      sortAlternativas[4] = result[nQuestao].alternativa5.toString();

      //Escolher 3 alternativas randomicamente
      var arrayAlternativas = randomize(sortAlternativas.length); //retorna lista com índices do array randomizados
      var nAlternativas = arrayAlternativas[0];
      var envioAlternativa2 = { alternativa: sortAlternativas[nAlternativas].toString(), status: false }; //alternativa incorreta      

      nAlternativas = arrayAlternativas[1];
      var envioAlternativa3 = { alternativa: sortAlternativas[nAlternativas].toString(), status: false }; //alternativa incorreta  

      nAlternativas = arrayAlternativas[2];
      var envioAlternativa4 = { alternativa: sortAlternativas[nAlternativas].toString(), status: false }; //alternativa incorreta  

      //Sorteando ordem das alternativas
      sortAlternativas = [];
      sortAlternativas[0] = envioAlternativa1; //resposta
      sortAlternativas[1] = envioAlternativa2;
      sortAlternativas[2] = envioAlternativa3;
      sortAlternativas[3] = envioAlternativa4;

      arrayAlternativas = [];
      arrayAlternativas = randomize(sortAlternativas.length); //retorna lista com índices de array randomizados
      nAlternativas = arrayAlternativas[0];

      var alternativasJSON = [];
      alternativasJSON[0] = sortAlternativas[nAlternativas];

      nAlternativas = arrayAlternativas[1];
      alternativasJSON[1] = sortAlternativas[nAlternativas];

      nAlternativas = arrayAlternativas[2];
      alternativasJSON[2] = sortAlternativas[nAlternativas];

      nAlternativas = arrayAlternativas[3];
      alternativasJSON[3] = sortAlternativas[nAlternativas];

      
      console.log("enunciado: "+envioEnunciado);
      console.log(alternativasJSON);
      console.log("resolucao: "+envioResolucao);
      console.log("filtro: "+envioFiltro);

      //Pegando flagWinStreak de JOGADAS
      idServer = emailServer+","+flagModuloServer+","+flagDificuldadeServer+","+serieServer;
      var flagWinStreakServerLocal = new Boolean;

      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(myDatabase);
        var query = { _id: idServer };
        dbo.collection("JOGADAS").find(query).toArray(function(err, result) {
          if (err) throw err;
          flagWinStreakServerLocal = result[0].flagWinStreak;
          indice = result[0].indice;

          //Instanciando variável flagWinStreakServer global com a local
          flagWinStreakServer = flagWinStreakServerLocal;

          //Montando JSON para envio ao client, com a flag
          res.send({ enunciado: envioEnunciado, alternativas: alternativasJSON, resolucao: envioResolucao, filtro: envioFiltro, flagWinStreak: flagWinStreakServerLocal, indice: indice });
        });
      });

      db.close();
    });
  });

}); //end of jogar

app.post('/lerPerfil', (req, res) => {
  console.log("\n---Rota lerPerfil---");
  console.log('Got body:', req.body);

  //Pegando email do usuário
  var emailUsuario = req.body.email;
  
  var nomeUsuario;
  var serieUsuario;
  var moedasUsuario;
  var itensUsuario = [];

  //Lendo collection USUÁRIOS
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(myDatabase);
    var query = { _id: emailUsuario };
    dbo.collection("USUARIOS").find(query).toArray(function(err, result) {
      if (err) throw err;

      //coletando dados do perfil
      nomeUsuario = result[0].nome;
      serieUsuario = result[0].serie; 
      moedasUsuario = result[0].moedas;
      itensUsuario = result[0].itens;

      res.send({ nome: nomeUsuario, serie: serieUsuario, moedas: moedasUsuario, itens: itensUsuario });

      db.close();
    });
    });

}); //end of lerPerfil

app.post('/lerLoja', (req, res) => {
  console.log("\n---Rota lerLoja---");
  console.log('Got body:', req.body);

  //Pegando email do usuário
  var idItem = req.body.id;
  
  var nomeItem;
  var descricaoItem;
  var precoItem;

  //Lendo collection LOJA
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(myDatabase);
    var query = { _id: idItem };
    dbo.collection("LOJA").find(query).toArray(function(err, result) {
      if (err) throw err;

      //coletando dados do perfil
      nomeItem = result[0].nome;
      descricaoItem = result[0].descricao; 
      precoItem = result[0].preco;

      res.send({ nome: nomeItem, descricao: descricaoItem, preco: precoItem });

      db.close();
    });
    });

}); //end of lerLoja

app.post('/atualizaMochila', (req, res) => {
  console.log("\n---Rota atualizaMochila---");
  console.log('Got body:', req.body);

  //Pegando email do usuário
  var nomeItem = [];
  var email = req.body.email;
  var saldo = req.body.saldo;
  var pusher;

  // lendo collection USUARIOS
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(myDatabase);
    var query = { _id: email };
    dbo.collection("USUARIOS").find(query).toArray(function(err, result) {
      if (err) throw err;

      //coletando dados da mochila
      nomeItem = result[0].itens;
      nomeItem.push(req.body.nomeItem);

          //atualizando collection USUARIOS
          MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db(myDatabase);
            var myquery = { _id: email };
            var newvalues = { $set: { moedas: saldo, itens: nomeItem } };
            dbo.collection("USUARIOS").updateOne(myquery, newvalues, function(err, res) {
              if (err) throw err;
              console.log("Mochila atualizada.");
              console.log(nomeItem);
            });
          });

      db.close();
    });
    });


}); //end of atualizaMochila

app.post('/limparJogada', (req, res) => {
  console.log("\n---Rota limparJogada---");
  console.log('Got body:', req.body);

  //Recebendo filtro 
  var parametrosServer = req.body.parametros;

  //Excluindo registro após o jogador completar a fase
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(myDatabase);
    var myquery = { _id: parametrosServer };
    dbo.collection("JOGADAS").deleteOne(myquery, function(err, obj) {
      if (err) throw err;
      console.log("Jogada deletada com sucesso.");

      res.send("Jogada deletada com sucesso.")
      db.close();
    });
  });

}); //end of limparJogada

// ======= FUNÇÕES INDIVIDUAIS =======

//Função de randomização da ordem
function randomize(max){

  //Gerando lista ordenada
  let list = [];

  for (let i = 0; i < max; i++) {
    list[i] = i;
  }
  //console.log("lista original: "+list); 

  //Randomizando a lista
  let randomNumber;
  let tmp;
  
  for (let i = list.length; i;) {
      randomNumber = Math.random() * i-- | 0;
      tmp = list[randomNumber];
      // troca o número aleatório pelo atual
      list[randomNumber] = list[i];
      // troca o atual pelo aleatório
      list[i] = tmp;
  }
  //console.log("nova lista: "+list);
  return(list);

} //end of randomize

function incrementaMoedas(email,qtd){
  
  var moedasServer;

  //Leitura das moedas dos USUARIOS
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(myDatabase);
    var query = { _id: email };
    dbo.collection("USUARIOS").find(query).toArray(function(err, result) {
      if (err) throw err;

      //Incrementando moedas
      moedasServer = result[0].moedas;
      moedasServer = moedasServer + qtd;      

      //Atualizando quantidade de moedas dos USUARIOS
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(myDatabase);
        var newvalues = { $set: { moedas: moedasServer } };
        dbo.collection("USUARIOS").updateOne(query, newvalues, function(err, result) {
          if (err) throw err;

          console.log("Moedas atualizadas com sucesso.");
        });
      }); //end of connect. update

      db.close();
    });
  }); //end of connect. find
} //end of incrementaMoedas

 app.listen(3333, () => console.log('Started server at http://localhost:3333!'));
