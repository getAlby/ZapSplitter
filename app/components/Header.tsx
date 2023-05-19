import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { User } from "@prisma/client";
import { LogoutButton } from "app/components/LogoutButton";

type HeaderProps = {
  user?: User;
};

export function Header({ user }: HeaderProps) {
  return (
    <div className="flex flex-col w-full max-w-xl justify-center items-center">
      {!user && (
        <>
          <div className="w-full h-48 lg:h-80 relative mb-8">
            <Image
              className="object-cover"
              style={{ objectPosition: "50% 85%" }}
              src="/prism.jpg"
              alt="ZapSplitter Logo"
              fill
              priority
            />
          </div>
        </>
      )}
      <div className="w-full relative">
        {user && (
          <div className="dropdown dropdown-end absolute right-0 -top-2">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  src={
                    user.image ||
                    `https://api.dicebear.com/6.x/lorelei/svg?seed=${user.id}`
                  }
                />
              </div>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <LogoutButton />
              </li>
            </ul>
          </div>
        )}
        <Link href="/">
          <h1
            className={clsx(
              "font-heading font-bold text-center text-primary",
              user ? "text-3xl" : "text-4xl"
            )}
          >
            ZapSplitter
          </h1>
        </Link>
      </div>
      {!user && (
        <h2 className="max-lg:text-center text-2xl text-primary-content">
          Automated Payment Splits
        </h2>
      )}
    </div>
  );
}
