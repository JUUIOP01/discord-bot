import http from "http";

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.method === "POST") {
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const data = JSON.parse(body);

      // Discord PING
      if (data.type === 1) {
        return res.end(JSON.stringify({ type: 1 }));
      }

      // Simple reply
      res.end(
        JSON.stringify({
          type: 4,
          data: { content: "Bot en ligne 🚀" }
        })
      );
    });
  } else {
    res.end("Bot is running");
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
