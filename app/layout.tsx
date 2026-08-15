import type { Metadata } from "next";
import { Geist, Plus_Jakarta_Sans, Syne } from "next/font/google";
import "./globals.css";
import { AppToaster } from "@/components/app-toaster";


const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: "Dr. Albert Oduwole",
  description: "Happy Birthday Dr. Albert Oduwole",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}

        <AppToaster />
        
        </body>
    </html>
  );
}
