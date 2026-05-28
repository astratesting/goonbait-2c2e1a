import Link from 'next/link';
import { ArrowRight, Bot, CheckCircle2, GitBranch, Search, ShieldCheck, Workflow } from 'lucide-react';
import Navbar from '@/components/Navbar';

const features = [
  {
    icon: Bot,
    title: 'AI categorization that improves',
    body: 'Rule engine matches vendor, memo, and line-item keywords, scores confidence, then stores user corrections in Supabase for better future suggestions.'
  },
  {
    icon: Workflow,
    title: 'Approval chains for firms',
    body: 'Build ordered approval steps by role: preparer, manager, partner, or custom firm roles. Track each invoice by current step and required approval.'
  },
  {
    icon: Search,
    title: 'Repository built for audit work',
    body: 'Search every invoice by vendor, status, category, amount, date range, due date, and approval state from one clean dashboard.'
  }
];

const metrics = [
  ['68%', 'firms still key invoices manually'],
  ['$15', 'average manual invoice cost'],
  ['$2.50', 'target automated processing cost']
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-blue-50">
      <Navbar />
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <ShieldCheck size={16} /> Built for accounting firms processing client invoices
          </div>
          <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-ink md:text-7xl">
            Turn invoice chaos into approved, categorized, synced work.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Goonbait combines AI-powered invoice categorization, configurable approval workflows, full repository search, and QuickBooks/Xero sync stubs in one lean MVP for firms ready to stop manual entry.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/sign-up" className="btn-primary inline-flex items-center justify-center gap-2">
              Start processing invoices <ArrowRight size={18} />
            </Link>
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-slate-100">
              View demo dashboard
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {metrics.map(([value, label]) => (
              <div key={value} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-2xl font-bold text-ink">{value}</div>
                <div className="mt-1 text-sm text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Invoice AI preview</p>
              <h2 className="text-2xl font-bold">Acme Cloud Services</h2>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">94% confidence</span>
          </div>
          <div className="space-y-4">
            {[
              ['Category', 'Software / SaaS'],
              ['Approval chain', 'Manager → Partner'],
              ['Current status', 'Pending manager approval'],
              ['Suggested action', 'Approve and queue QuickBooks sync']
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span className="text-sm text-slate-500">{label}</span>
                <span className="font-semibold text-ink">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-ink p-5 text-white">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-100"><GitBranch size={16} /> Learning rule captured</div>
            <p className="mt-2 text-sm leading-6 text-slate-200">When user corrects vendor “Acme Cloud” to Software, Goonbait stores keyword + firm-specific correction in Supabase.</p>
          </div>
        </div>
      </section>
      <section id="features" className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="card">
              <feature.icon className="text-brand" size={28} />
              <h3 className="mt-5 text-xl font-bold text-ink">{feature.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>
      <section id="integrations" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl bg-ink p-8 text-white md:p-12">
          <h2 className="text-3xl font-bold">Integration-ready from day one</h2>
          <p className="mt-4 max-w-3xl text-slate-300">Connect settings pages include QuickBooks and Xero mock sync buttons so early customers can validate workflow before live OAuth integrations land.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {['QuickBooks sandbox sync', 'Xero practice ledger sync'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                <CheckCircle2 className="text-mint" /> <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
