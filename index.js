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

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

app.get("/", (req, res) => {
  res.status(200).send("Bot is alive 🚀");
});

app.head("/", (req, res) => {
  res.sendStatus(200);
});

// ✅ Route dédiée aux interactions Discord
app.post(
  "/interactions",
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
