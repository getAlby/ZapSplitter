import { LoginButton } from "app/components/LoginButton";
import { getServerSession } from "next-auth";
import React from "react";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { LogoutButton } from "app/components/LogoutButton";
import { prismaClient } from "lib/server/prisma";
import { SplitsForm } from "app/components/SplitsForm";

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
      {session ? (
        <>
          <SplitsForm userId={session.user.id} splits={splits || []} />
          <LogoutButton />
        </>
      ) : (
        <LoginButton />
      )}
    </>
  );
}
