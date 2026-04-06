"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">
              Agency
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              Contact
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
            >
              Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/"
              className="block text-gray-700 hover:text-primary-600 py-2"
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className="block text-gray-700 hover:text-primary-600 py-2"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="block text-gray-700 hover:text-primary-600 py-2"
            >
              Contact
            </Link>
            <Link
              href="/admin"
              className="block px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              Admin
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
