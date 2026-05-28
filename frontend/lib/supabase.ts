import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type InvoiceStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'synced';

export type Invoice = {
  id: string;
  vendor: string;
  amount: number;
  currency: string;
  invoice_date: string;
  due_date: string;
  status: InvoiceStatus;
  category: string;
  category_confidence: number;
  notes: string;
  current_step: number;
};

export const sampleInvoices: Invoice[] = [
  {
    id: 'inv_1001',
    vendor: 'Stripe',
    amount: 2490,
    currency: 'USD',
    invoice_date: '2026-05-02',
    due_date: '2026-05-30',
    status: 'pending_approval',
    category: 'Software',
    category_confidence: 0.94,
    notes: 'Matched subscription and SaaS rules.',
    current_step: 1
  },
  {
    id: 'inv_1002',
    vendor: 'Delta Air Lines',
    amount: 880.75,
    currency: 'USD',
    invoice_date: '2026-05-05',
    due_date: '2026-06-04',
    status: 'approved',
    category: 'Travel',
    category_confidence: 0.89,
    notes: 'User correction improved travel keywords.',
    current_step: 2
  },
  {
    id: 'inv_1003',
    vendor: 'Office Depot',
    amount: 312.2,
    currency: 'USD',
    invoice_date: '2026-05-10',
    due_date: '2026-06-10',
    status: 'synced',
    category: 'Office Supplies',
    category_confidence: 0.91,
    notes: 'Synced to QuickBooks sandbox.',
    current_step: 2
  }
];
