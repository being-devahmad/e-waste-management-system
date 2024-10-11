'use client'


import localFont from "next/font/local";
import "./globals.css";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [sidebarOpen, setSidebarOpen] = useState('')
  const [totalEarnings, setTotalEarnings] = useState(0)

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Header */}
          <div className="flex flex-1">
            {/* Sidebar */}
            <main className="flex-1 p-4 lg:p-8 ml-0 lg:ml-64 transition-all duration-300">
              {children}
            </main>
          </div>

        </div>
        <Toaster />
      </body>
    </html>
  );
}
