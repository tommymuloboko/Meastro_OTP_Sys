import { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { FileText, Search } from 'lucide-react';

export default function SystemTxPage() {
  const { orders, payments } = useOrders();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  type TxRow = {
    date: string;
    reference: string;
    vehicleId: string;
    description: string;
    qty: string;
    rate: string;
    amount: string;
    type: 'Fuel Sale' | 'Payment';
  };

  const fuelTx: TxRow[] = orders
    .filter(o => o.status === 'completed')
    .map(o => ({
      date: new Date(o.completedAt || o.createdAt).toLocaleDateString('en-ZA', { day: '2-digit', month: '2-digit' }),
      reference: o.id,
      vehicleId: o.vehicleRegNumber,
      description: `${o.fuelType} — ${o.driverName}`,
      qty: o.fuelVolumeAllocated.toFixed(2),
      rate: 'R 1.55',
      amount: `R ${(o.fuelVolumeAllocated * 1.55).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
      type: 'Fuel Sale' as const,
    }));

  const payTx: TxRow[] = payments.map(p => ({
    date: new Date(p.dateTime).toLocaleDateString('en-ZA', { day: '2-digit', month: '2-digit' }),
    reference: p.referenceNumber,
    vehicleId: p.customerName,
    description: `Payment: ${p.paymentMethod}`,
    qty: '—',
    rate: '—',
    amount: `(R ${p.amountReceived.toLocaleString('en-ZA', { minimumFractionDigits: 2 })})`,
    type: 'Payment' as const,
  }));

  const allTx = [...fuelTx, ...payTx].sort((a, b) => b.date.localeCompare(a.date));

  const filtered = allTx.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !search || t.reference.toLowerCase().includes(q) || t.vehicleId.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    const matchType = typeFilter === 'All' || t.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="page page-wide">
      <div className="page-header">
        <div>
          <h1><FileText size={22} style={{ verticalAlign: 'middle', marginRight: 6 }} />System Transactions</h1>
          <p className="text-muted">All fuel sales and payments in one view</p>
        </div>
      </div>

      <div className="qbo-kpi-row" style={{ marginBottom: 20 }}>
        <div className="qbo-kpi-card">
          <div className="qbo-kpi-icon qbo-kpi-blue"><FileText size={22} /></div>
          <div className="qbo-kpi-body">
            <span className="qbo-kpi-label">Total Transactions</span>
            <span className="qbo-kpi-value">{filtered.length}</span>
          </div>
        </div>
      </div>

      <div className="table-toolbar" style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-wrapper" style={{ flex: 1, minWidth: 220 }}>
          <Search size={16} className="search-icon" />
          <input className="search-input" placeholder="Search by reference, vehicle or description…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: 160 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option>All</option>
          <option>Fuel Sale</option>
          <option>Payment</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Reference</th>
              <th>Vehicle/ID</th>
              <th>Description</th>
              <th style={{ textAlign: 'right' }}>Qty (L)</th>
              <th style={{ textAlign: 'right' }}>Rate</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No transactions found.</td></tr>
            )}
            {filtered.map((t, i) => (
              <tr key={i}>
                <td>{t.date}</td>
                <td><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{t.reference}</span></td>
                <td>{t.vehicleId}</td>
                <td>{t.description}</td>
                <td style={{ textAlign: 'right' }}>{t.qty}</td>
                <td style={{ textAlign: 'right' }}>{t.rate}</td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: t.type === 'Payment' ? '#2ca01c' : 'var(--text)' }}>{t.amount}</td>
                <td>
                  <span className="pay-type-badge" style={{
                    background: t.type === 'Payment' ? '#2ca01c18' : '#0077c218',
                    color: t.type === 'Payment' ? '#2ca01c' : '#0077c2',
                  }}>{t.type}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
