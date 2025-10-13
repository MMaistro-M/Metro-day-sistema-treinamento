import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("sistema_treinamentos.html")); // Serve o index.html

const uri = "mongodb+srv://25008814:52586399838.xxxxx.mongodb.net/meu_banco";

mongoose.connect(uri)
  .then(() => console.log("Conectado ao MongoDB Atlas"))
  .catch(err => console.error("Erro ao conectar.. :", err));

const Usuario = mongoose.model("Nome", {
  nome: String,
});

app.post("/api/Nome", async (req, res) => {
  try {
    const nome = new nome(req.body);
    await nome.save();
    res.json({ message: "Nome salvo com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar.. " });
  }
});

app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));
