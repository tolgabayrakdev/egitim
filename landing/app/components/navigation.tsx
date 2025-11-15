"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary">
              Adivora
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm text-foreground hover:text-primary transition-colors font-medium"
            >
              Ana Sayfa
            </Link>
            <Link
              href="/about"
              className="text-sm text-foreground hover:text-primary transition-colors font-medium"
            >
              Hakkımızda
            </Link>
            <Link
              href="/contact"
              className="text-sm text-foreground hover:text-primary transition-colors font-medium"
            >
              İletişim
            </Link>
            <a
              href="http://localhost:5173/auth/sign-in"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all text-sm font-semibold"
            >
              Giriş Yap
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary p-2"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3 border-t border-border pt-4">
            <Link
              href="/"
              className="block text-sm text-foreground hover:text-primary transition-colors font-medium py-2"
              onClick={() => setIsOpen(false)}
            >
              Ana Sayfa
            </Link>
            <Link
              href="/about"
              className="block text-sm text-foreground hover:text-primary transition-colors font-medium py-2"
              onClick={() => setIsOpen(false)}
            >
              Hakkımızda
            </Link>
            <Link
              href="/contact"
              className="block text-sm text-foreground hover:text-primary transition-colors font-medium py-2"
              onClick={() => setIsOpen(false)}
            >
              İletişim
            </Link>
            <a
              href="http://localhost:5173/auth/sign-in"
              className="block px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all text-center text-sm font-semibold"
              onClick={() => setIsOpen(false)}
            >
              Giriş Yap
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
