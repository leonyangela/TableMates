import { Open_Sans, Oswald } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

export const metadata = {
  title: "Tablemates",
  description: "Booking app by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <body className={`min-h-full relative ${openSans.variable} ${oswald.variable} `}>{children}</body>
    </html>
  );
}
