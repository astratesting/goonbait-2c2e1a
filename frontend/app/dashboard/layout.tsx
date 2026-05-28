import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { BarChart3, FilePlus2, Files, GitBranch, Settings } from 'lucide-react';

const nav = [
  ['Overview', '/dashboard', BarChart3],
  ['Invoices', '#invoices', Files],
  ['Upload', '#upload', FilePlus2],
  ['Approvals', '#approvals', GitBranch],
  ['Settings', '#settings', Settings]
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white p-6 lg:block">
        <Link href="/" className="text-xl font-bold text-ink">Goonbait</Link>
        <nav className="mt-10 space-y-2">
          {nav.map(([label, href, Icon]) => (
            <Link key={label} href={href} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-brand">
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-sm text-slate-500">Firm workspace</p>
            <h1 className="text-xl font-bold text-ink">Invoice operations dashboard</h1>
          </div>
          <UserButton afterSignOutUrl="/" />
        </header>
        {children}
      </div>
    </div>
  );
}
