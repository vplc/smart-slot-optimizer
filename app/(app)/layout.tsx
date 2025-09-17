import type { PropsWithChildren } from "react";
import { Nav } from "@/components/Nav";

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">{children}</main>
    </div>
  );
}
