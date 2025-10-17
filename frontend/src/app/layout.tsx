import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "MedDataCollect - Accès Médecin",
    description: "Plateforme sécurisée de collecte de données médicales",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
        >
        {/* ✅ On injecte notre AuthProvider via le wrapper client */}
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}
