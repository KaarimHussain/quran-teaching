import Link from "next/link";
import { BookOpenText } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const t = await getTranslations("auth.login");

  return (
    <div className="flex min-h-full flex-1">
      {/* Decorative panel */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_20%_20%,white_1px,transparent_1px),radial-gradient(circle_at_60%_70%,white_1px,transparent_1px)] bg-size-[48px_48px,64px_64px]"
        />
        <Link href="/" className="relative flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <BookOpenText className="size-5" />
          </span>
          <span className="font-heading text-lg">Quran Learning</span>
        </Link>

        <div className="relative flex flex-col gap-4 rounded-3xl border border-primary-foreground/15 bg-primary-foreground/5 p-8 backdrop-blur-sm">
          <p className="font-heading text-2xl leading-relaxed sm:text-3xl">
            &ldquo;The best among you are those who learn the Quran and teach it.&rdquo;
          </p>
          <p className="text-sm text-primary-foreground/70">
            &mdash; Prophet Muhammad ﷺ (Sahih al-Bukhari)
          </p>
        </div>

        <p className="relative text-sm text-primary-foreground/70">
          Welcome back to a peaceful place to pray, learn, and belong.
        </p>
      </div>

      {/* Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Link href="/" className="flex items-center gap-2 self-center lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <BookOpenText className="size-5" />
            </span>
            <span className="font-heading text-lg text-primary">Quran Learning</span>
          </Link>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-primary">{t("title")}</CardTitle>
              <CardDescription>{t("subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <div className="flex w-full items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">{t("noAccount")}</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <Button asChild variant="outline" className="w-full rounded-full">
                <Link href="/register">{t("register")}</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
