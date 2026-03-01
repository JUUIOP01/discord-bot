import http from "http";
import nacl from "tweetnacl";

const PUBLIC_KEY = "ba889b582f6c1b74b0369916e8a44ad72817dcabcc2bd117a199e98ebb97578f";
const TOKEN = process.env.TOKEN;
const APP_ID = "1477710394524045372";
const GUILD_ID = "1477308804973596844";
const PORT = process.env.PORT || 3000;

function verifySignature(signature, timestamp, body) {
  return nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, "hex"),
    Buffer.from(PUBLIC_KEY, "hex")
  );
}

// 🔥 Enregistrer la commande au démarrage (SYNC PROPRE)
async function registerCommand() {
  const response = await fetch(
    `https://discord.com/api/v10/applications/${APP_ID}/guilds/${GUILD_ID}/commands`,
    {
      method: "PUT",
      headers: {
        "Authorization": `Bot ${TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([
        {
          name: "buy",
          description: "Support the project via PayPal"
        }
      ])
    }
  );

  const data = await response.json();
  console.log("Réponse Discord:", data);
}

const server = http.createServer((req, res) => {
  if (req.method !== "POST") {
    res.writeHead(200);
    return res.end("Bot is running");
  }

  let body = "";

  req.on("data", chunk => {
    body += chunk;
  });

  req.on("end", () => {
    const signature = req.headers["x-signature-ed25519"];
    const timestamp = req.headers["x-signature-timestamp"];

    if (!verifySignature(signature, timestamp, body)) {
      res.writeHead(401);
      return res.end("Invalid signature");
    }

    const interaction = JSON.parse(body);

    // Ping Discord
    if (interaction.type === 1) {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ type: 1 }));
    }

    // Commande /buy
    if (interaction.data?.name === "buy") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({
        type: 4,
        data: {
          content: "💎 Merci pour ton soutien !"
        }
      }));
    }
  });
});

// Lancer serveur + enregistrer commande
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await registerCommand();
});
