import { createAlbyClient } from "lib/server/createAlbyClient";
import { logger } from "lib/server/logger";
import { prismaClient } from "lib/server/prisma";

export async function deleteWebhook(userId: string) {
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error("No WEBHOOK_URL set in env");
  }

  const user = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new Error("No user found for id " + userId);
  }
  if (!user.webhookEndpointId) {
    logger.info("User has no webhook", { userId });
    return;
  }
  const client = await createAlbyClient(userId);

  const result = await client.deleteWebhookEndpoint(user.webhookEndpointId);
  if (result.url) {
    // console.log("Deleted webhook", result.url);
    await prismaClient.user.update({
      where: {
        id: userId,
      },
      data: {
        webhookEndpointId: null,
        webhookEndpointSecret: null,
      },
    });
  } else {
    throw new Error("Failed to delete webhook for user " + userId);
  }
}
