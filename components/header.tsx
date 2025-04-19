"use client"

import Link from "next/link"
import { ShoppingCart, Package, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function Header() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Bulk Order System</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link
              href="/products"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/products" ? "text-foreground" : "text-muted-foreground",
              )}
            >
              Products
            </Link>
            <Link
              href="/orders/new"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/orders/new" ? "text-foreground" : "text-muted-foreground",
              )}
            >
              Place Order
            </Link>
            <Link
              href="/orders/track"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/orders/track" ? "text-foreground" : "text-muted-foreground",
              )}
            >
              Track Order
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <Package className="mr-2 h-4 w-4" />
                Exit Admin
              </Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">
                <User className="mr-2 h-4 w-4" />
                Admin
              </Link>
            </Button>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
