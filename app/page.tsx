import { LoginButton } from "app/components/LoginButton";
import { getServerSession } from "next-auth";
import React from "react";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { LogoutButton } from "app/components/LogoutButton";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return <>{session ? <LogoutButton /> : <LoginButton />}</>;
}
