import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/logo/logo.component";

export default function AuthLayout({
  title,
  subtitle,
  footer,
  imageHeading = "Good food tastes better together.",
  imageText = "Discover restaurants, book a table in seconds, and share the meal with people worth meeting.",
  children,
}) {
  return (
    <div className="flex min-h-svh w-full bg-white text-gray-900">
      {/* Image panel — hidden on mobile, takes exactly half the screen from md up */}
      <aside className="hidden md:block md:w-1/2 p-3 lg:p-4">
        <div className="sticky top-3 lg:top-4 h-[calc(100svh-1.5rem)] lg:h-[calc(100svh-2rem)] overflow-hidden rounded-2xl">
          <Image
            src="/images/sign-up-bg.jpg"
            alt=""
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-8 lg:p-12 text-white">
            <h2 className="font-oswald text-3xl lg:text-4xl uppercase leading-tight max-w-md">
              {imageHeading}
            </h2>
            <p className="mt-3 max-w-md text-sm lg:text-base text-white/80">
              {imageText}
            </p>
          </div>
        </div>
      </aside>

      <main className="w-full md:w-1/2 flex flex-col px-6 sm:px-10 lg:px-16 py-6">
        <header className="flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-primary transition-all duration-200 flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
              {subtitle && <p className="mt-2 text-gray-500">{subtitle}</p>}
            </div>

            {children}

            {footer && (
              <p className="mt-8 text-center text-sm text-gray-500">{footer}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
