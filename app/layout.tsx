import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TableProvider } from "./context/TableContext";

// Configuración de fuentes optimizadas de Next.js
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prueba Técnica Qamarero",
  description: "Solución de división de cuentas para Qamarero",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        {/* Envolvemos la aplicación en el proveedor de contexto de mesas */}
        <TableProvider>
          {children}
        </TableProvider>
      </body>
    </html>
  );
}
