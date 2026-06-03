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
      {/*
        En móvil (< sm): pantalla completa, sin wrapper, sin bordes redondeados
        En escritorio (>= sm): simula celular centrado con sombra y esquinas redondeadas
      */}
      <body className="h-full bg-white sm:bg-slate-200 sm:flex sm:justify-center sm:items-start sm:p-4">
        <div className="
          w-full flex flex-col bg-white
          h-[100dvh]
          sm:max-w-sm sm:h-screen sm:max-h-screen
          sm:shadow-2xl sm:rounded-3xl sm:overflow-hidden
        ">
          {children}
        </div>
      </body>
    </html>
  );
}
