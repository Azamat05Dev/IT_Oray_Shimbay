import type { Metadata } from "next";
import "@/styles/globals.css";
import "@/styles/components.css";
import FloatingContact from "@/components/FloatingContact";

export const metadata: Metadata = {
  title: "Chimbay To'yxonalari - Online Bron Qilish | ToyBron",
  description: "Chimbay tumanidagi 10 ta eng yaxshi to'yxonani ko'ring, bo'sh sanalarni tekshiring va online bron qiling. Oson, tez va ishonchli.",
  keywords: "Chimbay, to'yxona, bron qilish, to'y, Qoraqalpog'iston, online bron, to'y zallar",
  authors: [{ name: "ToyBron Chimbay" }],
  openGraph: {
    title: "Chimbay To'yxonalari - Online Bron Qilish",
    description: "Chimbay tumanidagi 10 ta eng yaxshi to'yxonani ko'ring va online bron qiling",
    type: "website",
    locale: "uz_UZ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body>
        {children}
        <FloatingContact />
      </body>
    </html>
  );
}
