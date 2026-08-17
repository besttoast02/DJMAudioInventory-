import Link from "next/link";
import { Phone, Mail, MapPin, Camera } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-16">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="space-y-4">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">
              DJM<span className="text-blue-500">AUDIO</span>
            </span>
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Los Angeles Event Sound, DJ/MC and Lighting—Handled From Setup to the Last Song.
          </p>
          <div className="flex space-x-4 pt-4">
            <a href="https://www.instagram.com/djmaudioproductions" target="_blank" rel="noreferrer" aria-label="Instagram">
              <Camera className="w-6 h-6 text-gray-400 hover:text-blue-500 transition-colors" />
            </a>
          </div>
        </div>

        {/* Services */}
        <div className="space-y-4">
          <h4 className="text-gray-900 dark:text-white font-semibold text-lg">Services</h4>
          <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <li><Link href="/event-sound" className="hover:text-blue-500 transition-colors">Event Sound & PA</Link></li>
            <li><Link href="/dj-mc-services" className="hover:text-blue-500 transition-colors">DJ & MC Services</Link></li>
            <li><Link href="/event-lighting" className="hover:text-blue-500 transition-colors">Event Lighting</Link></li>
            <li><Link href="/equipment-rentals" className="hover:text-blue-500 transition-colors">Equipment Rentals</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div className="space-y-4">
          <h4 className="text-gray-900 dark:text-white font-semibold text-lg">Company</h4>
          <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <li><Link href="/reviews" className="hover:text-blue-500 transition-colors">Reviews</Link></li>
            <li><Link href="/about" className="hover:text-blue-500 transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-blue-500 transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h4 className="text-gray-900 dark:text-white font-semibold text-lg">Contact Us</h4>
          <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
            <li className="flex items-center">
              <Phone className="w-5 h-5 mr-3 text-blue-500" />
              <a href="tel:+16265063824" className="hover:text-blue-500 transition-colors">(626) 506-3824</a>
            </li>
            <li className="flex items-center">
              <Mail className="w-5 h-5 mr-3 text-blue-500" />
              <a href="mailto:info@djmaudio.com" className="hover:text-blue-500 transition-colors">info@djmaudio.com</a>
            </li>
            <li className="flex items-center">
              <MapPin className="w-5 h-5 mr-3 text-blue-500" />
              <span>Los Angeles, CA & Surrounding Areas</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-gray-200 dark:border-slate-800 text-sm text-gray-500 dark:text-gray-400 flex flex-col md:flex-row justify-between items-center">
        <p>© {new Date().getFullYear()} DJM Audio Productions. All rights reserved.</p>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <Link href="/privacy" className="hover:text-blue-500 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-blue-500 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
