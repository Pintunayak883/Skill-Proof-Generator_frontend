import "./globals.css";
import React from "react";

export const metadata = {
  title: "Skill Proof Generator Platform",
  description: "AI-assisted hiring assessments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="border-b bg-white">
            <div className="container py-4 flex items-center justify-between">
              <h1 className="text-lg font-semibold">Skill Proof Generator</h1>
            </div>
          </header>
          <main className="flex-1 py-8">{children}</main>
          <footer className="border-t text-sm text-gray-500 p-4 text-center">
            &copy; {new Date().getFullYear()} Skill Proof
          </footer>
        </div>
      </body>
    </html>
  );
}
