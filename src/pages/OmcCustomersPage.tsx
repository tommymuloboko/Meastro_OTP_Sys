import { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { Plus, Search, Users, SquarePen, Trash, Check, X } from 'lucide-react';
import type { Customer } from '../types';

export default function OmcCustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useOrders();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Customer | null>(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCompany, setNewCompany] = useState('');

  const handleAdd = () => {
    if (!newName.trim() || !newEmail.trim() || !newCompany.trim()) return;
    addCustomer({
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim(),
      companyName: newCompany.trim(),
    });
    setNewName(''); setNewEmail(''); setNewPhone(''); setNewCompany('');
    setShowAdd(false);
  };

  const handleEdit = (c: Customer) => {
    setEditingId(c.id);
    setEditData({ ...c });
  };

  const handleSave = () => {
    if (!editData) return;
    updateCustomer(editData.id, editData);
    setEditingId(null);
    setEditData(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData(null);
  };

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return (
      search === '' ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.companyName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page page-wide">
      <div className="page-header">
        <div>
          <h1>Manage Customers</h1>
          <p className="text-muted">{customers.length} customers registered</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={16} />
          Add Customer
        </button>
      </div>

      {showAdd && (
        <div className="form-section" style={{ marginBottom: '1.5rem' }}>
          <h3><Plus size={18} /> New Customer</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="e.g. John Smith" value={newName} onChange={e => setNewName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Company Name</label>
              <input type="text" placeholder="e.g. Fleet Corp" value={newCompany} onChange={e => setNewCompany(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="e.g. john@fleet.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" placeholder="+27 XX XXX XXXX" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
            </div>
          </div>
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={handleAdd} disabled={!newName.trim() || !newEmail.trim() || !newCompany.trim()}>
              <Check size={16} /> Create Customer
            </button>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="table-toolbar">
        <div className="table-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name, email, or company…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <p>No customers found.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const isEditing = editingId === c.id;
                const row = isEditing && editData ? editData : c;
                return (
                  <tr key={c.id}>
                    <td className="cell-bold">
                      {isEditing ? <input className="cell-input" value={row.name} onChange={e => setEditData({ ...row, name: e.target.value })} /> : row.name}
                    </td>
                    <td>
                      {isEditing ? <input className="cell-input" value={row.companyName} onChange={e => setEditData({ ...row, companyName: e.target.value })} /> : row.companyName}
                    </td>
                    <td>
                      {isEditing ? <input className="cell-input" value={row.email} onChange={e => setEditData({ ...row, email: e.target.value })} /> : row.email}
                    </td>
                    <td>
                      {isEditing ? <input className="cell-input" value={row.phone} onChange={e => setEditData({ ...row, phone: e.target.value })} /> : row.phone}
                    </td>
                    <td>{new Date(row.createdAt).toLocaleDateString('en-ZA')}</td>
                    <td>
                      <div className="table-actions">
                        {isEditing ? (
                          <>
                            <button className="qbo-action-btn qbo-action-save" title="Save" onClick={handleSave}><Check size={15} /></button>
                            <button className="qbo-action-btn qbo-action-cancel" title="Cancel" onClick={handleCancel}><X size={15} /></button>
                          </>
                        ) : (
                          <>
                            <button className="qbo-action-btn qbo-action-edit" title="Edit" onClick={() => handleEdit(c)}><SquarePen size={15} /></button>
                            <button className="qbo-action-btn qbo-action-delete" title="Delete" onClick={() => deleteCustomer(c.id)}><Trash size={15} /></button>
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
      )}
    </div>
  );
}
