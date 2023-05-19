-- CreateEnum
CREATE TYPE "OutgoingPaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "IncomingPayment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paymentHash" TEXT NOT NULL,
    "createdDateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "IncomingPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutgoingPayment" (
    "id" TEXT NOT NULL,
    "incomingPaymentId" TEXT NOT NULL,
    "splitId" TEXT NOT NULL,
    "createdDateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER NOT NULL,
    "fee" INTEGER,
    "status" "OutgoingPaymentStatus" NOT NULL,
    "paymentHash" TEXT,
    "preimage" TEXT,
    "paymentRequest" TEXT NOT NULL,

    CONSTRAINT "OutgoingPayment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IncomingPayment" ADD CONSTRAINT "IncomingPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutgoingPayment" ADD CONSTRAINT "OutgoingPayment_incomingPaymentId_fkey" FOREIGN KEY ("incomingPaymentId") REFERENCES "IncomingPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutgoingPayment" ADD CONSTRAINT "OutgoingPayment_splitId_fkey" FOREIGN KEY ("splitId") REFERENCES "Split"("id") ON DELETE CASCADE ON UPDATE CASCADE;
