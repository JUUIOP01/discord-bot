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

/* ❌ IMPORTANT : NE PAS mettre app.use(express.json()) */

app.get("/", (req, res) => {
  res.status(200).send("Bot is alive 🚀");
});

app.post(
  "/",
  express.raw({ type: "application/json" }),
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  (req, res) => {
    const interaction = JSON.parse(req.body.toString());

    if (interaction.type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
    }

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
