import { Split } from "@prisma/client";
import { captureException } from "@sentry/nextjs";
import { StatusCodes } from "http-status-codes";
import { createWebhook } from "lib/server/createWebhook";
import { deleteWebhook } from "lib/server/deleteWebhook";
import { logger } from "lib/server/logger";
import { prismaClient } from "lib/server/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { SplitsFormData } from "types/SplitsFormData";

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const data: SplitsFormData = await request.json();
    if (
      data.splits.some(
        (split) =>
          isNaN(split.percentage) ||
          split.percentage < 1 ||
          split.percentage > 99 ||
          Math.floor(split.percentage) !== split.percentage
      )
    ) {
      return new Response("One or more invalid splits", {
        status: StatusCodes.BAD_REQUEST,
      });
    }
    // TODO: verify split lightning addresses

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(undefined, {
        status: StatusCodes.UNAUTHORIZED,
      });
    }
    const user = await prismaClient.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        splits: true,
      },
    });
    if (!user) {
      return new Response(undefined, {
        status: StatusCodes.NOT_FOUND,
      });
    }
    console.log("Saving splits", params.userId, session.user.id);
    if (params.userId !== session?.user.id) {
      return new Response(undefined, {
        status: StatusCodes.FORBIDDEN,
      });
    }

    for (const split of data.splits) {
      if (!(split as Split).id) {
        await prismaClient.split.create({
          data: {
            userId: session.user.id,
            percentage: split.percentage,
            recipientLightningAddress: split.recipientLightningAddress,
          },
        });
      } else {
        const existingSplit = user.splits.find(
          (existing) => existing.id === (split as Split).id
        );
        if (!existingSplit) {
          throw new Error(
            "Trying to update non-existent split: " + (split as Split).id
          );
        }
        await prismaClient.split.update({
          where: {
            id: (split as Split).id,
          },
          data: {
            percentage: split.percentage,
            recipientLightningAddress: split.recipientLightningAddress,
          },
        });
      }
    }
    for (const existingSplit of user.splits) {
      if (
        !data.splits.some(
          (newSplit) => (newSplit as Split).id === existingSplit.id
        )
      ) {
        await prismaClient.split.delete({
          where: {
            id: existingSplit.id,
          },
        });
      }
    }

    const isEnabled = data.isEnabled && data.splits.length;
    if (!!user.webhookEndpointId !== isEnabled) {
      if (isEnabled) {
        await createWebhook(user.id);
      } else {
        await deleteWebhook(user.id);
      }
    }

    return new Response(undefined, {
      status: StatusCodes.NO_CONTENT,
    });
  } catch (error) {
    captureException(error);
    logger.error("Failed to update splits", { error });
    return new Response("Failed to update splits. Please try again.", {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}
