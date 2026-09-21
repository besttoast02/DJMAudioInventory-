import Link from "next/link";
import { HeaderClient } from "./HeaderClient";

const NAV_LINKS = [
  { name: "Services", href: "/#services" },
  { name: "Rentals", href: "/equipment-rentals" },
  { name: "Reviews", href: "/reviews" },
  { name: "About", href: "/about" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo — server rendered */}
        <Link href="/" className="flex items-center space-x-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          <span>DJM<span className="text-blue-600">AUDIO</span></span>
        </Link>

        {/* Desktop Nav — server rendered static links */}
        <nav className="hidden md:flex items-center space-x-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 text-gray-600 dark:text-gray-300"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Client-only interactive parts: cart badge, mobile menu */}
        <HeaderClient navLinks={NAV_LINKS} />
      </div>
    </header>
  );
}
