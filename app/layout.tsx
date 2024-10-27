// @ts-nocheck

'use client'

import localFont from "next/font/local";
import "./globals.css";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { getAvailableRewards, getUserByEmail } from "../utils/db/actions";

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

  useEffect(() => {
    const fetchTotalEarnings = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail")
        if (userEmail) {
          const user = await getUserByEmail(userEmail)
          if (user) {
            const availableResult = await getAvailableRewards()
          }
        }
      } catch (error) {

      }
    }
  }, [])

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Header */}
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} totalEarnings={totalEarnings} />
          <div className="flex flex-1">
            {/* Sidebar */}
            <Sidebar open={sidebarOpen} />
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
