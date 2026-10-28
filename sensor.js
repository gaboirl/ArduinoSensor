require("dotenv").config();

const express = require("express");
const { MongoClient } = require("mongodb");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const app = express();
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

// IMPORTANTE: troca COM3 pela porta do teu ESP32.
// Exemplos: COM3, COM4, COM5.
const PORTA_ESP32 = "COM3";
const VELOCIDADE_SERIAL = 115200;

async function iniciarServidor() {
  await client.connect();
  console.log("Conectado ao MongoDB!");

  const db = client.db("sensorDB");
  const colecao = db.collection("distancias");

  // Recebimento pela USB serial do ESP32
  const porta = new SerialPort({
    path: PORTA_ESP32,
    baudRate: VELOCIDADE_SERIAL,
    autoOpen: false
  });

  const parser = porta.pipe(
    new ReadlineParser({ delimiter: "\n" })
  );

  porta.on("open", () => {
    console.log(`ESP32 conectado na porta ${PORTA_ESP32}`);
  });

  porta.on("error", (erro) => {
    console.error("Erro na porta serial:", erro.message);
  });

  porta.on("close", () => {
    console.log("Porta serial fechada.");
  });

  parser.on("data", async (linha) => {
    try {
      const texto = linha.trim();

      if (!texto) return;

      const dados = JSON.parse(texto);

      // Ignora mensagens de inicialização
      if (dados.status) {
        console.log("ESP32:", dados.status);
        return;
      }

      // Informa quando o sensor não recebe eco
      if (dados.erro) {
        console.log("Sensor:", dados.erro);
        return;
      }

      const distancia = Number(dados.distancia);

      if (!Number.isFinite(distancia) || distancia < 0) {
        console.log("Medida inválida:", texto);
        return;
      }

      const resultado = await colecao.insertOne({
        distancia,
        unidade: "cm",
        data: new Date()
      });

      console.log(
        `Distância salva: ${distancia} cm | ID: ${resultado.insertedId}`
      );
    } catch (erro) {
      console.error("Erro ao processar dado serial:", erro.message);
      console.error("Linha recebida:", linha);
    }
  });

  porta.open((erro) => {
    if (erro) {
      console.error(
        `Não foi possível abrir ${PORTA_ESP32}: ${erro.message}`
      );
      console.error(
        "Confere a porta COM e fecha o Monitor Serial do Arduino."
      );
    }
  });

  // Mantém também a API HTTP existente
  app.post("/distancia", async (req, res) => {
    try {
      const distancia = Number(req.body.distancia);

      if (!Number.isFinite(distancia) || distancia < 0) {
        return res.status(400).json({
          erro: "Distancia invalida"
        });
      }

      const resultado = await colecao.insertOne({
        distancia,
        unidade: "cm",
        data: new Date()
      });

      res.status(201).json({
        mensagem: "Distancia salva!",
        id: resultado.insertedId
      });
    } catch (erro) {
      console.error("Erro ao salvar:", erro);

      res.status(500).json({
        erro: "Falha ao salvar no MongoDB"
      });
    }
  });

  app.listen(3000, "0.0.0.0", () => {
    console.log("API disponível na porta 3000");
  });
}

iniciarServidor().catch((erro) => {
  console.error("Erro ao iniciar servidor:", erro);
  process.exit(1);
});
