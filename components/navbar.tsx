"use client"

import Link from "next/link"
import { Layers, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState, useEffect } from "react"

interface NavItem {
  label: string
  href: string
}

interface NavbarProps {
  navItems?: NavItem[]
}

export function Navbar({ navItems = [] }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Add scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const defaultNavItems: NavItem[] = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "FAQ", href: "#faq" },
  ]

  const items = navItems.length > 0 ? navItems : defaultNavItems

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200 ${isScrolled ? "shadow-sm" : ""}`}
    >
      <div className="w-full max-w-[1200px] mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo Section - Left */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2 py-2">
            <Layers className="h-6 w-6 text-primary transition-all duration-300 hover:scale-110" />
            <span className="text-xl font-bold">Ciao</span>
          </Link>
        </div>

        {/* Navigation Links - Center (hidden on mobile) */}
        <nav className="hidden md:flex items-center justify-center flex-1 px-4">
          <ul className="flex space-x-6">
            {items.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className="text-sm font-medium px-2 py-2 hover:text-primary transition-colors duration-200"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Actions - Right */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/auth/login"
              className="text-sm font-medium px-2 py-2 hover:text-primary transition-colors duration-200"
            >
              Log in
            </Link>
            <Button className="transition-all duration-200 hover:scale-105" size="sm">
              Sign up free
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-secondary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b">
          <div className="max-w-[1200px] mx-auto px-4 py-4 space-y-4">
            <nav className="flex flex-col space-y-3">
              {items.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="text-sm font-medium py-2 hover:text-primary transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col space-y-3 pt-3 border-t">
              <Link
                href="/login"
                className="text-sm font-medium py-2 hover:text-primary transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Button className="w-full transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>
                Sign up free
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

