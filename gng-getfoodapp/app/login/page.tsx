import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand-logo";
import { LoginForm } from "@/components/auth/login-form";
import { InstallAppButton } from "@/components/pwa/install-app-button";

export const metadata: Metadata = {
  title: "Sign in — GNG Get Food",
};

export default function LoginPage() {
  return (
    <div className="min-h-dvh w-full lg:grid lg:grid-cols-2">
      <div className="relative hidden min-h-dvh lg:block">
        <Image
          src="/HeaderImage.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/10" />
        <div className="relative flex h-full flex-col p-10 pt-12 xl:p-14 xl:pt-16">
          <BrandLogo size={80} />
          <div className="mt-auto">
            <h1 className="font-heading text-4xl leading-tight text-white xl:text-5xl">
              GNG Get Food
            </h1>
            <p className="mt-2 max-w-md text-base text-white/85">
              Your subscriber portal for harvest RSVPs, community chat, and impact.
            </p>
          </div>
        </div>
      </div>

      <div className="flex min-h-dvh flex-col justify-start bg-[radial-gradient(1200px_circle_at_20%_-10%,theme(colors.primary/18),transparent_45%),radial-gradient(900px_circle_at_100%_0%,theme(colors.accent/40),transparent_40%)] px-4 pb-10 pt-12 sm:pt-16 lg:px-10 lg:pt-20 xl:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
            <BrandLogo size={96} className="lg:hidden" />
            <div>
              <h1 className="font-heading text-2xl lg:text-3xl">Sign in</h1>
              <p className="text-sm text-muted-foreground">
                Active subscribers and staff
              </p>
            </div>
          </div>
          <Suspense fallback={<p className="text-center text-sm lg:text-left">Loading…</p>}>
            <div className="space-y-4">
              <InstallAppButton />
              <LoginForm />
              <p className="text-center text-sm text-muted-foreground lg:text-left">
                Need help putting this on your phone?{" "}
                <Link
                  href="/install"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Easy install guide
                </Link>
              </p>
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
