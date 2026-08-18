import Image from "next/image";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white p-2.5 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-800">
            <Image
              src="/logo.png"
              alt="Birr Gebeya"
              width={512}
              height={512}
              className="h-full w-full rounded-full object-contain"
              priority
            />
          </div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Birr Gebeya Broker
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Sign in with your broker account
          </p>
        </div>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
