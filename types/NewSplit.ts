import { Split } from "@prisma/client";

export type NewSplit = Pick<Split, "percentage" | "recipientLightningAddress">;
