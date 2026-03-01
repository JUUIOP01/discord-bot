import http from "http";
import nacl from "tweetnacl";

const PUBLIC_KEY = "ba889b582f6c1b74b0369916e8a44ad72817dcabcc2bd117a199e98ebb97578f";
const PORT = process.env.PORT || 3000;

function verifySignature(signature, timestamp, body) {
  return nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, "hex"),
    Buffer.from(PUBLIC_KEY, "hex")
  );
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

    // PING
    if (interaction.type === 1) {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ type: 1 }));
    }

    // Command response
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        type: 4,
        data: { content: "Bot en ligne 🚀" }
      })
    );
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
