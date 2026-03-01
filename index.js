import http from "http";
import nacl from "tweetnacl";
import fetch from "node-fetch";

const PUBLIC_KEY = "ba889b582f6c1b74b0369916e8a44ad72817dcabcc2bd117a199e98ebb97578f";
const TOKEN = process.env.TOKEN;
const APP_ID = "1477710394524045372";
const PORT = process.env.PORT || 3000;

function verifySignature(signature, timestamp, body) {
  return nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, "hex"),
    Buffer.from(PUBLIC_KEY, "hex")
  );
}

// 🔥 Enregistrer la commande AU DÉMARRAGE
async function registerCommand() {
  await fetch(`https://discord.com/api/v10/applications/${APP_ID}/commands`, {
    method: "POST",
    headers: {
      "Authorization": `Bot ${TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: "buy",
      description: "Support the project via PayPal"
    })
  });

  console.log("Commande /buy enregistrée !");
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

    if (interaction.type === 1) {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ type: 1 }));
    }

    if (interaction.data?.name === "buy") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({
        type: 4,
        data: {
          content: "💎 Merci pour ton soutien !",
        }
      }));
    }
  });
});

registerCommand();
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
