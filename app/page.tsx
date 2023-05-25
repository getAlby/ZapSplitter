import { LoginButton } from "app/components/LoginButton";
import { getServerSession } from "next-auth";
import React from "react";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { LogoutButton } from "app/components/LogoutButton";
import { prismaClient } from "lib/server/prisma";
import { SplitsForm } from "app/components/SplitsForm";
import { Header } from "app/components/Header";
import { Box } from "app/components/Box";
import { PaymentHistory } from "app/components/PaymentHistory";

export const dynamic = "force-dynamic";
export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const user =
    session &&
    (await prismaClient.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        splits: true,
        incomingPayments: {
          include: {
            outgoingPayments: true,
          },
          orderBy: {
            createdDateTime: "desc",
          },
        },
      },
    }));

  return (
    <>
      <Header user={session?.user} />
      <div className="flex gap-4 flex-col items-center justify-center w-full">
        {session ? (
          <>
            {user && (
              <>
                <SplitsForm
                  userId={session.user.id}
                  splits={user.splits || []}
                  isEnabled={!!user.webhookEndpointId}
                />
                <PaymentHistory
                  incomingPayments={user.incomingPayments}
                  splits={user.splits}
                />
              </>
            )}
          </>
        ) : (
          <>
            <Box>
              <h2 className="font-heading font-bold text-2xl">
                How does it work?
              </h2>
              <ul className="list list-inside list-disc flex flex-col gap-2">
                <li className="list-item">
                  Enter one or more lightning addresses and configure split
                  percentage from 0-100
                </li>
                <li className="list-item">
                  Incoming payments will be forwarded to your configured splits,
                  with 1% reserved per split for fees
                </li>
                <li className="list-item">Disable split payments any time</li>
              </ul>
              <div>
                <h3 className="font-heading font-bold text-lg mb-2">
                  Skipped Payments
                </h3>
                <p>
                  Payments will only be made if at least 2 sats are available to
                  make the payment
                </p>
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg mb-2">
                  Unspent Routing Fees
                </h3>
                <p>
                  Unspent routing fees will stay in your account, and you can
                  use them at any time, or wait for them to collect and then
                  resend the sats to yourself, re-triggering a new split
                  payment.
                </p>
              </div>
            </Box>
            <div />
            <LoginButton />
          </>
        )}
      </div>
    </>
  );
}
