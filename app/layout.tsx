import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lavaautos",
  description: "App de gestión para lavadero de autos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex justify-center items-start bg-gray-100 p-4">
        {/* Simula pantalla de celular */}
        <div className="w-full max-w-sm h-screen max-h-screen bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
