import type { Metadata } from "next";
import "./globals.css";
import { WsProvider } from "@/providers/WsProvider";

export const metadata: Metadata = {
  title: "InfraWatch — Infrastructure Monitoring Platform",
  description: "Real-time infrastructure monitoring with WebSocket-driven live data",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0a0c0f] text-[#e8eaf0] antialiased overflow-hidden">
        {/* Mounts WsClient singleton + wires it to the store */}
        <WsProvider />
        {children}
      </body>
    </html>
  );
}
