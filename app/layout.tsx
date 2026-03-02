import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recupera AI | Gestão Inteligente de Crédito",
  description: "Um painel de Business Intelligence para monitorar e gerenciar contratos inadimplentes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
