import type { PropsWithChildren } from "react";

export default function PublicLayout({ children }: PropsWithChildren) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      {children}
    </main>
  );
}
