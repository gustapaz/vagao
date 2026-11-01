import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "VAGÃO — O caminho também é destino.",
  description: "Uma viagem por conexões, estações e possibilidades.",
  metadataBase: new URL("https://vagao-gustapaz.starrylinen.chatgpt.site"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "VAGÃO",
    description: "Uma viagem por conexões, estações e possibilidades.",
    type: "website",
    locale: "pt_BR",
  },
  icons: { icon: "/favicon.svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
