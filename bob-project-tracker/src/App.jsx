import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleSlash,
  ClipboardList,
  Download,
  ExternalLink,
  FileText,
  Flag,
  Gavel,
  Home,
  Layers3,
  Lock,
  Menu,
  Moon,
  Search,
  Settings,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sun,
  TriangleAlert,
  User,
  X,
} from 'lucide-react'
import {
  Cell,
  Line,
  LineChart as ReLineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  auditEvents,
  decisions,
  mandates,
  milestones,
  programmes,
  progressTrend,
  reports,
  risks,
  riskTrend,
} from './data/commandCentreData.js'
import { useToast } from './state/ToastProvider.jsx'

const navItems = [
  { to: '/dashboard', label: 'Overview', Icon: Home },
  { to: '/strategic-portfolio', label: 'Strategic Portfolio', Icon: BriefcaseBusiness },
  { to: '/programmes', label: 'Programmes', Icon: Layers3 },
  { to: '/risks', label: 'Risks', Icon: TriangleAlert },
  { to: '/milestones', label: 'Milestones', Icon: Flag },
  { to: '/executive-decisions', label: 'Executive Decisions', Icon: Gavel },
  { to: '/reports', label: 'Reports', Icon: ClipboardList },
  { to: '/audit-trail', label: 'Audit Trail', Icon: ShieldCheck },
  { to: '/settings', label: 'Settings', Icon: Settings },
]

const themeStorageKey = 'bob-command-centre-theme'
const gold = '#C9A227'
const green = '#1F8A5B'
const amber = '#B7791F'
const red = '#B42318'
const blue = '#2563EB'
const purple = '#7C3AED'
function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem(themeStorageKey) || 'light')
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(themeStorageKey, theme)
  }, [theme])
  return { theme, setTheme }
}

function Badge({ children, tone = 'neutral' }) {
  return <span className={cx('badge', `badge-${tone}`)}>{children}</span>
}

function toneForStatus(status) {
  if (status === 'On Track' || status === 'Completed' || status === 'Final') return 'success'
  if (status === 'At Risk' || status === 'Pending' || status === 'Awaiting Review' || status === 'Medium') return 'warning'
  if (status === 'Off Track' || status === 'Escalated' || status === 'High' || status === 'Critical' || status === 'Very High') return 'danger'
  if (status === 'Low') return 'success'
  return 'neutral'
}

function StatusBadge({ status }) {
  return <Badge tone={toneForStatus(status)}>{status}</Badge>
}

function PriorityBadge({ priority }) {
  return <Badge tone={toneForStatus(priority)}>{priority}</Badge>
}

function ProgressBar({ value, color = green }) {
  return (
    <div className="progress-track" aria-label={`${value}%`}>
      <div className="progress-fill" style={{ width: `${value}%`, background: color }} />
    </div>
  )
}

function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {children ? <div className="page-header-actions">{children}</div> : null}
    </div>
  )
}

function StatCard({ label, value, trend, Icon, to, tone = 'gold' }) {
  const content = (
    <div className={cx('stat-card', to && 'clickable-card')}>
      <div className={cx('stat-icon', `stat-${tone}`)}>{Icon ? <Icon size={24} /> : null}</div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {trend ? <div className={cx('stat-trend', trend.includes('down') ? 'trend-down' : 'trend-up')}>{trend}</div> : null}
      </div>
    </div>
  )
  return to ? <Link to={to} className="unstyled-link">{content}</Link> : content
}

function DonutChart({ data, centerTitle, centerSub, colors = [green, amber, red, blue, purple], height = 220 }) {
  return (
    <div className="donut-wrap" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="54%" outerRadius="82%" paddingAngle={2}>
            {data.map((entry, index) => <Cell key={entry.name} fill={entry.color || colors[index % colors.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-center">
        <strong>{centerTitle}</strong>
        <span>{centerSub}</span>
      </div>
    </div>
  )
}

function LineChart({ data, lines = [{ key: 'value', color: gold }], height = 260, target = true }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart data={data} margin={{ left: -24, right: 20, top: 20, bottom: 8 }}>
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          {target && data[0]?.target !== undefined ? <Line type="monotone" dataKey="target" stroke="#94A3B8" strokeDasharray="4 4" dot={false} /> : null}
          {lines.map((line) => <Line key={line.key} type="monotone" dataKey={line.key} stroke={line.color} strokeWidth={2} dot={{ r: 3 }} />)}
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  )
}

function Modal({ title, children, onClose, footer }) {
  if (!onClose) return null
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="icon-button" type="button" aria-label="Close modal" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </div>
  )
}

function Drawer({ title, children, onClose }) {
  if (!onClose) return null
  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="drawer" role="dialog" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="icon-button" type="button" aria-label="Close drawer" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </aside>
    </div>
  )
}

function Pagination({ page, totalPages, setPage, summary }) {
  return (
    <div className="pagination">
      <span>{summary}</span>
      <div className="page-controls">
        <button type="button" className="icon-button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage(Math.max(1, page - 1))}><ChevronLeft size={16} /></button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((p) => (
          <button key={p} type="button" className={cx('page-button', p === page && 'active')} onClick={() => setPage(p)}>{p}</button>
        ))}
        <button type="button" className="icon-button" aria-label="Next page" disabled={page === totalPages} onClick={() => setPage(Math.min(totalPages, page + 1))}><ChevronRight size={16} /></button>
      </div>
    </div>
  )
}

function DataTable({ columns, rows, onRowClick, pageSize = 8 }) {
  const [sortKey, setSortKey] = useState(columns[0]?.key)
  const [direction, setDirection] = useState('asc')
  const [page, setPage] = useState(1)
  const sorted = useMemo(() => {
    const next = [...rows].sort((a, b) => String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? '')))
    return direction === 'asc' ? next : next.reverse()
  }, [rows, sortKey, direction])
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const visible = sorted.slice((safePage - 1) * pageSize, safePage * pageSize)
  return (
    <div className="table-card">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>
                  <button type="button" onClick={() => {
                    if (sortKey === column.key) setDirection(direction === 'asc' ? 'desc' : 'asc')
                    else {
                      setSortKey(column.key)
                      setDirection('asc')
                    }
                  }}>
                    {column.label} {sortKey === column.key ? (direction === 'asc' ? 'up' : 'down') : ''}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id || row.name || row.title} className={onRowClick ? 'clickable-row' : ''} onClick={() => onRowClick?.(row)}>
                {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={safePage} setPage={setPage} totalPages={totalPages} summary={`Showing ${visible.length ? (safePage - 1) * pageSize + 1 : 0} to ${Math.min(safePage * pageSize, sorted.length)} of ${sorted.length}`} />
    </div>
  )
}

function FilterBar({ children, onReset, onExport }) {
  return (
    <div className="filter-bar">
      {children}
      <div className="filter-actions">
        {onReset ? <button className="button secondary" type="button" onClick={onReset}>Reset Filters</button> : null}
        {onExport ? <button className="button secondary" type="button" onClick={onExport}><Download size={16} /> Export</button> : null}
      </div>
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="select-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  )
}

function Sidebar({ mobileOpen, closeMobile }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <>
      <div className={cx('mobile-backdrop', mobileOpen && 'open')} onClick={closeMobile} />
      <aside className={cx('sidebar', mobileOpen && 'open')}>
        <div className="brand-block">
          <div className="seal">BoB</div>
          <div className="bank-title">BANK OF BOTSWANA</div>
          <div className="bank-subtitle">Strategic Programme Command Centre</div>
        </div>
        <nav className="side-nav">
          {navItems.map(({ to, label, Icon }) => {
            const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to))
            return (
              <Link key={to} to={to} className={cx('side-link', active && 'active')} onClick={closeMobile}>
                <Icon size={19} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="sidebar-user">
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>
            <span className="avatar">EK</span>
            <span><strong>Emang K. Morake</strong><small>Deputy Governor</small></span>
            <ChevronRight size={16} />
          </button>
          {menuOpen ? (
            <div className="user-popover">
              <Link to="/profile" onClick={closeMobile}>View Profile</Link>
              <Link to="/settings" onClick={closeMobile}>Preferences</Link>
              <button type="button">Sign out</button>
            </div>
          ) : null}
        </div>
      </aside>
    </>
  )
}

function buildSearchIndex() {
  return [
    ...programmes.map((p) => ({ type: 'Programmes', title: p.name, subtitle: p.owner, path: `/programmes/${p.id}` })),
    ...risks.map((r) => ({ type: 'Risks', title: r.risk, subtitle: r.programme, path: `/risks?risk=${r.id}` })),
    ...milestones.map((m) => ({ type: 'Milestones', title: m.name, subtitle: m.programme, path: `/milestones?milestone=${m.id}` })),
    ...decisions.map((d) => ({ type: 'Executive Decisions', title: d.title, subtitle: d.status, path: `/executive-decisions?decision=${d.id}` })),
    ...reports.map((r) => ({ type: 'Reports', title: r.title, subtitle: r.period, path: `/reports/${r.id}` })),
    ...auditEvents.map((a) => ({ type: 'Audit Events', title: a.action, subtitle: `${a.actor} - ${a.object}`, path: `/audit-trail?event=${a.id}` })),
  ]
}

function CommandSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return buildSearchIndex().filter((item) => `${item.title} ${item.subtitle} ${item.type}`.toLowerCase().includes(q)).slice(0, 10)
  }, [query])
  const grouped = results.reduce((acc, item) => {
    acc[item.type] = [...(acc[item.type] || []), item]
    return acc
  }, {})
  function openResult(item) {
    if (!item) return
    setQuery('')
    setOpen(false)
    navigate(item.path)
  }
  return (
    <div className="command-search">
      <Search size={17} />
      <input
        value={query}
        placeholder="Search programmes, risks, decisions..."
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
          setActive(0)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false)
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActive((current) => Math.min(results.length - 1, current + 1))
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActive((current) => Math.max(0, current - 1))
          }
          if (event.key === 'Enter') openResult(results[active] || results[0])
        }}
      />
      {open && query ? (
        <div className="search-popover">
          {results.length === 0 ? <div className="empty-search">No results found</div> : null}
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <div className="search-group">{type}</div>
              {items.map((item) => {
                const globalIndex = results.indexOf(item)
                return (
                  <button key={`${item.type}-${item.title}`} className={cx(globalIndex === active && 'active')} type="button" onMouseDown={() => openResult(item)}>
                    <span>{item.title}</span>
                    <small>{item.subtitle}</small>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function Header({ theme, setTheme, openMobile }) {
  const navigate = useNavigate()
  const [briefModal, setBriefModal] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const { showToast } = useToast()
  function generateBrief() {
    setBriefModal(false)
    showToast({ title: 'Executive brief generated', message: 'Monthly Executive Brief is ready for review.' })
    navigate('/reports?generated=monthly-executive-brief')
  }
  return (
    <header className="top-header">
      <button className="icon-button mobile-menu" type="button" aria-label="Open navigation" onClick={openMobile}><Menu size={20} /></button>
      <div className="header-title">
        <strong>BANK OF BOTSWANA</strong>
        <span>Strategic Programme Command Centre</span>
      </div>
      <div className="header-tools">
        <div className="date-time">20 May 2025 <span /> 10:24 CAT</div>
        <CommandSearch />
        <div className="menu-wrap">
          <button className="icon-button bell-button" type="button" aria-label="Notifications" onClick={() => setNotificationsOpen(!notificationsOpen)}>
            <Bell size={18} />
            <i />
          </button>
          {notificationsOpen ? (
            <div className="small-menu notification-menu">
              <strong>Notifications</strong>
              <button type="button" onClick={() => navigate('/executive-decisions?status=pending')}>12 decisions pending</button>
              <button type="button" onClick={() => navigate('/risks?severity=critical')}>7 critical risks require attention</button>
              <button type="button" onClick={() => navigate('/milestones')}>11 milestones due this month</button>
            </div>
          ) : null}
        </div>
        <button className="icon-button" type="button" aria-label="Toggle theme" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button className="button primary brief-button" type="button" onClick={() => setBriefModal(true)}>
          <ClipboardList size={16} /> Generate Executive Brief
        </button>
      </div>
      {briefModal ? (
        <Modal
          title="Generate Executive Brief"
          onClose={() => setBriefModal(false)}
          footer={<><button className="button secondary" onClick={() => setBriefModal(false)}>Cancel</button><button className="button primary" onClick={generateBrief}>Generate</button></>}
        >
          <div className="form-grid">
            <SelectField label="Brief Type" value="Monthly Executive Brief" onChange={() => {}} options={['Monthly Executive Brief', 'Quarterly Portfolio Review', 'Risk Committee Pack', 'Delivery Performance Summary']} />
            <SelectField label="Period" value="May 2025 (MTD)" onChange={() => {}} options={['May 2025 (MTD)', 'Q2 2024/25', 'Year to Date']} />
          </div>
        </Modal>
      ) : null}
    </header>
  )
}

function AppLayout() {
  const { theme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} closeMobile={() => setMobileOpen(false)} />
      <div className="app-main">
        <Header theme={theme} setTheme={setTheme} openMobile={() => setMobileOpen(true)} />
        <main className="content-area">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/strategic-portfolio" element={<StrategicPortfolio />} />
            <Route path="/programmes" element={<Programmes />} />
            <Route path="/programmes/:id" element={<ProgrammeDetail />} />
            <Route path="/risks" element={<Risks />} />
            <Route path="/milestones" element={<Milestones />} />
            <Route path="/executive-decisions" element={<ExecutiveDecisions />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/:id" element={<Reports />} />
            <Route path="/audit-trail" element={<AuditTrail />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/:section" element={<SettingsPage />} />
            <Route path="/insights" element={<UtilityPage title="Insights" subtitle="Portfolio, risk and delivery intelligence." />} />
            <Route path="/insights/:section" element={<InsightsPage />} />
            <Route path="/calendar" element={<UtilityPage title="Calendar" subtitle="Strategic committee, milestone, and governance calendar." calendar />} />
            <Route path="/documents" element={<UtilityPage title="Documents" subtitle="Secure programme documentation and board packs." documents />} />
            <Route path="/profile" element={<UtilityPage title="Profile" subtitle="Executive user profile and preferences." />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        <footer className="footer">© 2025 Bank of Botswana. All rights reserved.<span>Terms of Use</span><span>Privacy Policy</span><span>Security</span></footer>
      </div>
    </div>
  )
}

function InsightCard({ title, children, action, to }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{title}</h2>
        {to ? <Link to={to}>{action || 'View full report'} <ChevronRight size={15} /></Link> : null}
      </div>
      {children}
    </section>
  )
}

function Dashboard() {
  const [riskDrawer, setRiskDrawer] = useState(null)
  const attentionRisks = risks.slice(0, 4)
  return (
    <>
      <PageHeader title="Executive Overview" subtitle="Bank-wide strategic delivery, risk, and decision intelligence." />
      <div className="stats-grid">
        <StatCard label="Active Programmes" value="18" trend="up 2 vs last month" Icon={BriefcaseBusiness} to="/strategic-portfolio" />
        <StatCard label="Critical Risks" value="7" trend="up 1 vs last month" Icon={ShieldAlert} to="/risks?severity=critical" tone="red" />
        <StatCard label="Delivery Confidence" value="78%" trend="up 6 pp vs last month" Icon={BarChart3} to="/insights/portfolio" tone="green" />
        <StatCard label="Decisions Pending" value="12" trend="down 3 vs last month" Icon={Gavel} to="/executive-decisions?status=pending" />
      </div>
      <div className="dashboard-grid">
        <div className="main-stack">
          <InsightCard title="Portfolio Health">
            <div className="health-panel">
              <div>
                <div className="label">Overall Portfolio Status</div>
                <div className="segmented-bar">
                  <span style={{ width: '56%', background: green }}>56%</span>
                  <span style={{ width: '28%', background: gold }}>28%</span>
                  <span style={{ width: '16%', background: red }}>16%</span>
                </div>
                <div className="segment-labels"><span>On Track</span><span>At Risk</span><span>Off Track</span></div>
              </div>
              <div className="confidence-block"><span>Delivery Confidence Score</span><strong>78%</strong><small>up 6 percentage points vs last month</small></div>
            </div>
          </InsightCard>
          <div className="two-col">
            <InsightCard title="Monthly Progress (Portfolio)">
              <LineChart data={progressTrend} />
            </InsightCard>
            <InsightCard title="Programme Status Distribution">
              <div className="split-chart">
                <DonutChart centerTitle="18" centerSub="Total" data={[{ name: 'On Track', value: 10, color: green }, { name: 'At Risk', value: 5, color: gold }, { name: 'Off Track', value: 3, color: red }]} />
                <div className="legend-list"><p><i style={{ background: green }} />On Track <strong>10 (56%)</strong></p><p><i style={{ background: gold }} />At Risk <strong>5 (28%)</strong></p><p><i style={{ background: red }} />Off Track <strong>3 (16%)</strong></p></div>
              </div>
            </InsightCard>
          </div>
          <InsightCard title="Risks Requiring Attention" to="/risks" action="View all risks">
            <DataTable
              pageSize={4}
              rows={attentionRisks.map((risk) => ({ ...risk, priority: risk.severity, actionRequired: risk.id === 'RISK-001' ? 'Approve additional integration resources and timeline adjustment' : risk.id === 'RISK-002' ? 'Endorse investment in SOC expansion and threat intel' : risk.id === 'RISK-005' ? 'Approve contract amendments and exit strategy' : 'Approve targeted change communication plan' }))}
              onRowClick={setRiskDrawer}
              columns={[
                { key: 'priority', label: 'Priority', render: (row) => <PriorityBadge priority={row.priority} /> },
                { key: 'programme', label: 'Programme', render: (row) => <Link to={`/programmes/${row.programmeId}`} onClick={(event) => event.stopPropagation()}>{row.programme}</Link> },
                { key: 'risk', label: 'Risk' },
                { key: 'owner', label: 'Owner' },
                { key: 'actionRequired', label: 'Action Required' },
              ]}
            />
          </InsightCard>
        </div>
        <aside className="right-rail">
          <InsightCard title="Strategic Insights" to="/insights/portfolio" action="View full insights report">
            <div className="alignment-list">
              {[
                ['Monetary Stability', 95],
                ['Financial Stability', 90],
                ['Regulatory Innovation', 85],
                ['Operational Resilience', 88],
              ].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}%</strong></div>)}
            </div>
            <div className="key-insight">Delivery confidence has improved by 6 percentage points driven by progress in payments modernisation and supervisory digitalisation initiatives.</div>
          </InsightCard>
        </aside>
      </div>
      <RiskDrawer risk={riskDrawer} onClose={() => setRiskDrawer(null)} />
    </>
  )
}

function StrategicPortfolio() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [filters, setFilters] = useState({ mandate: 'All Mandates', owner: 'All Owners', status: 'All Statuses', period: 'May 2025' })
  const [resourceMode, setResourceMode] = useState('By Spend')
  const pageData = useMemo(() => programmes.filter((p) =>
      (filters.mandate === 'All Mandates' || p.mandate === filters.mandate) &&
      (filters.owner === 'All Owners' || p.owner === filters.owner) &&
      (filters.status === 'All Statuses' || p.status === filters.status)
    ), [filters])
  const reset = () => {
    setFilters({ mandate: 'All Mandates', owner: 'All Owners', status: 'All Statuses', period: 'May 2025' })
    showToast({ title: 'Filters reset', message: 'Strategic portfolio filters cleared.' })
  }
  return (
    <>
      <PageHeader title="Strategic Portfolio" subtitle="Bank-wide view of strategic initiatives driving our mandate and long-term value." />
      <FilterBar onReset={reset}>
        <SelectField label="Mandate" value={filters.mandate} onChange={(mandate) => setFilters({ ...filters, mandate })} options={['All Mandates', ...mandates]} />
        <SelectField label="Owner" value={filters.owner} onChange={(owner) => setFilters({ ...filters, owner })} options={['All Owners', ...new Set(programmes.map((p) => p.owner))]} />
        <SelectField label="Status" value={filters.status} onChange={(status) => setFilters({ ...filters, status })} options={['All Statuses', 'On Track', 'At Risk', 'Off Track', 'Completed']} />
        <SelectField label="Time Period" value={filters.period} onChange={(period) => setFilters({ ...filters, period })} options={['May 2025', 'Q2 2025', '2025 YTD']} />
      </FilterBar>
      <div className="stats-grid"><StatCard label="Total Portfolio Value" value="BWP 1.42B" trend="up 8% vs last month" Icon={Layers3} /><StatCard label="Programmes On Track" value="11" trend="61% of total" Icon={CheckCircle2} tone="green" /><StatCard label="Programmes At Risk" value="5" trend="28% of total" Icon={TriangleAlert} tone="amber" /><StatCard label="Budget Utilisation" value="62%" trend="up 6 pp vs last month" Icon={BarChart3} tone="blue" /></div>
      <div className="dashboard-grid">
        <div className="main-stack">
          <InsightCard title="Portfolio by Strategic Pillar">
            <div className="pillar-grid">
              {[
                ['Monetary Stability', 'BWP 420.5M', '8 Programmes', 59],
                ['Financial Stability', 'BWP 352.3M', '6 Programmes', 64],
                ['Regulatory Innovation', 'BWP 289.6M', '5 Programmes', 57],
                ['Operational Resilience', 'BWP 357.2M', '6 Programmes', 67],
              ].map(([name, amount, count, value]) => <div className="pillar-card" key={name}><strong>{name}</strong><span>{amount}</span><small>{count}</small><ProgressBar value={value} color={name === 'Regulatory Innovation' ? gold : green} /><em>{value}%</em></div>)}
            </div>
          </InsightCard>
          <InsightCard title="Strategic Programmes">
            <DataTable
              rows={pageData}
              onRowClick={(row) => navigate(`/programmes/${row.id}`)}
              columns={[
                { key: 'name', label: 'Programme' },
                { key: 'mandate', label: 'Mandate Alignment' },
                { key: 'sponsor', label: 'Sponsor' },
                { key: 'progress', label: 'Progress', render: (row) => <div className="progress-cell"><span>{row.progress}%</span><ProgressBar value={row.progress} color={row.riskLevel === 'High' ? amber : green} /></div> },
                { key: 'riskLevel', label: 'Risk Level', render: (row) => <PriorityBadge priority={row.riskLevel} /> },
                { key: 'budgetStatus', label: 'Budget Status', render: (row) => <StatusBadge status={row.budgetStatus} /> },
                { key: 'nextMilestone', label: 'Next Milestone', render: (row) => <span>{row.nextMilestone}<small>{row.milestoneDate}</small></span> },
                { key: 'confidence', label: 'Delivery Confidence', render: (row) => <strong>{row.confidence}%</strong> },
              ]}
            />
          </InsightCard>
        </div>
        <aside className="right-rail">
          <InsightCard title="Portfolio Composition">
            <DonutChart centerTitle="16" centerSub="Total Programmes" data={[{ name: 'Monetary Stability', value: 25, color: blue }, { name: 'Financial Stability', value: 22, color: green }, { name: 'Regulatory Innovation', value: 18, color: gold }, { name: 'Operational Resilience', value: 22, color: '#60A5FA' }, { name: 'Cross-Pillar Enablers', value: 13, color: purple }]} />
          </InsightCard>
          <InsightCard title="Resource Allocation">
            <div className="segmented-control"><button className={resourceMode === 'By Spend' ? 'active' : ''} onClick={() => setResourceMode('By Spend')}>By Spend</button><button className={resourceMode === 'By FTE' ? 'active' : ''} onClick={() => setResourceMode('By FTE')}>By FTE</button></div>
            {['Monetary Stability', 'Financial Stability', 'Regulatory Innovation', 'Operational Resilience'].map((name, index) => <div className="allocation-row" key={name}><span>{name}</span><strong>{resourceMode === 'By Spend' ? ['BWP 420.5M', 'BWP 352.3M', 'BWP 289.6M', 'BWP 357.2M'][index] : [42, 36, 29, 38][index] + ' FTE'}</strong><ProgressBar value={[30, 25, 20, 25][index]} color={[blue, green, gold, '#60A5FA'][index]} /></div>)}
          </InsightCard>
          <InsightCard title="Top Watchlist" to="/reports/watchlist" action="View full watchlist report">
            {programmes.filter((p) => p.riskLevel !== 'Low').slice(0, 4).map((p, index) => <button className="watch-row" key={p.id} onClick={() => navigate(`/programmes/${p.id}`)}><strong>{index + 1}</strong><span>{p.name}<small>{p.nextMilestone} behind schedule</small></span><PriorityBadge priority={p.riskLevel} /></button>)}
          </InsightCard>
        </aside>
      </div>
    </>
  )
}

function Programmes() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [query, setQuery] = useState('')
  const [view, setView] = useState('table')
  const [filters, setFilters] = useState({ status: 'All Statuses', risk: 'All Risks', mandate: 'All Mandates', sponsor: 'All Sponsors' })
  const [modal, setModal] = useState(false)
  const filtered = programmes.filter((p) =>
    `${p.name} ${p.description} ${p.owner} ${p.sponsor}`.toLowerCase().includes(query.toLowerCase()) &&
    (filters.status === 'All Statuses' || p.status === filters.status) &&
    (filters.risk === 'All Risks' || p.riskLevel === filters.risk) &&
    (filters.mandate === 'All Mandates' || p.mandate === filters.mandate) &&
    (filters.sponsor === 'All Sponsors' || p.sponsor === filters.sponsor)
  )
  return (
    <>
      <PageHeader title="Programmes" subtitle="Operational view of all strategic programmes, owners, milestones, risks, and delivery confidence.">
        <button className="button secondary" onClick={() => showToast({ title: 'Exported successfully', message: 'Programme portfolio export prepared.' })}><Download size={16} /> Export</button>
        <button className="button primary" onClick={() => setModal(true)}>Create Programme</button>
      </PageHeader>
      <FilterBar onReset={() => setFilters({ status: 'All Statuses', risk: 'All Risks', mandate: 'All Mandates', sponsor: 'All Sponsors' })}>
        <label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search programmes..." /></label>
        <SelectField label="Status" value={filters.status} onChange={(status) => setFilters({ ...filters, status })} options={['All Statuses', 'On Track', 'At Risk', 'Off Track', 'Completed']} />
        <SelectField label="Risk Level" value={filters.risk} onChange={(risk) => setFilters({ ...filters, risk })} options={['All Risks', 'Low', 'Medium', 'High', 'Critical']} />
        <SelectField label="Mandate" value={filters.mandate} onChange={(mandate) => setFilters({ ...filters, mandate })} options={['All Mandates', ...mandates]} />
        <SelectField label="Sponsor" value={filters.sponsor} onChange={(sponsor) => setFilters({ ...filters, sponsor })} options={['All Sponsors', ...new Set(programmes.map((p) => p.sponsor))]} />
        <div className="segmented-control"><button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>Table</button><button className={view === 'cards' ? 'active' : ''} onClick={() => setView('cards')}>Cards</button></div>
      </FilterBar>
      {view === 'cards' ? (
        <div className="programme-grid">
          {filtered.map((p) => <ProgrammeCard key={p.id} programme={p} onClick={() => navigate(`/programmes/${p.id}`)} />)}
        </div>
      ) : (
        <DataTable rows={filtered} onRowClick={(row) => navigate(`/programmes/${row.id}`)} columns={programmeColumns()} />
      )}
      {modal ? <Modal title="Create Programme" onClose={() => setModal(false)} footer={<button className="button primary" onClick={() => { setModal(false); showToast({ title: 'Programme created', message: 'Draft programme has been added locally.' }) }}>Create Draft</button>}><div className="form-grid"><input placeholder="Programme name" /><textarea placeholder="Strategic objective" /></div></Modal> : null}
    </>
  )
}

function programmeColumns() {
  return [
    { key: 'name', label: 'Programme' },
    { key: 'owner', label: 'Owner' },
    { key: 'sponsor', label: 'Sponsor' },
    { key: 'mandate', label: 'Mandate' },
    { key: 'progress', label: 'Progress', render: (row) => <div className="progress-cell"><span>{row.progress}%</span><ProgressBar value={row.progress} color={row.riskLevel === 'High' ? amber : green} /></div> },
    { key: 'confidence', label: 'Confidence', render: (row) => <strong>{row.confidence}%</strong> },
    { key: 'riskLevel', label: 'Risk', render: (row) => <PriorityBadge priority={row.riskLevel} /> },
    { key: 'nextMilestone', label: 'Next Milestone' },
    { key: 'lastUpdated', label: 'Last Updated' },
  ]
}

function ProgrammeCard({ programme, onClick }) {
  return (
    <button className="programme-card" type="button" onClick={onClick}>
      <div><h3>{programme.name}</h3><StatusBadge status={programme.status} /></div>
      <p>{programme.description}</p>
      <div className="programme-meta"><span>{programme.owner}</span><span>{programme.mandate}</span></div>
      <ProgressBar value={programme.progress} color={programme.riskLevel === 'High' ? amber : green} />
      <div className="programme-footer"><PriorityBadge priority={programme.riskLevel} /><strong>{programme.confidence}% confidence</strong></div>
    </button>
  )
}

function ProgrammeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const programme = programmes.find((p) => p.id === id) || programmes.find((p) => p.id === 'payments-modernisation-programme')
  const [doc, setDoc] = useState(null)
  const [drawer, setDrawer] = useState(null)
  return (
    <>
      <PageHeader title={programme.name} subtitle="Programme Portfolio > Payments Modernisation Programme">
        <StatusBadge status={programme.status} />
      </PageHeader>
      <p className="lead-copy">{programme.description}</p>
      <div className="metadata-row"><span>Programme Owner: <strong>{programme.owner}, {programme.ownerRole}</strong></span><span>Executive Sponsor: <strong>{programme.sponsor}, Chief Operations Officer</strong></span></div>
      <div className="programme-detail-grid">
        <div className="main-stack">
          <section className="panel hero-summary">
            <StatCard label="Overall Progress" value="63%" trend="up 5 pp vs last month" Icon={BarChart3} tone="green" />
            <StatCard label="Delivery Confidence" value="78%" trend="up 6 pp vs last month" Icon={BarChart3} tone="green" />
            <div className="summary-mini"><DonutChart height={150} centerTitle="62%" centerSub="Consumed" data={[{ name: 'Consumed', value: 62, color: green }, { name: 'Remaining', value: 38, color: '#E2E8F0' }]} /><strong>P18.7M</strong><span>of P30.0M</span></div>
            <div className="alignment-list compact">{[['Monetary Stability', 95], ['Financial Stability', 90], ['Regulatory Innovation', 85], ['Operational Resilience', 88]].map(([l, v]) => <div key={l}><span>{l}</span><strong>{v}%</strong></div>)}</div>
          </section>
          <div className="two-col">
            <InsightCard title="Milestone Timeline" to="/milestones?programme=payments-modernisation-programme" action="View full timeline">
              <Timeline items={[['Requirements Complete', 'Completed', '15 Jan 2025'], ['Solution Design Approved', 'Completed', '28 Feb 2025'], ['Vendor Selection Gate', 'Upcoming', '30 Jun 2025'], ['System Build Complete', 'Upcoming', '30 Sep 2025'], ['User Acceptance Testing', 'Upcoming', '30 Nov 2025'], ['Go-Live Readiness', 'Upcoming', '31 Jan 2026']]} />
            </InsightCard>
            <InsightCard title="Workstream Breakdown">
              {['Platform & Infrastructure|72|On Track', 'Payments Hub & Integration|65|On Track', 'ISO 20022 Migration|58|At Risk', 'Fraud & Risk Controls|70|On Track', 'Change & Enablement|60|At Risk'].map((item) => {
                const [name, value, status] = item.split('|')
                return <div className="workstream-row" key={name}><span>{name}</span><ProgressBar value={Number(value)} color={status === 'At Risk' ? amber : green} /><strong>{value}%</strong><StatusBadge status={status} /></div>
              })}
            </InsightCard>
          </div>
          <div className="three-col">
            <InsightCard title="Dependency Map"><DependencyMap /></InsightCard>
            <InsightCard title="Risks & Issues" to="/risks?programme=payments-modernisation-programme" action="View all">
              {risks.filter((r) => r.programmeId === 'payments-modernisation-programme').concat(risks.slice(2, 5)).slice(0, 5).map((risk) => <button className="list-row" key={risk.id} onClick={() => setDrawer(risk)}><PriorityBadge priority={risk.severity === 'Critical' ? 'High' : risk.severity} /><span>{risk.risk}</span><small>{risk.impact}</small></button>)}
            </InsightCard>
            <InsightCard title="Recent Decisions" to="/executive-decisions?programme=payments-modernisation-programme" action="View all">
              {['15 May 2025|Approved additional budget of P2.5M for ISO 20022 testing environment', '02 May 2025|Approved revised vendor implementation plan and mitigation approach', '18 Apr 2025|Approved data migration strategy and cleansing approach'].map((d) => {
                const [date, text] = d.split('|')
                return <div className="decision-note" key={date}><strong>{date}</strong><span>{text}</span></div>
              })}
            </InsightCard>
          </div>
          <InsightCard title="Team & Ownership">
            <DataTable pageSize={5} rows={[
              { id: '1', role: 'Programme Owner', name: 'M. Phiri', position: 'Head of Payments', accountability: 'Overall delivery and outcomes' },
              { id: '2', role: 'Executive Sponsor', name: 'K. Maolosi', position: 'Chief Operations Officer', accountability: 'Strategic oversight and escalation' },
              { id: '3', role: 'Business Lead', name: 'T. Kgosiemang', position: 'Chief Information Security Officer', accountability: 'Business requirements and adoption' },
              { id: '4', role: 'Programme Manager', name: 'O. Tlhagale', position: 'Head of Change Management', accountability: 'Day-to-day delivery management' },
              { id: '5', role: 'Workstream Lead - Platform', name: 'K. Segokgo', position: 'IT Infrastructure Manager', accountability: 'Infrastructure and platform delivery' },
            ]} columns={[{ key: 'role', label: 'Role' }, { key: 'name', label: 'Name' }, { key: 'position', label: 'Position' }, { key: 'accountability', label: 'Accountability' }]} />
          </InsightCard>
        </div>
        <aside className="right-rail">
          <InsightCard title="Next Executive Actions">{['Approve ISO 20022 industry testing participation|28 May 2025', 'Review and approve change management budget|30 May 2025', 'Endorse updated risk mitigation plan|05 Jun 2025'].map((a) => { const [text, due] = a.split('|'); return <button className="action-row" onClick={() => navigate('/executive-decisions')} key={text}><Check size={16} /><span>{text}<small>Due: {due}</small></span><ChevronRight size={16} /></button> })}</InsightCard>
          <InsightCard title="Key Documents">{['Programme Business Case v2.1|PDF', 'Implementation Roadmap v3.0|PDF', 'ISO 20022 Migration Plan v1.4|PDF', 'Risk Register May 2025|XLSX', 'Budget Tracker May 2025|XLSX'].map((d) => { const [name, type] = d.split('|'); return <button className="document-row" key={name} onClick={() => setDoc({ name, type })}><FileText size={16} /><span>{name}<small>{type}</small></span><Download size={16} onClick={(event) => { event.stopPropagation(); showToast({ title: 'Document downloaded', message: `${name} downloaded.` }) }} /></button> })}</InsightCard>
          <InsightCard title="Upcoming Meetings" to="/calendar" action="View full calendar">{['Programme Steering Committee|27 May 2025, 09:00 CAT', 'Technical Design Review|03 Jun 2025, 11:00 CAT', 'Change Advisory Board|10 Jun 2025, 14:00 CAT'].map((m) => { const [name, time] = m.split('|'); return <button className="meeting-row" key={name} onClick={() => navigate('/calendar')}><CalendarDays size={16} /><span>{name}<small>{time}</small></span></button> })}</InsightCard>
        </aside>
      </div>
      {doc ? <Modal title={doc.name} onClose={() => setDoc(null)} footer={<button className="button primary" onClick={() => { setDoc(null); showToast({ title: 'Document downloaded', message: `${doc.name} downloaded.` }) }}>Download {doc.type}</button>}><div className="document-preview">Secure document preview for {doc.name}</div></Modal> : null}
      <RiskDrawer risk={drawer} onClose={() => setDrawer(null)} />
    </>
  )
}

function Timeline({ items }) {
  return <div className="timeline">{items.map(([name, status, date], index) => <button type="button" key={name} className={cx(status === 'Completed' && 'done')}><span>{index + 1}</span><strong>{name}</strong><small>{status}</small><em>{date}</em></button>)}</div>
}

function DependencyMap() {
  return <div className="dependency-map"><strong>Payments Modernisation Programme</strong>{['Core Banking System Upgrade', 'Cyber Security Enhancements', 'Data Centre Modernisation', 'ISO 20022 Industry Readiness', 'Regulatory Reporting Transformation'].map((node, index) => <span key={node} className={`node-${index}`}>{node}<small>{index === 2 ? 'At Risk' : 'On Track'}</small></span>)}</div>
}

function Risks() {
  const { showToast } = useToast()
  const [params] = useSearchParams()
  const [filters, setFilters] = useState({ severity: params.get('severity') === 'critical' ? 'Critical' : 'All Severities', owner: 'All owners', programme: 'All programmes', status: 'All statuses' })
  const [drawer, setDrawer] = useState(null)
  const filtered = risks.filter((r) => (filters.severity === 'All Severities' || r.severity === filters.severity) && (filters.owner === 'All owners' || r.owner.includes(filters.owner)) && (filters.programme === 'All programmes' || r.programme === filters.programme) && (filters.status === 'All statuses' || r.escalation === filters.status))
  return (
    <>
      <PageHeader title="Risk Register & Issues Oversight" subtitle="Enterprise risks across strategic programmes." />
      <FilterBar onReset={() => setFilters({ severity: 'All Severities', owner: 'All owners', programme: 'All programmes', status: 'All statuses' })} onExport={() => showToast({ title: 'Exported successfully', message: 'Risk register CSV prepared.' })}>
        <SelectField label="Severity" value={filters.severity} onChange={(severity) => setFilters({ ...filters, severity })} options={['All Severities', 'Critical', 'High', 'Medium', 'Low']} />
        <SelectField label="Owner" value={filters.owner} onChange={(owner) => setFilters({ ...filters, owner })} options={['All owners', 'M. Phiri', 'T. Kgosiemang', 'K. Maolosi', 'O. Tlhagale']} />
        <SelectField label="Programme" value={filters.programme} onChange={(programme) => setFilters({ ...filters, programme })} options={['All programmes', ...new Set(risks.map((r) => r.programme))]} />
        <SelectField label="Status" value={filters.status} onChange={(status) => setFilters({ ...filters, status })} options={['All statuses', 'Escalated', 'Monitoring', 'Recording']} />
      </FilterBar>
      <div className="stats-grid"><StatCard label="Critical Risks" value="7" trend="down 1 vs last month" Icon={ShieldAlert} tone="red" /><StatCard label="Emerging Risks" value="11" trend="up 2 vs last month" Icon={TriangleAlert} /><StatCard label="Mitigated This Month" value="9" trend="up 3 vs last month" Icon={ShieldCheck} tone="green" /><StatCard label="Escalations Pending" value="5" trend="up 1 vs last month" Icon={Gavel} tone="amber" /></div>
      <div className="dashboard-grid">
        <div className="main-stack">
          <div className="two-col">
            <InsightCard title="Risk Heat Map (Likelihood vs Impact)"><RiskHeatMap onCellClick={(impact) => setFilters({ ...filters, severity: impact === 'Very High' ? 'Critical' : 'High' })} /></InsightCard>
            <InsightCard title="Risk Movement Trend"><LineChart data={riskTrend} target={false} lines={[{ key: 'New', color: red }, { key: 'Increased', color: amber }, { key: 'Decreased', color: green }, { key: 'Closed', color: blue }]} /></InsightCard>
          </div>
          <InsightCard title="Risk Register">
            <DataTable rows={filtered} onRowClick={setDrawer} columns={[{ key: 'id', label: 'ID' }, { key: 'risk', label: 'Risk' }, { key: 'programme', label: 'Programme' }, { key: 'owner', label: 'Owner' }, { key: 'likelihood', label: 'Likelihood', render: (r) => <PriorityBadge priority={r.likelihood} /> }, { key: 'impact', label: 'Impact', render: (r) => <PriorityBadge priority={r.impact} /> }, { key: 'response', label: 'Response Strategy' }, { key: 'dueDate', label: 'Due Date' }, { key: 'escalation', label: 'Escalation Status', render: (r) => <StatusBadge status={r.escalation} /> }]} />
          </InsightCard>
        </div>
        <aside className="right-rail"><InsightCard title="Risk Insights" to="/insights/risk" action="View full insights report"><div className="theme-list">{[['Vendor Dependency', 9], ['Cybersecurity', 7], ['Procurement & Contracting', 6], ['Change Adoption', 5]].map(([t, n]) => <div key={t}><strong>{t}</strong><span>{n} risks</span></div>)}</div><div className="key-insight">Vendor dependency and cybersecurity risks remain the most material to delivery outcomes. Strengthen third-party oversight and accelerate security control remediation.</div></InsightCard><InsightCard title="Risk Maturity"><DonutChart height={180} centerTitle="72%" centerSub="Developing" data={[{ name: 'Leading', value: 20, color: green }, { name: 'Developing', value: 52, color: '#7BBF6A' }, { name: 'Defined', value: 20, color: gold }, { name: 'Initial', value: 8, color: red }]} /></InsightCard></aside>
      </div>
      <RiskDrawer risk={drawer} onClose={() => setDrawer(null)} />
    </>
  )
}

function RiskHeatMap({ onCellClick }) {
  const impacts = ['Very High', 'High', 'Medium', 'Low', 'Very Low']
  const likelihoods = ['Very Low', 'Low', 'Medium', 'High', 'Very High']
  const values = [[0, 1, 2, 3, 4], [1, 2, 4, 5, 3], [2, 3, 5, 3, 2], [1, 1, 2, 1, 0], [0, 0, 1, 0, 0]]
  return <div className="heatmap"><div /><div className="heatmap-axis">{likelihoods.map((l) => <span key={l}>{l}</span>)}</div>{impacts.map((impact, row) => <div className="heatmap-row" key={impact}><strong>{impact}</strong>{values[row].map((value, col) => <button key={`${impact}-${col}`} style={{ background: value >= 4 ? red : value >= 2 ? gold : green }} onClick={() => onCellClick(impact)}>{value}</button>)}</div>)}</div>
}

function RiskDrawer({ risk, onClose }) {
  return <Drawer title={risk?.id || ''} onClose={risk ? onClose : null}>{risk ? <div className="drawer-content"><PriorityBadge priority={risk.severity} /><h3>{risk.risk}</h3><p>{risk.programme}</p><dl><dt>Owner</dt><dd>{risk.owner}</dd><dt>Likelihood</dt><dd>{risk.likelihood}</dd><dt>Impact</dt><dd>{risk.impact}</dd><dt>Response</dt><dd>{risk.response}</dd><dt>Due Date</dt><dd>{risk.dueDate}</dd></dl></div> : null}</Drawer>
}

function Milestones() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ programme: 'All Programmes', pillar: 'All Pillars', status: 'All Statuses', horizon: 'Next 12 Months' })
  const [drawer, setDrawer] = useState(null)
  const filtered = milestones.filter((m) => (filters.programme === 'All Programmes' || m.programme === filters.programme) && (filters.pillar === 'All Pillars' || m.pillar === filters.pillar) && (filters.status === 'All Statuses' || m.status === filters.status))
  return (
    <>
      <PageHeader title="Milestones & Delivery Timeline" subtitle="Track strategic milestones, dependencies and delivery across all programmes." />
      <FilterBar onReset={() => setFilters({ programme: 'All Programmes', pillar: 'All Pillars', status: 'All Statuses', horizon: 'Next 12 Months' })}>
        <SelectField label="Programme" value={filters.programme} onChange={(programme) => setFilters({ ...filters, programme })} options={['All Programmes', ...new Set(milestones.map((m) => m.programme))]} />
        <SelectField label="Strategic Pillar" value={filters.pillar} onChange={(pillar) => setFilters({ ...filters, pillar })} options={['All Pillars', ...mandates]} />
        <SelectField label="Status" value={filters.status} onChange={(status) => setFilters({ ...filters, status })} options={['All Statuses', 'On Track', 'At Risk', 'Delayed', 'Completed']} />
        <SelectField label="Time Horizon" value={filters.horizon} onChange={(horizon) => setFilters({ ...filters, horizon })} options={['Next 12 Months', 'Q2 2025', 'Q3 2025']} />
      </FilterBar>
      <div className="stats-grid"><StatCard label="Upcoming Milestones" value="42" trend="up 8 vs last month" Icon={CalendarDays} /><StatCard label="Due This Month" value="11" trend="up 3 vs last month" Icon={CalendarDays} tone="red" /><StatCard label="Delayed Gates" value="5" trend="up 2 vs last month" Icon={TriangleAlert} tone="red" /><StatCard label="Completed This Quarter" value="28" trend="up 10 vs last quarter" Icon={CheckCircle2} tone="green" /></div>
      <div className="dashboard-grid"><div className="main-stack"><InsightCard title="Programme Delivery Timeline"><GanttChart onSelect={setDrawer} /></InsightCard><div className="two-col"><InsightCard title="Upcoming Milestones" to="/milestones" action="View all">{filtered.map((m) => <button className="list-row" key={m.id} onClick={() => setDrawer(m)}><PriorityBadge priority={m.priority} /><span>{m.name}<small>{m.programme}</small></span><strong>{m.date}</strong></button>)}</InsightCard><InsightCard title="Delivery Calendar"><CalendarMini /></InsightCard></div></div><aside className="right-rail"><InsightCard title="Schedule Risk Alerts" to="/risks?type=schedule" action="View all risk alerts">{['Payments Modernisation|Vendor integration complexity may cause 2-3 week delay|High', 'Digital Transformation|UAT resource constraints could impact October milestone|Medium', 'Cyber Security Enhancement|Pen test environment setup behind schedule|High', 'Regulatory Reporting Optimisation|Data mapping validation at risk of slippage|Medium', 'Data Governance Programme|Data stewardship roles not yet fully assigned|Low'].map((row) => { const [p, t, level] = row.split('|'); return <div className="alert-row" key={p}><span>{p}<small>{t}</small></span><PriorityBadge priority={level} /></div> })}</InsightCard><InsightCard title="Key Delivery Dates" to="/calendar" action="View full delivery schedule">{milestones.map((m) => <button className="meeting-row" key={m.id} onClick={() => navigate('/calendar')}><CalendarDays size={16} /><span>{m.date}<small>{m.programme} - {m.name}</small></span></button>)}</InsightCard></aside></div>
      <Drawer title={drawer?.name || ''} onClose={drawer ? () => setDrawer(null) : null}>{drawer ? <div className="drawer-content"><StatusBadge status={drawer.status} /><h3>{drawer.programme}</h3><p>{drawer.date}</p><p>Owner: {drawer.owner}</p></div> : null}</Drawer>
    </>
  )
}

function GanttChart({ onSelect }) {
  const rows = [
    ['Payments Modernisation Programme', 72, green],
    ['Digital Transformation Initiative', 58, blue],
    ['Cyber Security Enhancement', 65, amber],
    ['Regulatory Reporting Optimisation', 48, '#2DD4BF'],
    ['Data Governance Programme', 40, purple],
  ]
  return <div className="gantt"><div className="gantt-months">{['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'].map((m) => <span key={m}>{m}</span>)}</div>{rows.map(([name, progress, color], index) => <button className="gantt-row" type="button" key={name} onClick={() => onSelect({ name: 'Milestone Detail', programme: name, status: index === 0 ? 'At Risk' : 'On Track', date: milestones[index]?.date || '2025' })}><span>{name}<small>{progress}%</small></span><div><i style={{ width: `${progress}%`, background: color }} />{[20, 45, 70, 88].map((left) => <b key={left} style={{ left: `${left}%`, borderColor: color }} />)}</div></button>)}</div>
}

function CalendarMini() {
  return <div className="calendar-mini"><div className="calendar-head"><button className="icon-button"><ChevronLeft size={14} /></button><strong>June 2025</strong><button className="button secondary">Today</button></div><div className="calendar-grid">{['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN', ...Array.from({ length: 35 }, (_, i) => i < 5 ? 26 + i : i - 4)].map((d, i) => <button className={d === 20 ? 'today' : ''} key={`${d}-${i}`}>{d}<span>{i % 5 === 0 ? <i style={{ background: green }} /> : null}{i % 7 === 0 ? <i style={{ background: gold }} /> : null}{i % 11 === 0 ? <i style={{ background: red }} /> : null}</span></button>)}</div></div>
}

function ExecutiveDecisions() {
  const { showToast } = useToast()
  const [rows, setRows] = useState(decisions)
  const [selected, setSelected] = useState(decisions[0])
  const [modal, setModal] = useState(false)
  const [approved, setApproved] = useState([
    { id: 'A1', title: 'Approve SOC Expansion & Threat Intelligence', programme: 'Cyber Security Enhancement', date: '16 May 2025', by: 'Board Committee', impact: 'High' },
    { id: 'A2', title: 'Endorse ISO 20022 Migration Plan', programme: 'Payments Modernisation', date: '14 May 2025', by: 'Board Committee', impact: 'High' },
    { id: 'A3', title: 'Approve Governance Framework Update', programme: 'Operational Resilience', date: '09 May 2025', by: 'Board Committee', impact: 'Medium' },
  ])
  function submitDecision() {
    setRows((current) => current.map((row) => row.id === selected.id ? { ...row, status: 'Approved' } : row))
    setApproved([{ id: selected.id, title: selected.title, programme: selected.programme, date: '20 May 2025', by: 'Emang K. Morake', impact: selected.priority }, ...approved])
    setModal(false)
    showToast({ title: 'Decision submitted', message: `${selected.title} approved locally.` })
  }
  return (
    <>
      <PageHeader title="Executive Decisions & Approvals" subtitle="Strategic approvals, escalations and governance oversight." />
      <div className="stats-grid"><StatCard label="Decisions Pending" value="12" trend="down 3 vs last month" Icon={Gavel} /><StatCard label="Awaiting Review" value="7" trend="down 2 vs last month" Icon={User} /><StatCard label="Approved This Month" value="15" trend="up 4 vs last month" Icon={CheckCircle2} tone="green" /><StatCard label="Escalated Items" value="3" trend="up 1 vs last month" Icon={TriangleAlert} tone="red" /></div>
      <div className="dashboard-grid"><div className="main-stack"><InsightCard title="Decision Requests"><DataTable rows={rows} onRowClick={setSelected} columns={[{ key: 'title', label: 'Decision' }, { key: 'programme', label: 'Programme' }, { key: 'requestedBy', label: 'Requested By' }, { key: 'priority', label: 'Priority', render: (r) => <PriorityBadge priority={r.priority} /> }, { key: 'dueDate', label: 'Due Date', render: (r) => <span>{r.dueDate}<small>{r.due}</small></span> }, { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> }, { key: 'action', label: 'Recommended Action', render: (r) => <button className="button secondary compact" onClick={(e) => { e.stopPropagation(); setSelected(r); setModal(true) }}>{r.action}</button> }]} /></InsightCard><div className="two-col"><InsightCard title="Recently Approved Decisions">{approved.map((a) => <div className="approved-row" key={a.id}><strong>{a.title}</strong><span>{a.programme}</span><small>{a.date} - {a.by}</small><PriorityBadge priority={a.impact} /></div>)}</InsightCard><InsightCard title="Committee Calendar" to="/calendar" action="View calendar">{['22 May|Strategic Projects Committee|09:00 - 11:30 CAT', '29 May|Risk & Compliance Committee|09:00 - 11:30 CAT', '05 Jun|Board Executive Committee|09:00 - 12:00 CAT'].map((c) => { const [date, name, time] = c.split('|'); return <div className="committee-row" key={date}><strong>{date}</strong><span>{name}<small>{time} | Main Boardroom</small></span><StatusBadge status="Pending" /></div> })}</InsightCard></div></div><aside className="right-rail"><DecisionBriefPanel decision={selected} onReview={() => setModal(true)} /></aside></div>
      {modal ? <DecisionModal decision={selected} onClose={() => setModal(false)} onSubmit={submitDecision} /> : null}
    </>
  )
}

function DecisionBriefPanel({ decision, onReview }) {
  return <InsightCard title="Decision Brief"><PriorityBadge priority={decision.priority} /><h3>{decision.title}</h3><p>{decision.context}</p><div className="impact-list">{[['Operational Resilience', 'High'], ['Financial Stability', 'High'], ['Strategic Alignment', '95%'], ['Estimated Investment', decision.investment], ['Time to Value', '9-12 months']].map(([l, v]) => <div key={l}><span>{l}</span><strong>{v}</strong></div>)}</div><fieldset className="radio-stack"><legend>Options</legend>{['Approve as recommended', 'Approve with conditions', 'Defer for more information', 'Escalate for committee decision'].map((o, i) => <label key={o}><input type="radio" name="decision-option" defaultChecked={i === 0} /> {o}</label>)}</fieldset><button className="button primary full" onClick={onReview}>Review & Decide</button></InsightCard>
}

function DecisionModal({ decision, onClose, onSubmit }) {
  return <Modal title="Review & Decide" onClose={onClose} footer={<><button className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" onClick={onSubmit}>Submit Decision</button></>}><h3>{decision.title}</h3><SelectField label="Decision" value="Approve as recommended" onChange={() => {}} options={['Approve as recommended', 'Approve with conditions', 'Defer for more information', 'Escalate for committee decision']} /><textarea placeholder="Add decision comment..." /></Modal>
}

function Reports() {
  const { id } = useParams()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(reports.find((r) => r.id === id) || reports[0])
  const [share, setShare] = useState(false)
  const [generate, setGenerate] = useState(false)
  return (
    <>
      <PageHeader title="Executive Reports & Briefings" subtitle="High-level reporting and board-ready briefings for strategic oversight and decision-making.">
        <button className="button secondary" onClick={() => showToast({ title: 'Exported successfully', message: 'PDF export queued.' })}><Download size={16} /> Export</button><button className="button secondary" onClick={() => setShare(true)}><Share2 size={16} /> Share</button><SelectField label="Period" value="May 2025 (MTD)" onChange={() => {}} options={['May 2025 (MTD)', 'Q2 2024/25']} /><button className="button primary" onClick={() => setGenerate(true)}>Generate Board Brief</button>
      </PageHeader>
      <div className="report-grid">{reports.map((report) => <button className={cx('report-tile', selected.id === report.id && 'active')} key={report.id} onClick={() => { setSelected(report); navigate(`/reports/${report.id}`) }}><FileText size={32} /><strong>{report.title}</strong><span>{report.description}</span><small>{report.period}</small></button>)}</div>
      <div className="dashboard-grid"><div className="main-stack"><ExecutiveBriefPreview selected={selected} /></div><aside className="right-rail"><InsightCard title="Trend Insights" to="/insights/delivery" action="View all insights"><LineChart data={progressTrend.slice(1)} target={false} /></InsightCard><InsightCard title="Downloadable Packs">{['Executive Brief (PDF)|2.4 MB', 'Board Slide Deck (PPTX)|6.8 MB', 'Data Pack (XLSX)|1.1 MB', 'Risk Heatmap (PDF)|1.7 MB', 'Download all packs (ZIP)|12.0 MB'].map((p) => { const [name, size] = p.split('|'); return <button className="document-row" key={name} onClick={() => showToast({ title: 'Document downloaded', message: `${name} downloaded.` })}><FileText size={16} /><span>{name}<small>{size}</small></span><Download size={16} /></button> })}</InsightCard><InsightCard title="Distribution & Audience"><SelectField label="Select audience" value="Board of Directors" onChange={() => {}} options={['Board of Directors', 'Executive Committee', 'Risk Committee']} /><div className="chip-row"><span>Deputy Governors <X size={12} /></span><span>Executive Committee <X size={12} /></span></div><fieldset className="radio-stack"><legend>Delivery method</legend><label><input type="radio" name="delivery" defaultChecked /> Secure Portal</label><label><input type="radio" name="delivery" /> Email</label></fieldset><button className="button primary full" onClick={() => showToast({ title: 'Shared successfully', message: 'Brief distributed securely.' })}>Distribute Brief Securely</button></InsightCard></aside></div>
      <InsightCard title="Recently Generated Reports">{['Monthly Executive Brief - May 2025 (MTD) - Final - Generated by K. Morake - 20 May 2025, 09:15 CAT', 'Risk Committee Pack - May 2025 - Final - Generated by T. Kgosiemang - 19 May 2025, 16:40 CAT', 'Quarterly Portfolio Review - Q1 2024/25 - Final - Generated by M. Phiri - 15 Apr 2025, 11:20 CAT'].map((r) => <div className="recent-report" key={r}>{r}</div>)}</InsightCard>
      {share ? <Modal title="Share Report" onClose={() => setShare(false)} footer={<button className="button primary" onClick={() => { setShare(false); showToast({ title: 'Shared successfully', message: 'Secure report link copied.' }) }}>Share</button>}><input defaultValue={`https://projets-tracker.vercel.app/reports/${selected.id}`} /></Modal> : null}
      {generate ? <Modal title="Generate Board Brief" onClose={() => setGenerate(false)} footer={<button className="button primary" onClick={() => { setGenerate(false); showToast({ title: 'Report generated', message: 'Board brief added to recently generated reports.' }) }}>Generate</button>}><SelectField label="Report Type" value={selected.title} onChange={() => {}} options={reports.map((r) => r.title)} /></Modal> : null}
    </>
  )
}

function ExecutiveBriefPreview({ selected }) {
  return <InsightCard title={`Preview: ${selected.title} - ${selected.period}`}><StatusBadge status={selected.status} /><h3>Executive Summary</h3><p>Strategic delivery continues to show strong momentum with delivery confidence improving to 78%. Financial stability remains robust and regulatory innovation is accelerating. Focus areas remain on risk mitigation in high-exposure domains and benefit realisation tracking.</p><div className="metrics-grid">{[['Delivery Confidence', '78%', 'up 6 pp vs Apr 2025'], ['Active Programmes', '18', 'up 2 vs Apr 2025'], ['At Risk Programmes', '5', 'down 1 vs Apr 2025'], ['Decisions Pending', '12', 'down 3 vs Apr 2025']].map(([l, v, t]) => <div key={l}><span>{l}</span><strong>{v}</strong><small>{t}</small></div>)}</div><div className="two-col narrative"><div><h3>Boardroom Narrative</h3>{['Delivery confidence improved by 6 percentage points, driven by progress in payments modernisation and supervisory digitalisation initiatives.', 'Five programmes remain at risk due to vendor dependencies and capacity constraints.', 'Regulatory innovation initiatives are ahead of plan and delivering measurable impact.', 'Recommend continued focus on data security enhancement and benefit realisation tracking.'].map((item) => <p key={item}>{item}</p>)}</div><div><h3>Recommended Actions</h3>{['Approve additional resources for integration complexity mitigation.', 'Endorse data security enhancement investment in high-risk domains.', 'Approve targeted change communication plan.', 'Note progress and approve report for Board circulation.'].map((item, index) => <p key={item}><strong>{index + 1}</strong> {item}</p>)}</div></div></InsightCard>
}

function AuditTrail() {
  const { showToast } = useToast()
  const [filters, setFilters] = useState({ actor: 'All', action: 'All', module: 'All', date: '13 May 2025 - 20 May 2025', severity: 'All' })
  const [drawer, setDrawer] = useState(null)
  const filtered = auditEvents.filter((a) => (filters.actor === 'All' || a.actor === filters.actor) && (filters.module === 'All' || a.module === filters.module) && (filters.severity === 'All' || a.severity === filters.severity))
  return (
    <>
      <PageHeader title="Audit Trail & Governance" subtitle="System events, user actions, and compliance oversight." />
      <div className="stats-grid"><StatCard label="Logged Events" value="12,842" trend="up 8% vs last 30 days" Icon={FileText} tone="green" /><StatCard label="High-Risk Actions" value="37" trend="up 12% vs last 30 days" Icon={User} tone="red" /><StatCard label="Access Reviews Due" value="14" trend="down 5 due in next 7 days" Icon={User} /><StatCard label="Compliance Exceptions" value="5" trend="up 2 new this week" Icon={TriangleAlert} tone="purple" /></div>
      <div className="dashboard-grid"><div className="main-stack"><FilterBar onReset={() => setFilters({ actor: 'All', action: 'All', module: 'All', date: '13 May 2025 - 20 May 2025', severity: 'All' })} onExport={() => showToast({ title: 'Exported successfully', message: 'Audit CSV prepared.' })}><SelectField label="Actor" value={filters.actor} onChange={(actor) => setFilters({ ...filters, actor })} options={['All', ...new Set(auditEvents.map((a) => a.actor))]} /><SelectField label="Action Type" value={filters.action} onChange={(action) => setFilters({ ...filters, action })} options={['All', 'Approved Programme', 'Updated Risk Rating', 'Downloaded Document']} /><SelectField label="Module" value={filters.module} onChange={(module) => setFilters({ ...filters, module })} options={['All', ...new Set(auditEvents.map((a) => a.module))]} /><SelectField label="Date Range" value={filters.date} onChange={(date) => setFilters({ ...filters, date })} options={['13 May 2025 - 20 May 2025', 'Last 30 days']} /><SelectField label="Severity" value={filters.severity} onChange={(severity) => setFilters({ ...filters, severity })} options={['All', 'High', 'Medium', 'Low']} /></FilterBar><DataTable pageSize={10} rows={filtered} onRowClick={setDrawer} columns={[{ key: 'timestamp', label: 'Timestamp' }, { key: 'actor', label: 'Actor' }, { key: 'action', label: 'Action' }, { key: 'module', label: 'Module' }, { key: 'object', label: 'Object / Reference' }, { key: 'severity', label: 'Severity', render: (a) => <PriorityBadge priority={a.severity} /> }, { key: 'ip', label: 'IP Address' }]} /><InsightCard title="Activity Timeline" to="/audit-trail" action="View full timeline"><ActivityTimeline /></InsightCard></div><aside className="right-rail"><InsightCard title="Governance Insights"><DonutChart height={180} centerTitle="87%" centerSub="Overall Health" data={[{ name: 'Effective', value: 87, color: green }, { name: 'Partial', value: 9, color: gold }, { name: 'Ineffective', value: 4, color: red }]} /><div className="retention-list">{[['Audit Log Retention', '7 years'], ['Document Retention', '10 years'], ['Access Review Cycle', '90 days'], ['Last Archive', '30 Apr 2025']].map(([l, v]) => <div key={l}><span>{l}</span><strong>{v}</strong></div>)}</div><Link className="button secondary full" to="/settings/audit-compliance">View Retention & Archive Settings</Link></InsightCard><InsightCard title="Recent Exceptions" to="/reports/compliance-exceptions" action="View all exceptions report">{[['Unreviewed Access', '5 users'], ['Overdue Risk Review', '2 risks'], ['Policy Deviation', '1 instance'], ['Incomplete Evidence', '3 items']].map(([l, v]) => <div className="exception-row" key={l}><span>{l}</span><strong>{v}</strong></div>)}</InsightCard></aside></div>
      <Drawer title={drawer?.action || ''} onClose={drawer ? () => setDrawer(null) : null}>{drawer ? <div className="drawer-content"><PriorityBadge priority={drawer.severity} /><h3>{drawer.object}</h3><p>{drawer.timestamp}</p><dl><dt>Actor</dt><dd>{drawer.actor}</dd><dt>Module</dt><dd>{drawer.module}</dd><dt>IP Address</dt><dd>{drawer.ip}</dd></dl></div> : null}</Drawer>
    </>
  )
}

function ActivityTimeline() {
  return <div className="activity-line">{auditEvents.slice(0, 5).map((event) => <div key={event.id}><span /><strong>{event.action}</strong><small>{event.object} by {event.actor}</small></div>)}</div>
}

function SettingsPage() {
  const { section } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('system-settings')
  const [modal, setModal] = useState(null)
  const active = section || activeTab
  const tabs = [['system-settings', 'System Settings'], ['access-management', 'Access Management'], ['audit-compliance', 'Audit & Compliance'], ['data-management', 'Data Management'], ['system-health', 'System Health']]
  return (
    <>
      <PageHeader title="Settings & Administration" subtitle="" />
      <div className="tabs">{tabs.map(([key, label]) => <button key={key} className={active === key ? 'active' : ''} onClick={() => { setActiveTab(key); navigate(key === 'system-settings' ? '/settings' : `/settings/${key}`) }}>{label}</button>)}</div>
      <div className="stats-grid"><StatCard label="Active Users" value="142" trend="up 12 vs last month" Icon={User} tone="green" /><StatCard label="Admin Roles" value="28" trend="up 2 vs last month" Icon={ShieldCheck} /><StatCard label="MFA Coverage" value="94%" trend="up 5 pp vs last month" Icon={Lock} tone="purple" /><StatCard label="Integration Health" value="98%" trend="up 3 pp vs last month" Icon={BarChart3} tone="blue" /></div>
      <div className="dashboard-grid"><div className="main-stack"><InsightCard title="Configurable Settings">{['Organisation Profile|Manage institution details, departments, business units and contact information.|Last updated: 12 May 2025 by K. Maolosi', 'Users & Roles|Manage users, roles, role assignments and access reviews.|142 users - 28 roles', 'Notification Rules|Configure alerts, escalations and delivery channels.|18 active rules - 3 channels', 'Security Policies|Password policy, session controls, MFA enforcement and data protection.|Last updated: 05 May 2025', 'Reporting Preferences|Set default views, KPIs, schedules and distribution lists.|7 schedules - 22 recipients', 'Integrations|Manage connected systems, APIs and data synchronisation.|12 integrations - 10 healthy'].map((s) => { const [title, desc, meta] = s.split('|'); return <button className="setting-row" key={title} onClick={() => setModal(title)}><Settings size={22} /><span><strong>{title}</strong><small>{desc}</small><em>{meta}</em></span><ChevronRight size={18} /></button> })}</InsightCard></div><aside className="right-rail"><InsightCard title="Role Templates" to="/settings/access-management" action="View all roles">{[['System Administrator', 4], ['Programme Manager', 18], ['Risk Manager', 12], ['Executive Viewer', 25], ['Auditor', 6]].map(([r, n]) => <div className="role-row" key={r}><span>{r}<small>{n} users</small></span><ExternalLink size={15} /></div>)}</InsightCard><InsightCard title="Permissions Matrix Preview"><PermissionsMatrix /></InsightCard><InsightCard title="Security Posture Insights" to="/settings/system-health" action="View security dashboard"><DonutChart height={180} centerTitle="85%" centerSub="Secure" data={[{ name: 'Strong Controls', value: 24, color: green }, { name: 'Satisfactory', value: 6, color: gold }, { name: 'Requires Attention', value: 2, color: red }]} /><p>Overall security posture is strong. Continue monitoring and address items requiring attention.</p></InsightCard></aside></div>
      {modal ? <Modal title={modal} onClose={() => setModal(null)} footer={<button className="button primary" onClick={() => { setModal(null); showToast({ title: 'Settings saved', message: `${modal} updated locally.` }) }}>Save Changes</button>}><p>Configuration detail panel for {modal}. This prototype stores changes locally for the demo session.</p></Modal> : null}
    </>
  )
}

function PermissionsMatrix() {
  const roles = ['Admin', 'Prog. Manager', 'Risk Manager', 'Exec Viewer', 'Auditor']
  const rows = ['Strategic Portfolio', 'Programmes', 'Risks', 'Executive Decisions', 'Reports', 'Audit Trail']
  return <div className="permissions"><div><span />{roles.map((role) => <strong key={role}>{role}</strong>)}</div>{rows.map((row, i) => <div key={row}><span>{row}</span>{roles.map((role, j) => <em key={role}>{j <= 1 || (i > 3 && j === 4) ? <CheckCircle2 size={15} /> : j === 2 ? <MinusCircleIcon /> : <CircleSlash size={15} />}</em>)}</div>)}</div>
}

function MinusCircleIcon() {
  return <span className="partial-dot">•</span>
}

function InsightsPage() {
  const { section } = useParams()
  return <UtilityPage title={`${section ? section[0].toUpperCase() + section.slice(1) : 'Portfolio'} Insights`} subtitle="Executive analytics, trends, and board-ready observations." insights />
}

function UtilityPage({ title, subtitle, calendar, documents, insights }) {
  const { showToast } = useToast()
  return (
    <>
      <PageHeader title={title} subtitle={subtitle}>
        <button className="button secondary" onClick={() => showToast({ title: 'Copied link', message: `${title} link copied.` })}><ExternalLink size={16} /> Copy Link</button>
      </PageHeader>
      {calendar ? <CalendarMini /> : null}
      {documents ? <InsightCard title="Document Library">{['Programme Business Case v2.1', 'Implementation Roadmap v3.0', 'Risk Register May 2025', 'Board Slide Deck'].map((doc) => <button className="document-row" key={doc} onClick={() => showToast({ title: 'Document downloaded', message: `${doc} downloaded.` })}><FileText size={16} /><span>{doc}<small>Secure file</small></span><Download size={16} /></button>)}</InsightCard> : null}
      {insights ? <div className="two-col"><InsightCard title="Portfolio Intelligence"><LineChart data={progressTrend} /></InsightCard><InsightCard title="Mandate Alignment"><div className="alignment-list">{mandates.slice(0, 4).map((m, i) => <div key={m}><span>{m}</span><strong>{[95, 90, 85, 88][i]}%</strong></div>)}</div></InsightCard></div> : null}
      {!calendar && !documents && !insights ? <InsightCard title="Command Centre Workspace"><p>This route is wired for navigation and demo workflows. Content can be expanded into a full operational view as the prototype matures.</p></InsightCard> : null}
    </>
  )
}

function App() {
  return <AppLayout />
}

export default App
