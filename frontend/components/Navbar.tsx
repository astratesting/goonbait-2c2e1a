import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { FileText } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-ink">
          <span className="rounded-xl bg-brand p-2 text-white"><FileText size={18} /></span>
          Goonbait
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/#features" className="text-slate-600 hover:text-ink">Features</Link>
          <Link href="/#integrations" className="text-slate-600 hover:text-ink">Integrations</Link>
          <SignedOut>
            <Link href="/sign-in" className="text-slate-700 hover:text-ink">Sign in</Link>
            <Link href="/sign-up" className="rounded-full bg-ink px-4 py-2 text-white hover:bg-slate-800">Start free</Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="rounded-full bg-brand px-4 py-2 text-white hover:bg-blue-700">Dashboard</Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}
