import { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "TCG Manager",
  description: "Σύστημα Διαχείρισης Παικτών Pokemon TCG",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="el">
      <body className="antialiased bg-slate-50 text-slate-900 flex flex-col min-h-screen">
        <Toaster position="bottom-right" />
        <Navbar />
        <div className="flex-grow">
          {children}
        </div>
        <footer className="py-8 text-center text-sm font-medium text-slate-500 bg-white border-t border-slate-200 mt-auto">
          MADE WITH <span className="text-red-500 animate-pulse inline-block">❤️</span> BY <a href="https://www.getweb.gr/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 font-bold transition-colors">GETWEB.GR</a>
        </footer>
      </body>
    </html>
  );
}
