// esta é a conexão com o banco
//mongodb+srv://gugamonca:gmc2007@sitrem.pnltrb7.mongodb.net/?appName=SITREM
//Password: gmc2007

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()
const uniqueValidator = require('mongoose-unique-validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()
app.use(express.json())
app.use(cors())

const stringConexao = process.env.CONEXAO_DB

const usuarioSchema = new mongoose.Schema({
  nome: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  rgm: {type: String, required: true, unique: true},
  funcao: {type: String, required: true},
  cargo: {type: String},
  departamento: {type: String}
})

usuarioSchema.plugin(uniqueValidator)
const Usuario = mongoose.model('Usuarios', usuarioSchema)

async function conectarAoMongoDB() {
  try {
    await mongoose.connect(stringConexao)
    console.log("Conectado ao MongoDB Atlas com sucesso!")
  } catch (erro) {
    console.log("Erro na conexão MongoDB: " + erro.message)
  }
}

//endpoint GET - listar usuarios: http://localhost:3000/usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find()
    res.json(usuarios)
  } catch (error) {
    console.log(error)
    res.status(500).json({ mensagem: 'Erro ao buscar usuários' })
  }
})

//endpoint para cadastrar/criar um usuário (post): http://localhost:3000/usuarios
app.post('/usuarios', async (req, res) => {
  try {
    const { nome, email, rgm, funcao, cargo, departamento } = req.body
    const usuario = new Usuario({
      nome: nome,
      email: email,
      rgm: rgm,
      funcao: funcao,
      cargo: cargo,
      departamento: departamento
    })
    
    const respostaMongo = await usuario.save()
    console.log(respostaMongo)
    
    // Retorna todos os usuários atualizados
    const usuarios = await Usuario.find()
    res.status(201).json(usuarios)
  } catch (error) {
    console.log(error)
    if (error.code === 11000) {
      res.status(409).json({ mensagem: 'Email ou RGM já existente' })
    } else {
      res.status(400).json({ mensagem: 'Erro ao criar usuário' })
    }
  }
})

// Endpoint para atualizar usuário (PUT)
app.put('/usuarios/:id', async (req, res) => {
  try {
    const id = req.params.id
    const updates = req.body
    
    const usuarioAtualizado = await Usuario.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    )
    
    if (!usuarioAtualizado) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' })
    }
    
    const usuarios = await Usuario.find()
    res.json(usuarios)
  } catch (error) {
    console.log(error)
    res.status(400).json({ mensagem: 'Erro ao atualizar usuário' })
  }
})

// Endpoint para deletar usuário (DELETE)
app.delete('/usuarios/:id', async (req, res) => {
  try {
    const id = req.params.id
    const usuarioDeletado = await Usuario.findByIdAndDelete(id)
    
    if (!usuarioDeletado) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' })
    }
    
    const usuarios = await Usuario.find()
    res.json(usuarios)
  } catch (error) {
    console.log(error)
    res.status(400).json({ mensagem: 'Erro ao deletar usuário' })
  }
})

// Endpoint para login do usuário (POST): http://localhost:3000/login
app.post('/login', async (req, res) => {
  try {
    const { email, rgm } = req.body
    const user = await Usuario.findOne({ email: email })
    
    if (!user) {
      return res.status(401).json({ mensagem: 'Email inválido' })
    }
    
    if (user.rgm !== rgm) {
      return res.status(401).json({ mensagem: 'RGM inválido' })
    }
    
    const token = jwt.sign(
      { email: user.email, id: user._id },
      "chave_secreta",
      { expiresIn: '1h' }
    )
    
    res.status(200).json({ 
      token: token,
      usuario: {
        nome: user.nome,
        email: user.email,
        funcao: user.funcao
      }
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ mensagem: 'Erro interno do servidor' })
  }
})

app.listen(3000, async () => {
  try {
    conectarAoMongoDB()
    console.log("server up & running & conexão ok");
  }
  catch (erro) {
    console.log("Erro: " + erro)
  }
})