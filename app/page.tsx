import { LoginButton } from "app/components/LoginButton";
import { getServerSession } from "next-auth";
import React from "react";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { LogoutButton } from "app/components/LogoutButton";
import { prismaClient } from "lib/server/prisma";
import { SplitsForm } from "app/components/SplitsForm";
import { Header } from "app/components/Header";
import { Box } from "app/components/Box";

export const dynamic = "force-dynamic";
export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const splits =
    session &&
    (await prismaClient.split.findMany({
      where: {
        userId: session.user.id,
      },
    }));

  return (
    <>
      <Header minimal={false} />
      <div className="flex gap-4 flex-col items-center justify-center">
        {session ? (
          <>
            <SplitsForm userId={session.user.id} splits={splits || []} />
            <LogoutButton />
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
                <li className="list-item">
                  Only split payments of at least 1 sat will be sent following
                  this algorithm:{" "}
                  <span className="font-mono">
                    (incomingAmount / splitPercent) - 1%
                  </span>
                </li>
                <li className="list-item">
                  You move any unspent sats at any time to a separate account
                </li>
                <li className="list-item">
                  Payments to other Alby lightning addresses are free
                </li>
                <li className="list-item">
                  Disable split payments any time with one click
                </li>
              </ul>
            </Box>
            <div />
            <LoginButton />
          </>
        )}
      </div>
    </>
  );
}
