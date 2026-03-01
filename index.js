import express from "express";
import dotenv from "dotenv";
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from "discord-interactions";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ⚠️ Vérification signature Discord
app.use(
  "/",
  express.json(),
  verifyKeyMiddleware(process.env.PUBLIC_KEY)
);

// Route principale (Discord Interactions)
app.post("/", async (req, res) => {
  const { type, data } = req.body;

  // Discord Ping
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  // Slash command
  if (type === InteractionType.APPLICATION_COMMAND) {
    if (data.name === "buy") {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "🛒 Achat effectué avec succès !",
        },
      });
    }
  }

  return res.status(400).send("Unknown interaction");
});

// Démarrage serveur
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
