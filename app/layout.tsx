import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { NotificationProvider } from "@/components/notification-provider"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "EduFlow - Assignment Management",
  description: "GraphQL-powered teacher assignment workflow system",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {/* Wrap children with notification provider and Suspense boundary */}
        <Suspense fallback={null}>
          <NotificationProvider>{children}</NotificationProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
