import { Split } from "@prisma/client";
import { captureException } from "@sentry/nextjs";
import { StatusCodes } from "http-status-codes";
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
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(undefined, {
        status: StatusCodes.UNAUTHORIZED,
      });
    }
    console.log("Saving splits", params.userId, session.user.id);
    if (params.userId !== session?.user.id) {
      return new Response(undefined, {
        status: StatusCodes.FORBIDDEN,
      });
    }
    const data: SplitsFormData = await request.json();
    // TODO: handle removing splits
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
        const existingSplit = await prismaClient.split.findUnique({
          where: {
            id: (split as Split).id,
          },
        });
        if (existingSplit?.userId === session.user.id) {
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
