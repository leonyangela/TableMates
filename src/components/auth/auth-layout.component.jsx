import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/logo/logo.component";

export default function AuthLayout({ children }) {
  return (
    <div className="flex w-screen h-screen overflow-hidden">
      {/* Image hidden on mobile — no room for it on small screens */}
      <div className="relative hidden md:block md:w-3/5 h-full">
        <Image
          src="/images/sign-up-bg.jpg"
          alt=""
          fill
          priority
          className="object-cover"
        />
      </div>

      <div className="w-full md:w-2/5 px-6 md:px-14 py-6 flex flex-col overflow-y-auto">
        <div className="w-full flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-primary transition-all duration-200 flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
