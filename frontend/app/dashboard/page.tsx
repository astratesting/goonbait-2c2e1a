'use client';

import { useMemo, useState } from 'react';
import { Bot, CheckCircle2, Clock3, PlugZap, Search, SlidersHorizontal, UploadCloud } from 'lucide-react';
import { sampleInvoices } from '@/lib/supabase';

const categories = ['All', 'Software', 'Travel', 'Office Supplies', 'Professional Services'];
const statuses = ['All', 'draft', 'pending_approval', 'approved', 'rejected', 'synced'];

function money(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

export default function DashboardPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [vendor, setVendor] = useState('');
  const [previewCategory, setPreviewCategory] = useState('Software');
  const [previewConfidence, setPreviewConfidence] = useState(94);

  const invoices = useMemo(() => {
    return sampleInvoices.filter((invoice) => {
      const textMatch = [invoice.vendor, invoice.category, invoice.status].join(' ').toLowerCase().includes(query.toLowerCase());
      const vendorMatch = !vendor || invoice.vendor.toLowerCase().includes(vendor.toLowerCase());
      const statusMatch = status === 'All' || invoice.status === status;
      const categoryMatch = category === 'All' || invoice.category === category;
      const minMatch = !minAmount || invoice.amount >= Number(minAmount);
      const maxMatch = !maxAmount || invoice.amount <= Number(maxAmount);
      const fromMatch = !dateFrom || invoice.invoice_date >= dateFrom;
      const toMatch = !dateTo || invoice.invoice_date <= dateTo;
      return textMatch && vendorMatch && statusMatch && categoryMatch && minMatch && maxMatch && fromMatch && toMatch;
    });
  }, [query, status, category, minAmount, maxAmount, dateFrom, dateTo, vendor]);

  const total = sampleInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const pending = sampleInvoices.filter((invoice) => invoice.status === 'pending_approval').length;
  const avgConfidence = Math.round(sampleInvoices.reduce((sum, invoice) => sum + invoice.category_confidence, 0) / sampleInvoices.length * 100);

  function handlePreview(vendorName: string) {
    const lower = vendorName.toLowerCase();
    if (lower.includes('hotel') || lower.includes('air') || lower.includes('uber')) {
      setPreviewCategory('Travel');
      setPreviewConfidence(88);
      return;
    }
    if (lower.includes('office') || lower.includes('depot')) {
      setPreviewCategory('Office Supplies');
      setPreviewConfidence(91);
      return;
    }
    setPreviewCategory('Software');
    setPreviewConfidence(94);
  }

  return (
    <main className="space-y-8 p-6">
      <section className="grid gap-4 md:grid-cols-4">
        {[
          ['Invoices processed', sampleInvoices.length.toString(), Clock3],
          ['Pending approvals', pending.toString(), CheckCircle2],
          ['Repository value', money(total), SlidersHorizontal],
          ['AI avg confidence', `${avgConfidence}%`, Bot]
        ].map(([label, value, Icon]) => (
          <div key={label as string} className="card">
            <Icon className="text-brand" size={24} />
            <p className="mt-4 text-sm text-slate-500">{label as string}</p>
            <p className="mt-1 text-2xl font-bold text-ink">{value as string}</p>
          </div>
        ))}
      </section>

      <section id="invoices" className="card">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-ink">Invoice repository</h2>
            <p className="text-slate-500">Search and filter by status, category, amount, vendor, and invoice date.</p>
          </div>
          <div className="relative md:w-80">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input className="input pl-10" placeholder="Search invoices" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-6">
          <input className="input" placeholder="Vendor" value={vendor} onChange={(event) => setVendor(event.target.value)} />
          <select className="input" value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select>
          <select className="input" value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select>
          <input className="input" placeholder="Min amount" value={minAmount} onChange={(event) => setMinAmount(event.target.value)} />
          <input className="input" placeholder="Max amount" value={maxAmount} onChange={(event) => setMaxAmount(event.target.value)} />
          <div className="grid grid-cols-2 gap-2"><input className="input" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /><input className="input" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></div>
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr><th className="p-4">Vendor</th><th className="p-4">Amount</th><th className="p-4">Date</th><th className="p-4">Status</th><th className="p-4">AI category</th><th className="p-4">Detail</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="p-4 font-semibold text-ink">{invoice.vendor}</td>
                  <td className="p-4">{money(invoice.amount, invoice.currency)}</td>
                  <td className="p-4">{invoice.invoice_date}</td>
                  <td className="p-4"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{invoice.status}</span></td>
                  <td className="p-4">{invoice.category} · {Math.round(invoice.category_confidence * 100)}%</td>
                  <td className="p-4 text-slate-600">Step {invoice.current_step}: {invoice.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <div id="upload" className="card">
          <UploadCloud className="text-brand" size={28} />
          <h2 className="mt-4 text-2xl font-bold text-ink">Upload invoice with AI preview</h2>
          <div className="mt-5 space-y-3">
            <input className="input" placeholder="Vendor name" onChange={(event) => handlePreview(event.target.value)} />
            <input className="input" placeholder="Amount" />
            <textarea className="input" placeholder="Invoice notes or pasted line items" rows={4} />
            <div className="rounded-2xl bg-blue-50 p-4 text-blue-800">
              Suggested category: <strong>{previewCategory}</strong> · Confidence: <strong>{previewConfidence}%</strong>
            </div>
            <button className="btn-primary">Save invoice and queue approval</button>
          </div>
        </div>

        <div id="approvals" className="card">
          <h2 className="text-2xl font-bold text-ink">Approval chain builder</h2>
          <p className="mt-2 text-slate-500">Configure ordered ApprovalSteps by approver role.</p>
          <div className="mt-6 space-y-3">
            {['Preparer review', 'Manager approval', 'Partner final sign-off'].map((step, index) => (
              <div key={step} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div><p className="font-semibold text-ink">Step {index + 1}: {step}</p><p className="text-sm text-slate-500">Required role: {index === 0 ? 'accountant' : index === 1 ? 'manager' : 'partner'}</p></div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">required</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="settings" className="card">
        <div className="flex items-center gap-3"><PlugZap className="text-brand" /><h2 className="text-2xl font-bold text-ink">Accounting integration stubs</h2></div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {['QuickBooks', 'Xero'].map((name) => (
            <div key={name} className="rounded-2xl border border-slate-200 p-5">
              <h3 className="text-lg font-bold text-ink">{name}</h3>
              <p className="mt-2 text-sm text-slate-500">Connection settings page and mock sync action for demo validation.</p>
              <button className="mt-4 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white">Mock sync to {name}</button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
