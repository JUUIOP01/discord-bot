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
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => res.status(200).send("Bot is alive 🚀"));
app.head("/", (req, res) => res.sendStatus(200));

app.post(
  "/interactions",
  express.raw({ type: "application/json" }),
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  (req, res) => {
    const interaction = req.body;

    if (interaction.type === InteractionType.PING) {
      return res.json({ type: InteractionResponseType.PONG });
    }

    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      const { name } = interaction.data;

      if (name === "buy") {
        return res.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                title: "🛒 Boutique [+] Abdel",
                description: "Merci de votre intérêt ! Cliquez sur le bouton ci-dessous pour effectuer votre paiement via **PayPal** en toute sécurité. 💳\n\n> Après votre paiement, contactez un administrateur pour recevoir votre produit.",
                color: 0x5865F2,
                thumbnail: {
                  url: "https://cdn-icons-png.flaticon.com/512/174/174861.png",
                },
                footer: {
                  text: "[+] Abdel • Boutique officielle",
                },
                timestamp: new Date().toISOString(),
              },
            ],
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    style: 5,
                    label: "💳 Payer via PayPal",
                    url: "https://www.paypal.com/paypalme/Zbipktufaisa",
                  },
                ],
              },
            ],
          },
        });
      }

      return res.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `❓ Commande inconnue : \`/${name}\`` },
      });
    }

    return res.status(400).json({ error: "Unknown interaction type" });
  }
);

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
