import dotenv from "dotenv";
dotenv.config();

const APP_ID = "1477710394524045372";
const TOKEN = process.env.TOKEN;

const command = {
  name: "buy",
  description: "Acheter un produit",
};

await fetch(`https://discord.com/api/v10/applications/${APP_ID}/commands`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bot ${TOKEN}`,
  },
  body: JSON.stringify(command),
});

console.log("Commande enregistrée !");
