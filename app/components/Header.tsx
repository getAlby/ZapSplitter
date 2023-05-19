import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

type HeaderProps = {
  minimal?: boolean;
};

export function Header({ minimal = true }: HeaderProps) {
  return (
    <div className="flex flex-col w-full max-w-xl justify-center items-center">
      {!minimal && (
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
      <Link href="/">
        <h1
          className={clsx(
            "font-heading font-bold text-center text-primary",
            minimal ? "text-3xl" : "text-4xl"
          )}
        >
          ZapSplitter
        </h1>
      </Link>
      {!minimal && (
        <h2 className="max-lg:text-center text-2xl text-primary-content">
          Automated Payment Splits
        </h2>
      )}
    </div>
  );
}
