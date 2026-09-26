import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MobileNav, type NavItem } from "@/components/layout/mobile-nav"
import { getSession } from "@/lib/supabase/session"

export async function SiteHeader() {
  const session = await getSession()
  const signedIn = session.status === "signed_in"

  const items: NavItem[] = signedIn
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/projects/new", label: "New application" },
        { href: "/settings", label: "Settings" },
      ]
    : [
        { href: "/login", label: "Sign in" },
        { href: "/signup", label: "Create account" },
      ]

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-base font-semibold tracking-tight"
        >
          ApplyFill
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <Button key={item.href} variant="ghost" className="min-h-11" asChild>
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
        <MobileNav items={items} />
      </div>
    </header>
  )
}
