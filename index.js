import express from "express";
import dotenv from "dotenv";
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from "discord-interactions";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

/*
  🔎 Logger global pour voir toutes les requêtes entrantes
*/
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

/*
  Route GET pour test navigateur
*/
app.get("/", (req, res) => {
  res.status(200).send("Bot is alive 🚀");
});

/*
  Route HEAD (important pour certains checks externes)
*/
app.head("/", (req, res) => {
  res.sendStatus(200);
});

/*
  Route POST pour Discord Interactions
  ⚠️ express.raw obligatoire
*/
app.post(
  "/",
  express.raw({ type: "application/json" }),
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  (req, res) => {
    const interaction = JSON.parse(req.body.toString());

    // Réponse au PING Discord
    if (interaction.type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
    }

    // Réponse par défaut
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "Bot connecté ✅",
      },
    });
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
