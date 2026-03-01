import { createClient } from "npm:@blinkdotnew/sdk";
import nacl from "npm:tweetnacl";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

// Types for Discord Interactions
enum InteractionType {
  PING = 1,
  APPLICATION_COMMAND = 2,
  MESSAGE_COMPONENT = 3,
  APPLICATION_COMMAND_AUTOCOMPLETE = 4,
  MODAL_SUBMIT = 5,
}

enum InteractionResponseType {
  PONG = 1,
  CHANNEL_MESSAGE_WITH_SOURCE = 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
  DEFERRED_UPDATE_MESSAGE = 6,
  UPDATE_MESSAGE = 7,
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT = 8,
  MODAL = 9,
}

async function verifyDiscordSignature(req: Request, publicKey: string): Promise<boolean> {
  const signature = req.headers.get("X-Signature-Ed25519");
  const timestamp = req.headers.get("X-Signature-Timestamp");
  const body = await req.clone().text();

  if (!signature || !timestamp) return false;

  try {
    return nacl.sign.detached.verify(
      new TextEncoder().encode(timestamp + body),
      hexToUint8Array(signature),
      hexToUint8Array(publicKey)
    );
  } catch {
    return false;
  }
}

function hexToUint8Array(hex: string): Uint8Array {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map((val) => parseInt(val, 16)));
}

async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const publicKey = Deno.env.get("DISCORD_PUBLIC_KEY");
  if (!publicKey) {
    return new Response("Missing DISCORD_PUBLIC_KEY", { status: 500 });
  }

  // Verify signature
  const isValid = await verifyDiscordSignature(req, publicKey);
  if (!isValid) {
    return new Response("Invalid signature", { status: 401 });
  }

  const interaction = await req.json();

  // Handle PING
  if (interaction.type === InteractionType.PING) {
    return new Response(JSON.stringify({ type: InteractionResponseType.PONG }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const projectId = Deno.env.get("BLINK_PROJECT_ID")!;
  const secretKey = Deno.env.get("BLINK_SECRET_KEY")!;
  const blink = createClient({ projectId, secretKey });

  // Handle Commands
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const { name, options } = interaction.data;
    const member = interaction.member;
    const userId = member.user.id;

    if (name === "verify") {
      const dbUser = await blink.db.verifiedUsers.list({
        where: { discordId: userId }
      });

      if (dbUser.length > 0) {
        return Response.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: `✅ Vous êtes déjà vérifié en tant que **${dbUser[0].username}** !` },
        });
      } else {
        return Response.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: `❌ Vous n'êtes pas encore vérifié. Veuillez vous connecter au Dashboard pour terminer la vérification.` },
        });
      }
    }

    if (name === "kick") {
      const targetId = options[0].value;
      const reason = options[1]?.value || "Pas de raison fournie";
      
      // Log moderation action
      await blink.db.moderationLogs.create({
        userId: userId,
        action: 'kick',
        targetDiscordId: targetId,
        reason: reason
      });

      return Response.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `👢 L'utilisateur <@${targetId}> a été expulsé. Raison: ${reason}` },
      });
    }

    if (name === "animation") {
      const animType = options[0].value;
      let responseContent = "";
      
      if (animType === "dance") responseContent = "🕺 *Le bot commence à danser de manière frénétique !*";
      if (animType === "celebrate") responseContent = "🎉 *Confettis partout ! Félicitations !*";
      
      return Response.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: responseContent },
      });
    }
  }

  return new Response("Not found", { status: 404 });
}

Deno.serve(handler);
