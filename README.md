# BD3 - Atividade Rede Social (Firestore)

Protótipo de rede social simples feito para a disciplina **Banco de Dados 3** (Etec Embu - Desenvolvimento de Sistemas).
Os posts são gravados no **Firestore Database** (NoSQL) e distribuídos em tempo real para todos os usuários conectados com **Socket.IO**.

## Tecnologias

- Node.js + Express
- EJS (para servir o front-end)
- Socket.IO (comunicação em tempo real)
- Firebase Admin SDK / Firestore Database
- jQuery (via CDN) no front-end
- nodemon (desenvolvimento)

## Como funciona

| Evento (socket.io) | Quem emite | O que faz |
|---|---|---|
| `connection` | cliente | Abre a conexão com o servidor |
| `previousMessage` | servidor | Envia ao cliente que acabou de entrar todos os posts já salvos no Firestore |
| `sendMessage` | cliente | Envia um novo post (título e texto) preenchido no formulário |
| `receivedMessage` | servidor | Após salvar no Firestore, distribui o novo post para todos os clientes |

Os posts ficam na coleção `posts`, com os campos `titulo`, `texto` e `data`.

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. No [Console do Firebase](https://console.firebase.google.com/), crie um projeto e ative o **Firestore Database**.
3. Em *Configurações do projeto → Contas de serviço*, clique em **Gerar nova chave privada** e salve o arquivo como `serviceAccountKey.json` na raiz do projeto (há um modelo em `serviceAccountKey.example.json`). Esse arquivo está no `.gitignore` e **não deve ser enviado ao GitHub**.
4. Inicie o servidor:
   ```bash
   npm run dev     # com nodemon
   # ou
   npm start
   ```
5. Acesse `http://localhost:3000`. Abra em duas abas para ver os posts chegando em tempo real.

## Estrutura

```
.
├── server.js
├── package.json
├── serviceAccountKey.example.json
└── public/
    ├── index.html
    ├── styles.css
    └── images/rede.png
```

## Observação

O `mongoose` consta nas dependências porque foi pedido no enunciado da atividade, mas o banco utilizado é o Firestore.
