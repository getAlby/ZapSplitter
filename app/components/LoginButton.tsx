"use client";
import { Button } from "app/components/Button";
import { signIn } from "next-auth/react";
export function LoginButton() {
  return <Button onClick={() => signIn("alby")}>Connect with Alby</Button>;
}
