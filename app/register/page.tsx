import Link from "next/link";
import { BookOpenText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-full flex-1">
      {/* Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="flex w-full max-w-md flex-col gap-6">
          <Link href="/" className="flex items-center gap-2 self-center lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <BookOpenText className="size-5" />
            </span>
            <span className="font-heading text-lg text-primary">Quran Learning</span>
          </Link>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-primary">Create Your Account</CardTitle>
              <CardDescription>
                Join a free, global community of Quran learners and teachers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegisterForm />
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <div className="flex w-full items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">Already a member?</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <Button asChild variant="outline" className="w-full rounded-full">
                <Link href="/login">Log In Instead</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Decorative panel */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_20%_20%,white_1px,transparent_1px),radial-gradient(circle_at_60%_70%,white_1px,transparent_1px)] [background-size:48px_48px,64px_64px]"
        />
        <Link href="/" className="relative flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <BookOpenText className="size-5" />
          </span>
          <span className="font-heading text-lg">Quran Learning</span>
        </Link>

        <div className="relative flex flex-col gap-4 rounded-3xl border border-primary-foreground/15 bg-primary-foreground/5 p-8 backdrop-blur-sm">
          <h2 className="font-heading text-2xl sm:text-3xl">
            Join thousands learning &mdash; for free, forever.
          </h2>
          <ul className="flex flex-col gap-2 text-sm text-primary-foreground/80">
            <li>&bull; Live one-to-one &amp; group classes</li>
            <li>&bull; Progress tracking across Nazra, Hifz, Tajweed &amp; Tafseer</li>
            <li>&bull; Parent dashboards &amp; teacher messaging</li>
            <li>&bull; Volunteer teaching opportunities</li>
          </ul>
        </div>

        <p className="relative text-sm text-primary-foreground/70">
          Available in English, Urdu, and Arabic &mdash; with full RTL support.
        </p>
      </div>
    </div>
  );
}
