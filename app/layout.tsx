import "./globals.css";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { AlbyLogo } from "app/components/icons/AlbyLogo";

export const metadata = {
  title: "ZapSplitter",
  description: "Forward incoming payments to multiple lightning addresses",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-base-200">
        <div className="flex flex-col gap-8 px-4 py-4 lg:py-14 lg:px-14 items-center justify-start">
          <Toaster position="bottom-center" />
          {children}
        </div>
        <div className="flex flex-col gap-2 items-center justify-center mt-6 mb-10">
          <Link href="https://getalby.com" target="_blank">
            <div className="flex gap-2 items-center justify-center">
              <span className="font-body text-xs">Powered by</span>
              <AlbyLogo className="text-primary" />
            </div>
          </Link>
          <Link
            href="https://dergigi.com/2023/03/12/lightning-prisms/"
            target="_blank"
          >
            <span className="text-xs link">
              Original idea and cover image by dergigi.
            </span>
          </Link>
          <span className="text-xs">
            This is a custodial prototype. Stay tuned for a non-custodial
            version powered by NWC.
          </span>
        </div>
      </body>
    </html>
  );
}
