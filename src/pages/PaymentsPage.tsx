import { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { DollarSign, Search, Plus, SquarePen, Trash, Check, X, Filter } from 'lucide-react';
import type { Payment, PaymentTransactionType, PaymentMethod } from '../types';

const methodColors: Record<string, string> = {
  Cash: '#2ca01c',
  Check: '#0077c2',
  'Credit Card': '#7c3aed',
};

const typeColors: Record<string, string> = {
  'Account Payment': '#0077c2',
  'AR Receipt': '#f5a623',
};

export default function PaymentsPage() {
  const { customers, payments, addPayment, updatePayment, deletePayment } = useOrders();
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('All');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Payment | null>(null);

  /* new payment form state */
  const [newCustomerId, setNewCustomerId] = useState('');
  const [newType, setNewType] = useState<PaymentTransactionType>('Account Payment');
  const [newAmount, setNewAmount] = useState('');
  const [newMethod, setNewMethod] = useState<PaymentMethod>('Cash');
  const [newRef, setNewRef] = useState('');
  const [newBalance, setNewBalance] = useState('');

  const handleAdd = () => {
    if (!newCustomerId || !newAmount.trim()) return;
    const cust = customers.find(c => c.id === newCustomerId);
    if (!cust) return;
    addPayment({
      customerName: cust.name,
      customerId: cust.id,
      transactionType: newType,
      amountReceived: parseFloat(newAmount) || 0,
      paymentMethod: newMethod,
      referenceNumber: newRef.trim() || `REF-${Date.now()}`,
      balanceAfter: parseFloat(newBalance) || 0,
    });
    setNewCustomerId(''); setNewAmount('');
    setNewRef(''); setNewBalance(''); setShowAdd(false);
  };

  const handleEdit = (p: Payment) => { setEditingId(p.id); setEditData({ ...p }); };
  const handleSave = () => {
    if (!editData) return;
    updatePayment(editData.id, editData);
    setEditingId(null); setEditData(null);
  };
  const handleCancel = () => { setEditingId(null); setEditData(null); };

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !search || p.customerName.toLowerCase().includes(q) || p.customerId.toLowerCase().includes(q) || p.referenceNumber.toLowerCase().includes(q);
    const matchMethod = methodFilter === 'All' || p.paymentMethod === methodFilter;
    return matchSearch && matchMethod;
  });

  const totalReceived = filtered.reduce((s, p) => s + p.amountReceived, 0);

  const fmt = (n: number) => `R ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
  const fmtDate = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + dt.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="page page-wide">
      <div className="page-header">
        <div>
          <h1><DollarSign size={22} style={{ verticalAlign: 'middle', marginRight: 6 }} />Payments</h1>
          <p className="text-muted">Record and track all account payments &amp; AR receipts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={16} /> Record Payment
        </button>
      </div>

      {/* KPI summary */}
      <div className="qbo-kpi-row" style={{ marginBottom: 20 }}>
        <div className="qbo-kpi-card">
          <div className="qbo-kpi-icon qbo-kpi-green"><DollarSign size={22} /></div>
          <div className="qbo-kpi-body">
            <span className="qbo-kpi-label">Total Received</span>
            <span className="qbo-kpi-value">{fmt(totalReceived)}</span>
          </div>
        </div>
        <div className="qbo-kpi-card">
          <div className="qbo-kpi-icon qbo-kpi-blue"><Filter size={22} /></div>
          <div className="qbo-kpi-body">
            <span className="qbo-kpi-label">Transactions</span>
            <span className="qbo-kpi-value">{filtered.length}</span>
          </div>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card" style={{ marginBottom: 20, padding: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Record New Payment</h3>
          <div className="form-grid-3">
            <div className="form-group">
              <label>Customer *</label>
              <select className="form-input" value={newCustomerId} onChange={e => setNewCustomerId(e.target.value)}>
                <option value="">— Select Customer —</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.companyName})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Transaction Type</label>
              <select className="form-input" value={newType} onChange={e => setNewType(e.target.value as PaymentTransactionType)}>
                <option>Account Payment</option>
                <option>AR Receipt</option>
              </select>
            </div>
            <div className="form-group">
              <label>Amount Received (R) *</label>
              <input className="form-input" type="number" min="0" step="0.01" value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select className="form-input" value={newMethod} onChange={e => setNewMethod(e.target.value as PaymentMethod)}>
                <option>Cash</option>
                <option>Check</option>
                <option>Credit Card</option>
              </select>
            </div>
            <div className="form-group">
              <label>Reference Number</label>
              <input className="form-input" value={newRef} onChange={e => setNewRef(e.target.value)} placeholder="e.g. CHK-006214" />
            </div>
            <div className="form-group">
              <label>Balance After (R)</label>
              <input className="form-input" type="number" min="0" step="0.01" value={newBalance} onChange={e => setNewBalance(e.target.value)} placeholder="0.00" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-primary" onClick={handleAdd}>Save Payment</button>
            <button className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Search + filter bar */}
      <div className="table-toolbar" style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-wrapper" style={{ flex: 1, minWidth: 220 }}>
          <Search size={16} className="search-icon" />
          <input className="search-input" placeholder="Search by name, ID or reference…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: 160 }} value={methodFilter} onChange={e => setMethodFilter(e.target.value)}>
          <option>All</option>
          <option>Cash</option>
          <option>Check</option>
          <option>Credit Card</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date &amp; Time</th>
              <th>Customer</th>
              <th>Customer ID</th>
              <th>Type</th>
              <th>Amount Received</th>
              <th>Method</th>
              <th>Reference #</th>
              <th>Balance After</th>
              <th style={{ width: 80 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No payments found.</td></tr>
            )}
            {filtered.map(p => {
              const isEditing = editingId === p.id;
              const row = isEditing && editData ? editData : p;
              return (
                <tr key={p.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {isEditing
                      ? <input type="datetime-local" className="form-input" style={{ fontSize: 12 }} value={editData!.dateTime.slice(0, 16)} onChange={e => setEditData({ ...editData!, dateTime: e.target.value })} />
                      : fmtDate(row.dateTime)}
                  </td>
                  <td>
                    {isEditing ? (
                      <select className="form-input" value={editData!.customerId} onChange={e => {
                        const c = customers.find(c => c.id === e.target.value);
                        if (c) setEditData({ ...editData!, customerId: c.id, customerName: c.name });
                      }}>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.companyName})</option>
                        ))}
                      </select>
                    ) : row.customerName}
                  </td>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{row.customerId}</span></td>
                  <td>
                    {isEditing ? (
                      <select className="form-input" value={editData!.transactionType} onChange={e => setEditData({ ...editData!, transactionType: e.target.value as PaymentTransactionType })}>
                        <option>Account Payment</option>
                        <option>AR Receipt</option>
                      </select>
                    ) : (
                      <span className="pay-type-badge" style={{ background: typeColors[row.transactionType] + '18', color: typeColors[row.transactionType] }}>{row.transactionType}</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 700 }}>{fmt(row.amountReceived)}</td>
                  <td>
                    {isEditing ? (
                      <select className="form-input" value={editData!.paymentMethod} onChange={e => setEditData({ ...editData!, paymentMethod: e.target.value as PaymentMethod })}>
                        <option>Cash</option>
                        <option>Check</option>
                        <option>Credit Card</option>
                      </select>
                    ) : (
                      <span className="pay-method-badge" style={{ background: methodColors[row.paymentMethod] + '18', color: methodColors[row.paymentMethod] }}>{row.paymentMethod}</span>
                    )}
                  </td>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{row.referenceNumber}</span></td>
                  <td style={{ fontWeight: 600, color: row.balanceAfter === 0 ? '#2ca01c' : 'var(--text)' }}>
                    {isEditing
                      ? <input className="form-input" type="number" min="0" step="0.01" value={editData!.balanceAfter} onChange={e => setEditData({ ...editData!, balanceAfter: parseFloat(e.target.value) || 0 })} />
                      : fmt(row.balanceAfter)}
                  </td>
                  <td>
                    <div className="table-actions">
                      {isEditing ? (
                        <>
                          <button className="qbo-action-btn qbo-action-save" title="Save" onClick={handleSave}><Check size={15} /></button>
                          <button className="qbo-action-btn qbo-action-cancel" title="Cancel" onClick={handleCancel}><X size={15} /></button>
                        </>
                      ) : (
                        <>
                          <button className="qbo-action-btn qbo-action-edit" title="Edit" onClick={() => handleEdit(p)}><SquarePen size={15} /></button>
                          <button className="qbo-action-btn qbo-action-delete" title="Delete" onClick={() => deletePayment(p.id)}><Trash size={15} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
