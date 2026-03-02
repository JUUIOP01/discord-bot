import dotenv from "dotenv";
dotenv.config();

const APP_ID = process.env.APP_ID;
const GUILD_ID = process.env.GUILD_ID;
const TOKEN = process.env.TOKEN;

if (!APP_ID || !GUILD_ID || !TOKEN) {
  console.error("❌ Vérifie ton fichier .env (APP_ID, GUILD_ID, TOKEN manquants)");
  process.exit(1);
}

const commands = [
  {
    name: "buy",
    description: "Acheter un produit",
  },
  // ➕ Ajoute d'autres commandes ici si besoin
];

const res = await fetch(
  `https://discord.com/api/v10/applications/${APP_ID}/guilds/${GUILD_ID}/commands`,
  {
    method: "PUT", // PUT remplace toutes les commandes d'un coup
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${TOKEN}`,
    },
    body: JSON.stringify(commands),
  }
);

const data = await res.json();

if (res.ok) {
  console.log(`✅ ${data.length} commande(s) enregistrée(s) avec succès !`);
  data.forEach((cmd) => console.log(` - /${cmd.name}`));
} else {
  console.error("❌ Erreur lors de l'enregistrement :", data);
}
