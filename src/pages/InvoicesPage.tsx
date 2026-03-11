import { FileBarChart } from 'lucide-react';

export default function InvoicesPage() {
  return (
    <div className="page page-wide">
      <div className="page-header">
        <div>
          <h1>Invoices</h1>
          <p className="text-muted">Manage and view invoices</p>
        </div>
      </div>
      <div className="empty-state">
        <FileBarChart size={48} />
        <p>No invoices yet.</p>
      </div>
    </div>
  );
}
