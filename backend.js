// esta é a conexão com o banco
//mongodb+srv://gugamonca:gmc2007@sitrem.pnltrb7.mongodb.net/?appName=SITREM
//Password: gmc2007

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.CONEXAO_DB;
const client = new MongoClient(uri);

// Conecta no MongoDB
async function conectarAoMongoDB() {
  try {
    await client.connect();
    console.log("Conectado ao MongoDB com sucesso");
  } catch (err) {
    console.error("Erro ao conectar ao MongoDB:", err);
  }
}

// GET: Lista todos os usuários
app.get('/usuarios', async (req, res) => {
  try {
    const db = client.db("SITREM");
    const usuarios = db.collection("Usuarios");

    const lista = await usuarios.find().toArray();
    res.status(200).json(lista);
  } catch (err) {
    res.status(500).send("Erro ao buscar usuários");
  }
});

// POST: Cadastrar novo usuário
app.post('/usuarios', async (req, res) => {
  try {
    const db = client.db("SITREM");
    const usuarios = db.collection("Usuarios");

    await usuarios.insertOne(req.body);
    const listaAtualizada = await usuarios.find().toArray();
    res.status(200).json(listaAtualizada);
  } catch (err) {
    console.error("Erro ao salvar usuário:", err);
    res.status(500).send("Erro ao salvar usuário");
  }
});

// PUT: Editar usuário por ID
app.put('/usuarios/:id', async (req, res) => {
  try {
    const db = client.db("SITREM");
    const usuarios = db.collection("Usuarios");

    const id = req.params.id;
    await usuarios.updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );

    const listaAtualizada = await usuarios.find().toArray();
    res.status(200).json(listaAtualizada);
  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    res.status(500).send("Erro ao atualizar usuário");
  }
});

// DELETE: Excluir usuário por ID
app.delete('/usuarios/:id', async (req, res) => {
  try {
    const db = client.db("SITREM");
    const usuarios = db.collection("Usuarios");

    const id = req.params.id;
    await usuarios.deleteOne({ _id: new ObjectId(id) });

    const listaAtualizada = await usuarios.find().toArray();
    res.status(200).json(listaAtualizada);
  } catch (err) {
    console.error("Erro ao excluir usuário:", err);
    res.status(500).send("Erro ao excluir usuário");
  }
});

// Inicia o servidor
app.listen(3000, async () => {
  await conectarAoMongoDB();
  console.log("Servidor rodando em http://localhost:3000");
});