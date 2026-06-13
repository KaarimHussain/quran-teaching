import Link from "next/link";
import { BookOpenText, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/#features", label: "Features" },
  { href: "/#about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <BookOpenText className="size-5" />
          </span>
          <span className="font-heading text-lg text-primary">Quran Learning</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild variant="secondary" className="rounded-full">
            <Link href="/register">Sign Up</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full md:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 font-heading text-primary">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <BookOpenText className="size-4" />
                </span>
                Quran Learning
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-2 flex flex-col gap-2 px-4">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild variant="secondary" className="rounded-full">
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
