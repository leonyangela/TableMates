import { IBM_Plex_Mono, Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/auth.context";
import SessionEffects from "@/components/session/session-effects.component";
import { AUTHOR } from "@/lib/constants/author.constants";

// Display, body and metadata type (all Google Fonts), exposed as CSS
// variables and mapped to font-display / font-body / font-meta in
// globals.css.
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata = {
  title: "TableMates",
  description: "Book restaurants and share the table with people worth meeting.",
  authors: [{ name: AUTHOR.name, url: AUTHOR.links[0].href }],
  creator: AUTHOR.name,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${interTight.variable} ${inter.variable} ${plexMono.variable}`}
    >
      <body className="relative min-h-full bg-ink font-body text-paper">
        <AuthProvider>
          {children}
          <SessionEffects />
        </AuthProvider>
      </body>
    </html>
  );
}
