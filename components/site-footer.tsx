import Link from "next/link";
import { BookOpenText } from "lucide-react";

const columns = [
  {
    title: "Learn",
    links: [
      { href: "/courses", label: "Course Catalog" },
      { href: "/login", label: "Student Login" },
      { href: "/register", label: "Enroll Now" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/register", label: "Become a Volunteer Teacher" },
      { href: "/#features", label: "Resource Library" },
      { href: "/#about", label: "About the Portal" },
    ],
  },
  {
    title: "Languages",
    links: [
      { href: "#", label: "English" },
      { href: "#", label: "اردو (Urdu)" },
      { href: "#", label: "العربية (Arabic)" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="flex max-w-sm flex-col gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <BookOpenText className="size-5" />
              </span>
              <span className="font-heading text-lg text-primary">Quran Learning</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              A free Quranic education portal &mdash; a peaceful place to pray, learn,
              and belong. Available in English, Urdu, and Arabic.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
                <ul className="flex flex-col gap-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Free Quranic Learning Portal. Free for everyone, everywhere.</p>
          <p>Made with care for the global Muslim community.</p>
        </div>
      </div>
    </footer>
  );
}
