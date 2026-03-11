import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import {
  DollarSign,
  Droplets,
  Gauge,
  Users,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';

/* ───────── Donut Chart ───────── */
interface DonutSlice { label: string; value: number; color: string }

function DonutChart({ slices, size = 220 }: { slices: DonutSlice[]; size?: number }) {
  const total = slices.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="qbo-empty-chart">No data</div>;

  const cx = size / 2, cy = size / 2;
  const outerR = size / 2 - 6, innerR = outerR * 0.62;
  let cum = -90;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map(slice => {
        const angle = (slice.value / total) * 360;
        const start = cum; cum += angle;
        const sR = (Math.PI / 180) * start, eR = (Math.PI / 180) * cum;
        const la = angle > 180 ? 1 : 0;
        const d = [
          `M ${cx + outerR * Math.cos(sR)} ${cy + outerR * Math.sin(sR)}`,
          `A ${outerR} ${outerR} 0 ${la} 1 ${cx + outerR * Math.cos(eR)} ${cy + outerR * Math.sin(eR)}`,
          `L ${cx + innerR * Math.cos(eR)} ${cy + innerR * Math.sin(eR)}`,
          `A ${innerR} ${innerR} 0 ${la} 0 ${cx + innerR * Math.cos(sR)} ${cy + innerR * Math.sin(sR)}`,
          'Z',
        ].join(' ');
        return <path key={slice.label} d={d} fill={slice.color} />;
      })}
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="24" fontWeight="700" fill="#2d2d2d">{total.toLocaleString()}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#6b7280">Total Litres</text>
    </svg>
  );
}

/* ───────── Bar Chart ───────── */
function BarChart({ bars, color = '#2ca01c' }: { bars: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...bars.map(b => b.value), 1);
  return (
    <div className="qbo-bar-chart">
      {bars.map(b => (
        <div key={b.label} className="qbo-bar-item">
          <span className="qbo-bar-label">{b.label}</span>
          <div className="qbo-bar-track">
            <div className="qbo-bar-fill" style={{ width: `${(b.value / max) * 100}%`, background: color }} />
          </div>
          <span className="qbo-bar-value">{b.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

/* ───────── Line Chart (7-day trend) ───────── */
function LineChart({ points, color = '#0077c2' }: { points: { label: string; value: number }[]; color?: string }) {
  const w = 100, h = 50;
  const max = Math.max(...points.map(p => p.value), 1);
  const step = w / Math.max(points.length - 1, 1);
  const coords = points.map((p, i) => ({ x: i * step, y: h - (p.value / max) * (h - 6) }));
  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const area = `${line} L ${coords[coords.length - 1].x} ${h} L 0 ${h} Z`;

  return (
    <div className="qbo-line-chart">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="lcGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#lcGrad)" />
        <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r="2" fill={color} />)}
      </svg>
      <div className="qbo-line-labels">
        {points.map(p => <span key={p.label}>{p.label}</span>)}
      </div>
    </div>
  );
}

/* ───────── Dashboard ───────── */
export default function OmcDashboardPage() {
  const { user } = useAuth();
  const { orders } = useOrders();
  const [revPeriod, setRevPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  if (!user || !user.siteId) return null;

  const siteOrders = orders.filter(o => o.siteId === user.siteId);
  const completedOrders = siteOrders.filter(o => o.status === 'completed');

  /* KPI */
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCompleted = completedOrders.filter(o => o.completedAt?.slice(0, 10) === todayStr);
  const todaySales = todayCompleted.reduce((s, o) => s + o.fuelVolumeAllocated * 22.5, 0);
  const totalLitres = completedOrders.reduce((s, o) => s + o.fuelVolumeAllocated, 0);
  const activePumps = 4;
  const alerts = siteOrders.filter(o => o.status === 'rejected').length;

  /* Fuel breakdown (donut) */
  const fuelMap: Record<string, number> = {};
  completedOrders.forEach(o => { fuelMap[o.fuelType] = (fuelMap[o.fuelType] || 0) + o.fuelVolumeAllocated; });
  const fuelColors: Record<string, string> = { Diesel: '#2ca01c', Petrol: '#0077c2', Kerosene: '#f5a623', LPG: '#d0021b' };
  const donutSlices: DonutSlice[] = Object.entries(fuelMap).map(([label, value]) => ({ label, value, color: fuelColors[label] || '#888' }));

  /* Stock levels (simulated) — capacity & current */
  const fuelStockTanks = [
    { grade: 'Unleaded 93', current: 12200, capacity: 23000, color: '#0077c2' },
    { grade: 'Unleaded 95', current: 9800,  capacity: 23000, color: '#2ca01c' },
    { grade: 'Diesel 50ppm', current: 18500, capacity: 30000, color: '#f5a623' },
    { grade: 'Diesel 500ppm', current: 6800, capacity: 30000, color: '#d0021b' },
  ];

  /* Sales by customer (bar) */
  const custMap: Record<string, { name: string; litres: number; amount: number }> = {};
  completedOrders.forEach(o => {
    if (!custMap[o.customerId]) custMap[o.customerId] = { name: o.customerName, litres: 0, amount: 0 };
    custMap[o.customerId].litres += o.fuelVolumeAllocated;
    custMap[o.customerId].amount += o.fuelVolumeAllocated * 22.5;
  });
  const customerBars = Object.values(custMap).map(c => ({ label: c.name, value: c.litres }));

  /* Sales by attendant */
  const attendantData = [
    { name: 'Sipho M.', litres: 1200, amount: 27000 },
    { name: 'Lerato K.', litres: 980, amount: 22050 },
    { name: 'James N.', litres: 750, amount: 16875 },
  ];
  const attendantBars = attendantData.map(a => ({ label: a.name, value: a.litres }));

  /* Revenue by fuel — daily / weekly / monthly */
  const revenueByFuel: Record<string, { daily: number; weekly: number; monthly: number }> = {
    'Unleaded 95': { daily: 14200, weekly: 98500, monthly: 405000 },
    'Diesel 50ppm': { daily: 32800, weekly: 228600, monthly: 945000 },
  };
  const fuelRevenueColors: Record<string, string> = {
    'Unleaded 95': '#2ca01c',
    'Diesel 50ppm': '#f5a623',
  };

  /* 7-day trend */
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const trendData = days.map(d => ({ label: d, value: Math.floor(Math.random() * 8000 + 4000) }));

  return (
    <div className="page page-wide">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted">Site: {user.siteId} — Real-time overview</p>
        </div>
      </div>

      {/* ── KPI ROW ── */}
      <div className="qbo-kpi-row">
        <div className="qbo-kpi-card">
          <div className="qbo-kpi-icon qbo-kpi-green"><DollarSign size={22} /></div>
          <div className="qbo-kpi-body">
            <span className="qbo-kpi-label">Today's Sales</span>
            <span className="qbo-kpi-value">R {todaySales.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
        <div className="qbo-kpi-card">
          <div className="qbo-kpi-icon qbo-kpi-blue"><Droplets size={22} /></div>
          <div className="qbo-kpi-body">
            <span className="qbo-kpi-label">Total Litres Sold</span>
            <span className="qbo-kpi-value">{totalLitres.toLocaleString()} L</span>
          </div>
        </div>
        <div className="qbo-kpi-card">
          <div className="qbo-kpi-icon qbo-kpi-orange"><Gauge size={22} /></div>
          <div className="qbo-kpi-body">
            <span className="qbo-kpi-label">Active Pumps</span>
            <span className="qbo-kpi-value">{activePumps}</span>
          </div>
        </div>
        <div className="qbo-kpi-card">
          <div className="qbo-kpi-icon qbo-kpi-red"><AlertTriangle size={22} /></div>
          <div className="qbo-kpi-body">
            <span className="qbo-kpi-label">Alerts / Loss Prevention</span>
            <span className="qbo-kpi-value">{alerts}</span>
          </div>
        </div>
      </div>

      {/* ── ROW 1: Trend + Donut ── */}
      <div className="qbo-grid-2">
        <div className="qbo-chart-card">
          <h3>Weekly Sales Trend</h3>
          <LineChart points={trendData} />
        </div>
        <div className="qbo-chart-card">
          <h3>All Orders</h3>
          {(() => {
            const statusData = [
              { label: 'Pending', count: orders.filter(o => o.status === 'pending').length, color: '#f5a623' },
              { label: 'Approved', count: orders.filter(o => o.status === 'approved').length, color: '#2ca01c' },
              { label: 'Rejected', count: orders.filter(o => o.status === 'rejected').length, color: '#d9534f' },
              { label: 'Completed', count: orders.filter(o => o.status === 'completed').length, color: '#0077c2' },
            ];
            return (
              <div className="qbo-donut-wrapper">
                <DonutChart slices={statusData.map(s => ({ label: s.label, value: s.count, color: s.color }))} />
                <div className="qbo-donut-legend">
                  {statusData.map(s => (
                    <div key={s.label} className="qbo-legend-item">
                      <span className="qbo-legend-dot" style={{ background: s.color }} />
                      <span className="qbo-legend-label">{s.label}</span>
                      <span className="qbo-legend-value">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── ROW 2: Attendant + Revenue ── */}
      {/* ── ROW 2: Fuel Stock Levels + Revenue ── */}
      <div className="qbo-grid-2">
        <div className="qbo-chart-card">
          <h3><Droplets size={18} /> Fuel Stock Levels</h3>
          <div className="qbo-fuel-tanks">
            {fuelStockTanks.map(t => {
              const pct = Math.round((t.current / t.capacity) * 100);
              const isLow = pct < 25;
              return (
                <div key={t.grade} className="qbo-fuel-tank">
                  <div className="qbo-tank-gauge">
                    <div
                      className={`qbo-tank-fill${isLow ? ' qbo-tank-low' : ''}`}
                      style={{ height: `${pct}%`, background: isLow ? '#d0021b' : t.color }}
                    />
                    <span className="qbo-tank-pct">{pct}%</span>
                  </div>
                  <div className="qbo-tank-info">
                    <span className="qbo-tank-grade">{t.grade}</span>
                    <span className="qbo-tank-litres">{t.current.toLocaleString()} L</span>
                    <span className="qbo-tank-cap">of {t.capacity.toLocaleString()} L</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="qbo-chart-card">
          <h3><DollarSign size={18} /> Revenue by Fuel</h3>
          <div className="qbo-rev-tabs">
            {(['daily', 'weekly', 'monthly'] as const).map(p => (
              <button
                key={p}
                className={`qbo-rev-tab${revPeriod === p ? ' active' : ''}`}
                onClick={() => setRevPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <div className="qbo-rev-cards">
            {Object.entries(revenueByFuel).map(([grade, rev]) => (
              <div key={grade} className="qbo-rev-card">
                <span className="qbo-rev-dot" style={{ background: fuelRevenueColors[grade] }} />
                <div className="qbo-rev-info">
                  <span className="qbo-rev-grade">{grade}</span>
                  <span className="qbo-rev-amount">R {rev[revPeriod].toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            ))}
            <div className="qbo-rev-total">
              <span>Total</span>
              <span className="qbo-rev-amount">
                R {Object.values(revenueByFuel).reduce((s, r) => s + r[revPeriod], 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
