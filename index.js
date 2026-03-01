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

// ⚠️ IMPORTANT : on utilise express.raw() ici
app.post(
  "/",
  express.raw({ type: "application/json" }),
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  (req, res) => {
    const interaction = JSON.parse(req.body.toString());

    // Ping Discord
    if (interaction.type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
    }

    // Slash command
    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      if (interaction.data.name === "buy") {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "🛒 Achat effectué avec succès !",
          },
        });
      }
    }

    return res.status(400).send("Unknown interaction");
  }
);

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
