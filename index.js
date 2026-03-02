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

// ─── Logs des requêtes entrantes ───────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Route de santé (pour Render, Railway, etc.) ───────────────────────────
app.get("/", (req, res) => res.status(200).send("Bot is alive 🚀"));
app.head("/", (req, res) => res.sendStatus(200));

// ─── Route interactions Discord ────────────────────────────────────────────
app.post(
  "/interactions",
  express.raw({ type: "application/json" }),
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  (req, res) => {
    const interaction = JSON.parse(req.body.toString());

    // 1. Ping de vérification Discord
    if (interaction.type === InteractionType.PING) {
      return res.json({ type: InteractionResponseType.PONG });
    }

    // 2. Slash commands
    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      const { name } = interaction.data;

      if (name === "buy") {
        return res.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "🛒 Bienvenue dans la boutique ! Que souhaitez-vous acheter ?",
          },
        });
      }

      // Commande inconnue
      return res.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `❓ Commande inconnue : \`/${name}\`` },
      });
    }

    // Type d'interaction non géré
    return res.status(400).json({ error: "Unknown interaction type" });
  }
);

// ─── Démarrage ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
