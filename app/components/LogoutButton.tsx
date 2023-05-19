"use client";
import { signOut } from "next-auth/react";
export function LogoutButton() {
  return (
    <a className="font-medium" onClick={() => signOut()}>
      Sign out
    </a>
  );
}
