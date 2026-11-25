/***** IMPORTAÇÃO DOS PACOTES *****/
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
const admin = require('firebase-admin');

/***** CONEXÃO COM O FIRESTORE DATABASE *****/
const keyPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(keyPath)) {
    console.error('Arquivo "serviceAccountKey.json" não encontrado.');
    console.error('Gere a chave no Console do Firebase (Contas de serviço) e salve na raiz do projeto.');
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(require(keyPath))
});

const db = admin.firestore();
const postsCollection = db.collection('posts');

/***** SERVIDOR AUTOCONTIDO + SOCKET.IO *****/
const app = express();
const server = http.createServer(app); // servidor autocontido
const io = new Server(server);         // link do socket.io com o servidor

/***** CONFIGURAÇÃO DO EJS PARA ABRIR O FRONT-END *****/
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

/***** ROTA RAIZ *****/
app.get('/', (req, res) => {
    res.render('index.html');
});

/***** BUSCA DE TODOS OS POSTS JÁ REALIZADOS NO FIRESTORE *****/
async function buscarPosts() {
    const snapshot = await postsCollection.orderBy('data', 'asc').get();

    return snapshot.docs.map((doc) => {
        const post = doc.data();
        return {
            id: doc.id,
            titulo: post.titulo,
            texto: post.texto,
            data: post.data.toDate().toISOString()
        };
    });
}

/***** SOCKET.IO: CONNECTION *****/
io.on('connection', async (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    // previousMessage: envia os posts já cadastrados para quem acabou de conectar
    try {
        const posts = await buscarPosts();
        socket.emit('previousMessage', posts);
    } catch (erro) {
        console.error('Erro ao buscar os posts:', erro);
    }

    // sendMessage: recebe um novo post do front-end, grava no Firestore
    // e distribui para todos os clientes conectados (receivedMessage)
    socket.on('sendMessage', async (dados) => {
        const titulo = String(dados?.titulo ?? '').trim();
        const texto = String(dados?.texto ?? '').trim();

        if (!titulo || !texto) return;

        try {
            const novoPost = { titulo, texto, data: new Date() };
            const ref = await postsCollection.add(novoPost);

            io.emit('receivedMessage', {
                id: ref.id,
                titulo: novoPost.titulo,
                texto: novoPost.texto,
                data: novoPost.data.toISOString()
            });
        } catch (erro) {
            console.error('Erro ao salvar o post:', erro);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${socket.id}`);
    });
});

/***** INICIALIZAÇÃO *****/
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
