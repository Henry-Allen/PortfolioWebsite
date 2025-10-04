export const dynamic = "force-dynamic";

import { TerminalView } from "@/components/TerminalView";

export default function Home() {
  return (
    <main className="flex h-dvh w-full items-stretch justify-center bg-black text-white">
      <TerminalView />
    </main>
  );
}
