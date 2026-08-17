"use client";

import { ShoppingCart, Phone, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";
import Link from "next/link";

interface HeaderClientProps {
  navLinks: { name: string; href: string }[];
}

export function HeaderClient({ navLinks }: HeaderClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <>
      {/* CTA & Phone (Desktop) */}
      <div className="hidden md:flex items-center space-x-6">
        <a
          href="tel:+16265063824"
          className="flex items-center text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-700 transition-colors"
        >
          <Phone className="w-4 h-4 mr-2" />
          (626) 506-3824
        </a>

        {/* Cart Icon */}
        <Link href="/quote" className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-blue-700 transition-colors">
          <ShoppingCart className="w-6 h-6" />
          {mounted && getTotalItems() > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-blue-600 rounded-full">
              {getTotalItems()}
            </span>
          )}
        </Link>

        <Link
          href="/quote"
          className="hidden md:flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-sm shadow-blue-500/20"
        >
          Get My Event Quote
        </Link>
      </div>

      {/* Mobile Toggle & Cart */}
      <div className="flex md:hidden items-center space-x-4">
        <Link href="/quote" className="relative p-2 text-gray-900">
          <ShoppingCart className="w-6 h-6" />
          {mounted && getTotalItems() > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-blue-600 rounded-full">
              {getTotalItems()}
            </span>
          )}
        </Link>
        <button
          className="p-2 text-gray-900 dark:text-gray-100"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-slate-950 border-b dark:border-slate-800 shadow-lg py-4 px-4 flex flex-col space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-lg font-medium text-gray-900 dark:text-white p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t dark:border-slate-800 flex flex-col space-y-4">
            <a
              href="tel:+16265063824"
              className="flex items-center justify-center text-lg font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-slate-800 py-3 rounded-xl"
            >
              <Phone className="w-5 h-5 mr-2" />
              (626) 506-3824
            </a>
            <Link
              href="/quote"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center bg-blue-700 text-white py-3 rounded-xl font-bold text-lg shadow-md"
            >
              Get My Event Quote
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
