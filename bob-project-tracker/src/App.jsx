import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle, ArrowLeft, Bell, CalendarDays, CheckCircle2, ChevronRight, ClipboardCheck, ClipboardList, CloudUpload, Eye, FileText, Flag, LayoutDashboard, LogOut, Menu, Plus, Search, Settings, Shield, User, Users,
} from 'lucide-react'
import { useToast } from './state/ToastProvider.jsx'

const STORAGE_KEYS = { currentUser: 'bob_demo_current_user', assignments: 'bob_demo_assignments', officers: 'bob_demo_officers', assignmentUpdates: 'bob_demo_assignment_updates', reviews: 'bob_demo_reviews' }
const STATUS_OPTIONS = ['Assigned', 'In Progress', 'On Site / Examination Ongoing', 'Report Drafting', 'Submitted for Review', 'Under Review', 'Returned for Corrections', 'Resubmitted', 'Approved', 'Completed', 'Overdue', 'Blocked']
const OFFICER_UPDATE_STATUSES = ['In Progress', 'On Site / Examination Ongoing', 'Report Drafting', 'Submitted for Review', 'Blocked']
const ASSIGNMENT_TYPES = ['Onsite Examination', 'Progress Update', 'Examination Report', 'Memo', 'Letter', 'Presentation', 'Risk Register', 'Meeting Package', 'Governance Report', 'Other']
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical']

const seedOfficers = [
  { id: 'officer-001', name: 'Demo Officer', email: 'officer.demo@bankofbotswana.local', position: 'Compliance Officer', department: 'Compliance' },
  { id: 'officer-002', name: 'Emmanuel Molefe', email: 'emmanuel.demo@bankofbotswana.local', position: 'Senior Compliance Officer', department: 'Compliance' },
  { id: 'officer-003', name: 'Mmapula Motshegare', email: 'mmapula.demo@bankofbotswana.local', position: 'Compliance Officer', department: 'Compliance' },
  { id: 'officer-004', name: 'Oageng Moreputla', email: 'oageng.demo@bankofbotswana.local', position: 'Compliance Analyst', department: 'Compliance' },
  { id: 'officer-005', name: 'Keoage Mongale', email: 'keoage.demo@bankofbotswana.local', position: 'Compliance Officer', department: 'Compliance' },
]
const seedAssignments = [
  { id: 'asg-001', title: 'Orange Money AML/CFT Onsite Examination', description: 'Conduct onsite AML/CFT examination and capture findings for management review.', assignedTo: 'officer-001', assignedBy: 'manager-001', status: 'In Progress', priority: 'High', dueDate: '2026-04-30', assignmentType: 'Onsite Examination', relatedEntity: 'Orange Money Botswana', progressNote: 'Field work ongoing. Draft report expected after onsite review.', createdAt: '2026-04-20T08:30:00.000Z', updatedAt: '2026-04-25T10:45:00.000Z' },
  { id: 'asg-002', title: 'BTC Smega Examination Report', description: 'Finalize examination report and submit for management review.', assignedTo: 'officer-002', assignedBy: 'manager-001', status: 'Submitted for Review', priority: 'High', dueDate: '2026-04-27', assignmentType: 'Examination Report', relatedEntity: 'BTC Smega', progressNote: 'Draft report submitted for management review.', createdAt: '2026-04-18T08:30:00.000Z', updatedAt: '2026-04-26T13:15:00.000Z' },
  { id: 'asg-003', title: 'National Risk Assessment Sensitisation Workshop Slides', description: 'Prepare workshop materials and speaking notes.', assignedTo: 'officer-003', assignedBy: 'manager-001', status: 'In Progress', priority: 'Medium', dueDate: '2026-04-27', assignmentType: 'Presentation', relatedEntity: 'National Risk Assessment', progressNote: 'Presentation slides are being prepared.', createdAt: '2026-04-17T10:00:00.000Z', updatedAt: '2026-04-24T11:00:00.000Z' },
  { id: 'asg-004', title: 'Governance Report for First Quarter', description: 'Develop Q1 governance report with key risk and control updates.', assignedTo: 'officer-004', assignedBy: 'manager-001', status: 'In Progress', priority: 'Medium', dueDate: '2026-05-05', assignmentType: 'Governance Report', relatedEntity: 'Internal', progressNote: 'Drafting in progress.', createdAt: '2026-04-21T09:20:00.000Z', updatedAt: '2026-04-29T15:30:00.000Z' },
  { id: 'asg-005', title: 'BCRCD Risk Register First Quarter', description: 'Compile and validate first-quarter risk register updates.', assignedTo: 'officer-005', assignedBy: 'manager-001', status: 'Submitted for Review', priority: 'Medium', dueDate: '2026-04-25', assignmentType: 'Risk Register', relatedEntity: 'BCRCD', progressNote: 'Submitted to manager for review.', createdAt: '2026-04-12T08:00:00.000Z', updatedAt: '2026-04-25T17:00:00.000Z' },
]
const seedUpdates = { 'asg-001': [{ id: 'u-1', createdAt: '2026-04-25T10:45:00.000Z', userName: 'Demo Officer', oldStatus: 'Assigned', newStatus: 'In Progress', note: 'Field work ongoing. Draft report expected after onsite review.' }] }

const nowIso = () => new Date().toISOString()
const safeParse = (value, fallback) => { try { return JSON.parse(value) ?? fallback } catch { return fallback } }
const getCurrentUser = () => safeParse(localStorage.getItem(STORAGE_KEYS.currentUser), null)
const setCurrentUser = (user) => { localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user)); sessionStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user)) }
const logout = () => { localStorage.removeItem(STORAGE_KEYS.currentUser); sessionStorage.removeItem(STORAGE_KEYS.currentUser) }
const getAssignments = () => safeParse(localStorage.getItem(STORAGE_KEYS.assignments), [])
const saveAssignments = (x) => localStorage.setItem(STORAGE_KEYS.assignments, JSON.stringify(x))
const getOfficers = () => safeParse(localStorage.getItem(STORAGE_KEYS.officers), [])
const saveOfficers = (x) => localStorage.setItem(STORAGE_KEYS.officers, JSON.stringify(x))
const getAssignmentUpdates = (id) => safeParse(localStorage.getItem(STORAGE_KEYS.assignmentUpdates), {})[id] || []
const seedDemoData = (force = false) => {
  if (force || !localStorage.getItem(STORAGE_KEYS.officers)) saveOfficers(seedOfficers)
  if (force || !localStorage.getItem(STORAGE_KEYS.assignments)) saveAssignments(seedAssignments)
  if (force || !localStorage.getItem(STORAGE_KEYS.assignmentUpdates)) localStorage.setItem(STORAGE_KEYS.assignmentUpdates, JSON.stringify(seedUpdates))
  if (force || !localStorage.getItem(STORAGE_KEYS.reviews)) localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify([]))
}
const addAssignmentUpdate = (assignmentId, update) => {
  const updates = safeParse(localStorage.getItem(STORAGE_KEYS.assignmentUpdates), {})
  const existing = Array.isArray(updates[assignmentId]) ? updates[assignmentId] : []
  updates[assignmentId] = [{ id: `upd-${Date.now()}`, createdAt: nowIso(), ...update }, ...existing]
  localStorage.setItem(STORAGE_KEYS.assignmentUpdates, JSON.stringify(updates))
}
const addReview = (review) => {
  const reviews = safeParse(localStorage.getItem(STORAGE_KEYS.reviews), [])
  reviews.unshift({ id: `rev-${Date.now()}`, createdAt: nowIso(), ...review })
  localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(reviews))
}
const createAssignment = (data) => {
  const assignments = getAssignments()
  const assignment = { ...data, id: `asg-${Date.now()}`, createdAt: nowIso(), updatedAt: nowIso(), status: data.status || 'Assigned' }
  assignments.unshift(assignment); saveAssignments(assignments); return assignment
}
const updateAssignment = (id, changes) => {
  const assignments = getAssignments().map((a) => (a.id === id ? { ...a, ...changes, updatedAt: nowIso() } : a))
  saveAssignments(assignments); return assignments.find((a) => a.id === id)
}
const getAssignmentsForOfficer = (officerId) => getAssignments().filter((a) => a.assignedTo === officerId)
const formatDate = (x) => new Date(x).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
const initials = (name) => (name || '').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()

function statusTone(status) {
  const map = {
    Assigned: 'purple', 'In Progress': 'amber', 'On Site / Examination Ongoing': 'amber', 'Report Drafting': 'blue',
    'Submitted for Review': 'blue', 'Under Review': 'amber', 'Returned for Corrections': 'red', Resubmitted: 'blue',
    Approved: 'green', Completed: 'green', Overdue: 'red', Blocked: 'red',
  }
  return map[status] || 'slate'
}
function priorityTone(priority) { return ({ Low: 'green', Medium: 'amber', High: 'red', Critical: 'red' }[priority] || 'slate') }

function StatusBadge({ status }) { return <span className={`badge tone-${statusTone(status)}`}>{status}</span> }
function PriorityBadge({ priority }) { return <span className={`badge tone-${priorityTone(priority)}`}>{priority}</span> }
function PageHeader({ title, subtitle, actions }) { return <div className="page-header"><div><h1>{title}</h1><p>{subtitle}</p></div>{actions ? <div className="header-actions">{actions}</div> : null}</div> }
function Card({ title, subtitle, action, children, className = '' }) { return <section className={`card ${className}`}><div className="card-head"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div>{action || null}</div>{children}</section> }
function SearchInput({ value, onChange, placeholder }) { return <label className="search-input"><Search size={16} /><input aria-label={placeholder} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label> }
function UploadDropzone({ label, selected, onSelect }) { return <label className="upload-zone"><CloudUpload size={20} /><div><strong>{label}</strong><p>PDF, DOC, DOCX, XLSX, PPT, PNG, JPG up to 10MB</p>{selected ? <em>Selected: {selected}</em> : null}</div><input type="file" onChange={(e) => onSelect(e.target.files?.[0]?.name || '')} /></label> }

function LogoBlock() {
  return (
    <div className="logo-block">
      <img src="/brand/bank-of-botswana-logo.png" alt="Bank of Botswana logo" />
      <strong>BANK OF BOTSWANA</strong>
      <small>ASSIGNMENT WORKFLOW DEMO</small>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const user = getCurrentUser()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'officer' && location.pathname.startsWith('/manager')) return <Navigate to="/officer/dashboard" replace />
  if (user.role === 'manager' && location.pathname.startsWith('/officer')) return <Navigate to="/manager/dashboard" replace />
  return children
}

function LoginPage({ onSignedIn }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const { showToast } = useToast(); const navigate = useNavigate()
  function loginAs(user) { setCurrentUser(user); onSignedIn(user); showToast({ title: `signed in as ${user.role}`, message: `${user.name} session started.` }); navigate(user.role === 'manager' ? '/manager/dashboard' : '/officer/dashboard') }
  function submit(e) {
    e.preventDefault()
    if (password !== 'demo123') return showToast({ title: 'Sign in failed', message: 'Use demo password: demo123' })
    if (email === 'manager.demo@bankofbotswana.local') return loginAs({ id: 'manager-001', name: 'Demo Manager', email, role: 'manager', position: 'Manager / Supervisor' })
    if (email === 'officer.demo@bankofbotswana.local') return loginAs({ id: 'officer-001', name: 'Demo Officer', email, role: 'officer', position: 'Compliance Officer' })
    showToast({ title: 'Sign in failed', message: 'Use manager.demo@bankofbotswana.local or officer.demo@bankofbotswana.local' })
  }
  return <main className="login-page"><section className="login-shell"><aside className="login-brand"><LogoBlock /></aside><form className="login-form" onSubmit={submit}><h1>Secure Demo Access</h1><p>Sign in to the Assignment Management System.</p><p className="muted">Access is restricted by assigned role. In this demo, use quick access buttons to preview the Manager and Officer workflows.</p><label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label><button className="btn primary" type="submit">Sign in</button><div className="demo-buttons"><h4>Demo access</h4><button type="button" className="btn secondary" onClick={() => loginAs({ id: 'manager-001', name: 'Demo Manager', email: 'manager.demo@bankofbotswana.local', role: 'manager', position: 'Manager / Supervisor' })}>Continue as Manager</button><button type="button" className="btn secondary" onClick={() => loginAs({ id: 'officer-001', name: 'Demo Officer', email: 'officer.demo@bankofbotswana.local', role: 'officer', position: 'Compliance Officer' })}>Continue as Officer</button></div><small>Demo environment - role-based access is simulated for presentation. Production deployment would use database-backed authentication and server-side access control.</small></form></section></main>
}

function AppShell({ user, title, subtitle, items, children, onLogout }) {
  const [open, setOpen] = useState(false); const [collapsed, setCollapsed] = useState(false)
  const [search, setSearch] = useState(''); const { showToast } = useToast(); const navigate = useNavigate(); const location = useLocation()
  function doLogout() { logout(); onLogout(null); showToast({ title: 'logged out', message: 'Demo session cleared.' }); navigate('/login') }
  return <div className="shell"><div className={`overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} /><aside className={`sidebar ${open ? 'show' : ''} ${collapsed ? 'compact' : ''}`}><LogoBlock /><nav>{items.map((item) => { const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/'); return <Link key={item.to} to={item.to} className={active ? 'nav-link active' : 'nav-link'} onClick={() => setOpen(false)}><item.icon size={18} /><span>{item.label}</span></Link> })}</nav><div className="sidebar-user"><div className="avatar">{initials(user.name)}</div><div><strong>{user.name}</strong><small>{user.position}</small></div></div><button className="collapse-btn" onClick={() => setCollapsed((c) => !c)}>{collapsed ? 'Expand' : 'Collapse'}</button></aside><div className="main"><header className="topbar"><button className="icon-btn" aria-label="Open menu" onClick={() => setOpen(true)}><Menu size={18} /></button><div className="title-group"><strong>{title}</strong><small>{subtitle}</small></div><SearchInput value={search} onChange={setSearch} placeholder="Search assignments, officers, reports..." /><button className="icon-btn" aria-label="Notifications"><Bell size={18} /><i>3</i></button><div className="user-chip"><span>{initials(user.name)}</span><div><strong>{user.name}</strong><small>{user.role === 'manager' ? 'Manager' : 'Officer'}</small></div></div><button className="btn ghost" onClick={doLogout}><LogOut size={14} />Logout</button></header><main className="content">{children}</main></div></div>
}

function KpiCard({ icon: Icon, label, value, hint, tone = 'blue' }) { return <article className="kpi"><div className={`kpi-icon ${tone}`}><Icon size={18} /></div><p>{label}</p><strong>{value}</strong><small>{hint}</small></article> }
function DonutMock({ values }) {
  const total = values.reduce((a, b) => a + b.value, 0) || 1
  const s1 = (values[0]?.value || 0) / total * 100
  const s2 = s1 + (values[1]?.value || 0) / total * 100
  const s3 = s2 + (values[2]?.value || 0) / total * 100
  return <div className="donut" style={{ background: `conic-gradient(var(--blue) 0 ${s1}%, var(--amber) ${s1}% ${s2}%, var(--red) ${s2}% ${s3}%, var(--green) ${s3}% 100%)` }}><div><strong>{total}</strong><span>Total</span></div></div>
}

function ManagerDashboard() {
  const assignments = getAssignments(); const officers = getOfficers(); const today = new Date().toISOString().slice(0, 10)
  const inProgress = assignments.filter((a) => ['In Progress', 'On Site / Examination Ongoing', 'Report Drafting'].includes(a.status))
  const submitted = assignments.filter((a) => ['Submitted for Review', 'Resubmitted'].includes(a.status))
  const overdue = assignments.filter((a) => a.dueDate < today && !['Completed', 'Approved'].includes(a.status))
  const completed = assignments.filter((a) => ['Completed', 'Approved'].includes(a.status))
  return <>
    <PageHeader title="Manager Dashboard" subtitle="Monitor assignments, officer workload, review queues, and overdue work." />
    <section className="kpi-grid">{[
      [ClipboardList, 'Total Assignments', assignments.length, '↑ 12% vs last month', 'blue'],
      [Flag, 'In Progress', inProgress.length, '↑ 5% vs last month', 'amber'],
      [SendIcon, 'Submitted for Review', submitted.length, '↓ 3% vs last month', 'blue'],
      [AlertTriangle, 'Overdue', overdue.length, '↑ 2% vs last month', 'red'],
      [CheckCircle2, 'Completed', completed.length, '↑ 18% vs last month', 'green'],
      [Users, 'Active Officers', new Set(assignments.map((a) => a.assignedTo)).size, '↑ 7% vs last month', 'purple'],
    ].map(([icon, label, value, hint, tone]) => <KpiCard key={label} icon={icon} label={label} value={value} hint={hint} tone={tone} />)}</section>
    <div className="layout-2"><div className="stack">
      <Card title="Quick Actions"><div className="action-grid"><Link className="action-tile primary-tile" to="/manager/assignments/new"><Plus size={18} /><div><strong>Create Assignment</strong><span>New assignment</span></div></Link><Link className="action-tile" to="/manager/review-queue"><ClipboardCheck size={18} /><div><strong>View Review Queue</strong><span>Pending reviews</span></div></Link><Link className="action-tile" to="/manager/officers"><Users size={18} /><div><strong>Add Officer</strong><span>Register officer</span></div></Link><Link className="action-tile" to="/manager/reports"><FileText size={18} /><div><strong>Generate Report</strong><span>Export data</span></div></Link></div></Card>
      <Card title="Officer Workload"><div className="table-wrap"><table><thead><tr><th>Officer</th><th>Total</th><th>In Progress</th><th>Submitted</th><th>Overdue</th><th>Completed</th><th /></tr></thead><tbody>{officers.map((o) => { const own = assignments.filter((a) => a.assignedTo === o.id); return <tr key={o.id}><td><div className="person"><span>{initials(o.name)}</span><strong>{o.name}</strong></div></td><td>{own.length}</td><td>{own.filter((a) => ['In Progress', 'On Site / Examination Ongoing', 'Report Drafting'].includes(a.status)).length}</td><td>{own.filter((a) => ['Submitted for Review', 'Resubmitted'].includes(a.status)).length}</td><td className="danger">{own.filter((a) => a.dueDate < today && !['Completed', 'Approved'].includes(a.status)).length}</td><td>{own.filter((a) => ['Completed', 'Approved'].includes(a.status)).length}</td><td><ChevronRight size={16} /></td></tr> })}</tbody></table></div></Card>
      <div className="chart-grid"><Card title="Assignment Status Distribution"><div className="donut-row"><DonutMock values={[{ value: inProgress.length }, { value: submitted.length }, { value: overdue.length }, { value: completed.length }]} /><ul>{[['In Progress', inProgress.length], ['Submitted', submitted.length], ['Overdue', overdue.length], ['Completed', completed.length]].map(([n, v]) => <li key={n}><span>{n}</span><strong>{v}</strong></li>)}</ul></div></Card><Card title="Assignments Over Time"><div className="line-mock">{[20, 24, 22, 30, 38, 48].map((n, i) => <div key={i} style={{ height: `${n}%` }} />)}</div></Card></div>
    </div><aside className="stack">
      <Card title="Recent Assignment Updates" action={<Link to="/manager/assignments">View all</Link>}>{assignments.slice(0, 5).map((a) => <article className="update-item" key={a.id}><div><strong>{a.title}</strong><small>{formatDate(a.updatedAt)}</small><p>{a.progressNote}</p></div><StatusBadge status={a.status} /></article>)}</Card>
      <Card title="Assignments Requiring Attention" action={<Link to="/manager/assignments">View all</Link>}>{assignments.filter((a) => a.priority === 'High' || a.status === 'Returned for Corrections' || a.dueDate < today).slice(0, 5).map((a) => <article className="attention-item" key={a.id}><div><strong>{a.title}</strong><small>{a.relatedEntity}</small></div><StatusBadge status={a.status} /></article>)}</Card>
    </aside></div>
  </>
}

function ManagerAssignments() {
  const [search, setSearch] = useState(''); const [officer, setOfficer] = useState('All'); const [status, setStatus] = useState('All')
  const officers = getOfficers(); const assignments = getAssignments(); const { showToast } = useToast()
  const rows = assignments.filter((a) => { const own = officers.find((o) => o.id === a.assignedTo); const text = `${a.title} ${a.relatedEntity} ${own?.name || ''}`.toLowerCase(); return text.includes(search.toLowerCase()) && (officer === 'All' || a.assignedTo === officer) && (status === 'All' || a.status === status) })
  function setWorkflow(item, next, msg) { updateAssignment(item.id, { status: next }); addAssignmentUpdate(item.id, { userName: 'Demo Manager', oldStatus: item.status, newStatus: next, note: msg }); showToast({ title: 'assignment updated', message: msg }); window.location.reload() }
  return <>
    <PageHeader title="Assignments" subtitle="Track all department assignments and review progress." actions={<Link className="btn primary" to="/manager/assignments/new"><Plus size={14} />Create Assignment</Link>} />
    <div className="filters"><SearchInput value={search} onChange={setSearch} placeholder="Search assignments, officers, entities..." /><label>Officer<select value={officer} onChange={(e) => setOfficer(e.target.value)}><option>All</option>{officers.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label><label>Status<select value={status} onChange={(e) => setStatus(e.target.value)}><option>All</option>{STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}</select></label></div>
    <Card title="Assignment Registry"><div className="table-wrap"><table><thead><tr><th>Assignment</th><th>Officer</th><th>Entity</th><th>Type</th><th>Status</th><th>Priority</th><th>Due Date</th><th>Latest Update</th><th>Action</th></tr></thead><tbody>{rows.map((a) => <tr key={a.id}><td><strong>{a.title}</strong></td><td>{officers.find((o) => o.id === a.assignedTo)?.name || '-'}</td><td>{a.relatedEntity}</td><td>{a.assignmentType}</td><td><StatusBadge status={a.status} /></td><td><PriorityBadge priority={a.priority} /></td><td>{formatDate(a.dueDate)}</td><td>{a.progressNote}</td><td><div className="row-actions"><Link className="btn ghost xs" to={`/officer/assignments/${a.id}`}>View</Link><button className="btn ghost xs" onClick={() => setWorkflow(a, 'Under Review', 'Marked under review.')}>Mark Under Review</button><button className="btn ghost xs" onClick={() => setWorkflow(a, 'Approved', 'Assignment approved.')}>Approve</button></div></td></tr>)}</tbody></table></div></Card>
  </>
}

function ManagerCreateAssignment() {
  const officers = getOfficers(); const navigate = useNavigate(); const { showToast } = useToast()
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', relatedEntity: '', assignmentType: 'Onsite Examination', priority: 'Medium', dueDate: '', notes: '', attachmentName: '' })
  const selectedOfficer = officers.find((o) => o.id === form.assignedTo)
  const officerAssignments = selectedOfficer ? getAssignments().filter((a) => a.assignedTo === selectedOfficer.id) : []
  function submit(e, draft = false) {
    e.preventDefault()
    if (!draft && (!form.title || !form.description || !form.assignedTo || !form.dueDate)) return showToast({ title: 'missing fields', message: 'Complete required fields.' })
    const created = createAssignment({ ...form, assignedBy: 'manager-001', progressNote: draft ? 'Saved as draft.' : 'Assignment created and assigned.', status: 'Assigned' })
    addAssignmentUpdate(created.id, { userName: 'Demo Manager', oldStatus: '-', newStatus: 'Assigned', note: `Assignment created and assigned to ${selectedOfficer?.name || 'officer'}.` })
    showToast({ title: draft ? 'draft saved' : 'assignment created', message: draft ? 'Draft saved.' : 'Assignment assigned successfully.' })
    navigate('/manager/assignments')
  }
  return <>
    <PageHeader title="Create Assignment" subtitle="Assign work to an officer and define deadlines, priority, and instructions." actions={<button className="btn ghost" onClick={() => navigate(-1)}><ArrowLeft size={14} />Back</button>} />
    <div className="layout-2"><form className="stack" onSubmit={(e) => submit(e, false)}>
      <Card title="Assignment Details" subtitle="Provide clear instructions and set expectations for successful completion."><div className="form-grid two"><label>Assignment Title *<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label><label>Select Officer *<select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} required><option value="">Choose officer</option>{officers.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label><label className="full">Description / Instructions *<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label><label>Related Entity / Institution *<input value={form.relatedEntity} onChange={(e) => setForm({ ...form, relatedEntity: e.target.value })} /></label><label>Assignment Type *<select value={form.assignmentType} onChange={(e) => setForm({ ...form, assignmentType: e.target.value })}>{ASSIGNMENT_TYPES.map((x) => <option key={x}>{x}</option>)}</select></label><label>Priority *<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{PRIORITY_OPTIONS.map((x) => <option key={x}>{x}</option>)}</select></label><label>Due Date *<input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required /></label><label className="full">Supporting Notes<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label></div><UploadDropzone label="Attachment Upload (Optional)" selected={form.attachmentName} onSelect={(name) => setForm({ ...form, attachmentName: name })} /></Card>
      <Card title="Complete all required fields (*) to assign work."><div className="header-actions"><button className="btn primary" type="submit">Assign to Officer</button><button className="btn secondary" type="button" onClick={(e) => submit(e, true)}>Save Draft</button><Link className="btn ghost" to="/manager/assignments">Cancel</Link></div></Card>
    </form><aside className="stack">
      <Card title="Assignment Preview" subtitle="Live preview of how this assignment will appear."><dl className="preview"><div><dt>Assignment Title</dt><dd>{form.title || 'Will appear here'}</dd></div><div><dt>Officer</dt><dd>{selectedOfficer?.name || 'Not selected'}</dd></div><div><dt>Due Date</dt><dd>{form.dueDate || 'Not set'}</dd></div><div><dt>Priority</dt><dd><PriorityBadge priority={form.priority} /></dd></div><div><dt>Entity</dt><dd>{form.relatedEntity || 'Not selected'}</dd></div><div><dt>Type</dt><dd>{form.assignmentType}</dd></div><div><dt>Status</dt><dd><StatusBadge status="Assigned" /></dd></div></dl></Card>
      <Card title="Officer Snapshot">{selectedOfficer ? <><div className="person"><span>{initials(selectedOfficer.name)}</span><strong>{selectedOfficer.name}</strong></div><ul className="mini-metrics"><li><span>Current workload</span><strong>{officerAssignments.length}</strong></li><li><span>Active assignments</span><strong>{officerAssignments.filter((a) => ['In Progress', 'On Site / Examination Ongoing', 'Report Drafting'].includes(a.status)).length}</strong></li><li><span>Submitted for review</span><strong>{officerAssignments.filter((a) => ['Submitted for Review', 'Resubmitted'].includes(a.status)).length}</strong></li><li><span>Completed</span><strong>{officerAssignments.filter((a) => ['Completed', 'Approved'].includes(a.status)).length}</strong></li></ul></> : <p className="muted">No officer selected. Choose an officer to view workload details.</p>}</Card>
      <Card title="Assignment Guidance"><ul className="checklist">{['Choose the right officer with relevant expertise', 'Provide clear, detailed instructions and expectations', 'Set a realistic due date with adequate time', 'Select appropriate priority level for urgency', 'Attach relevant documents and reference materials'].map((x) => <li key={x}><CheckCircle2 size={14} /> {x}</li>)}</ul></Card>
    </aside></div>
  </>
}

function OfficerDashboard({ user }) {
  const own = getAssignmentsForOfficer(user.id); const now = new Date()
  const dueSoon = own.filter((a) => { const diff = (new Date(a.dueDate).getTime() - now.getTime()) / 86400000; return diff >= 0 && diff <= 7 })
  return <>
    <PageHeader title="My Dashboard" subtitle="View your assigned work, deadlines, submitted reports, and returned corrections." />
    <section className="kpi-grid">{[
      [ClipboardList, 'My Assignments', own.length, 'All assigned work', 'blue'],
      [Flag, 'In Progress', own.filter((a) => ['In Progress', 'On Site / Examination Ongoing', 'Report Drafting'].includes(a.status)).length, 'Active execution', 'amber'],
      [CalendarDays, 'Due Soon', dueSoon.length, 'Within 7 days', 'red'],
      [SendIcon, 'Submitted for Review', own.filter((a) => ['Submitted for Review', 'Resubmitted'].includes(a.status)).length, 'Awaiting manager', 'blue'],
      [AlertTriangle, 'Returned for Corrections', own.filter((a) => a.status === 'Returned for Corrections').length, 'Needs action', 'red'],
      [CheckCircle2, 'Completed', own.filter((a) => ['Completed', 'Approved'].includes(a.status)).length, 'Finalized', 'green'],
    ].map(([icon, label, value, hint, tone]) => <KpiCard key={label} icon={icon} label={label} value={value} hint={hint} tone={tone} />)}</section>
    <div className="layout-2"><div className="stack"><Card title="My Active Assignments">{own.filter((a) => !['Completed', 'Approved'].includes(a.status)).map((a) => <article className="assignment-card" key={a.id}><div><strong>{a.title}</strong><small>{a.relatedEntity}</small><p>{a.progressNote}</p></div><div className="stack-sm"><StatusBadge status={a.status} /><Link to={`/officer/assignments/${a.id}`} className="btn ghost xs">Open Assignment</Link></div></article>)}</Card></div><aside className="stack"><Card title="Due Soon">{dueSoon.map((a) => <article className="attention-item" key={a.id}><div><strong>{a.title}</strong><small>{formatDate(a.dueDate)}</small></div><StatusBadge status={a.status} /></article>)}</Card><Card title="Returned for Corrections">{own.filter((a) => a.status === 'Returned for Corrections').map((a) => <article key={a.id} className="attention-item"><div><strong>{a.title}</strong></div><Link to={`/officer/assignments/${a.id}`} className="btn ghost xs">Open</Link></article>)}</Card></aside></div>
  </>
}

function OfficerAssignments({ user }) {
  const [search, setSearch] = useState(''); const [status, setStatus] = useState('All')
  const list = getAssignmentsForOfficer(user.id).filter((a) => `${a.title} ${a.relatedEntity}`.toLowerCase().includes(search.toLowerCase()) && (status === 'All' || a.status === status))
  return <>
    <PageHeader title="My Assignments" subtitle="View and update your assigned work." />
    <div className="filters"><SearchInput value={search} onChange={setSearch} placeholder="Search my assignments..." /><label>Status<select value={status} onChange={(e) => setStatus(e.target.value)}><option>All</option>{STATUS_OPTIONS.map((x) => <option key={x}>{x}</option>)}</select></label></div>
    <div className="assignment-grid">{list.map((a) => <article key={a.id} className="assignment-card"><div><strong>{a.title}</strong><small>{a.relatedEntity} · {a.assignmentType}</small><p>{a.progressNote}</p></div><div className="stack-sm"><StatusBadge status={a.status} /><PriorityBadge priority={a.priority} /><Link to={`/officer/assignments/${a.id}`} className="btn secondary xs">Open Assignment</Link></div></article>)}</div>
  </>
}

function OfficerAssignmentDetail({ user }) {
  const { id } = useParams(); const navigate = useNavigate(); const { showToast } = useToast()
  const [assignment, setAssignment] = useState(() => getAssignments().find((a) => a.id === id))
  const [newStatus, setNewStatus] = useState('In Progress'); const [note, setNote] = useState(''); const [fileName, setFileName] = useState('')
  if (!assignment || assignment.assignedTo !== user.id) return <Card title="Assignment not found" />
  const updates = getAssignmentUpdates(assignment.id)
  function submitUpdate(e) {
    e.preventDefault()
    const updated = updateAssignment(id, { status: newStatus, progressNote: note || assignment.progressNote, attachmentName: fileName || assignment.attachmentName })
    addAssignmentUpdate(id, { userName: user.name, oldStatus: assignment.status, newStatus, note: note || 'Status updated.' })
    setAssignment(updated); setNote(''); showToast({ title: 'assignment updated', message: 'Progress update saved.' })
  }
  function submitReview() {
    const updated = updateAssignment(id, { status: 'Submitted for Review', progressNote: note || 'Submitted for manager review.' })
    addAssignmentUpdate(id, { userName: user.name, oldStatus: assignment.status, newStatus: 'Submitted for Review', note: 'Submitted for manager review.' })
    setAssignment(updated); showToast({ title: 'submitted for review', message: 'Awaiting manager review.' }); navigate('/officer/submissions')
  }
  return <>
    <PageHeader title="Officer Workspace" subtitle="My assignment execution" />
    <div className="layout-2"><div className="stack">
      <Card title="Assignment Summary"><h2 className="subheading">{assignment.title}</h2><p>{assignment.description}</p><div className="meta-grid">{[['Assigned by', 'Demo Manager'], ['Assigned date', formatDate(assignment.createdAt)], ['Due date', formatDate(assignment.dueDate)], ['Priority', assignment.priority], ['Entity', assignment.relatedEntity], ['Type', assignment.assignmentType]].map(([k, v]) => <div key={k}><small>{k}</small><strong>{k === 'Priority' ? <PriorityBadge priority={v} /> : v}</strong></div>)}<div><small>Status</small><strong><StatusBadge status={assignment.status} /></strong></div></div></Card>
      <Card title="Progress Timeline"><div className="timeline-v">{updates.map((u) => <div className="timeline-row" key={u.id}><span className={`dot ${statusTone(u.newStatus)}`} /><div><small>{formatDate(u.createdAt)} · {u.userName}</small><strong>{u.oldStatus} to {u.newStatus}</strong><p>{u.note}</p></div><StatusBadge status={u.newStatus} /></div>)}</div></Card>
      <form onSubmit={submitUpdate}><Card title="Update Status"><div className="form-grid two"><label>New Status<select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>{OFFICER_UPDATE_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label><label>Progress Note<textarea value={note} onChange={(e) => setNote(e.target.value)} /></label></div><UploadDropzone label="Attachment Upload (Demo)" selected={fileName} onSelect={setFileName} /><div className="header-actions"><button className="btn primary" type="submit">Submit Update</button><button className="btn secondary" type="button" onClick={submitReview}>Submit for Review</button></div></Card></form>
    </div><aside className="stack"><Card title="Manager Instructions">{['Verify customer due diligence documentation', 'Assess AML/CFT controls and procedures', 'Evaluate transaction monitoring effectiveness', 'Document findings with supporting evidence', 'Submit draft report for management review'].map((x) => <p key={x} className="instruction"><CheckCircle2 size={14} />{x}</p>)}</Card><Card title="Next Recommended Actions">{['Continue fieldwork and data collection', 'Validate findings and supporting evidence', 'Prepare draft report', 'Submit for management review'].map((x) => <button key={x} className="next-row">{x}<ChevronRight size={14} /></button>)}</Card><Card title="Assignment Health"><div className="health"><div className="gauge"><div style={{ width: '78%' }} /></div><strong>78% On Track</strong><ul><li><span>Progress</span><b>78%</b></li><li><span>Time Remaining</span><b>5 days</b></li><li><span>Days Elapsed</span><b>25 days</b></li><li><span>Risk Level</span><b>Moderate</b></li></ul><p className="ok">On track to meet the due date.</p></div></Card></aside></div>
  </>
}

function ManagerReviewQueue() {
  const assignments = getAssignments(); const officers = getOfficers(); const { showToast } = useToast()
  const [tab, setTab] = useState('Submitted for Review'); const [selectedId, setSelectedId] = useState(''); const [feedback, setFeedback] = useState('')
  const selected = assignments.find((a) => a.id === selectedId); const rows = assignments.filter((a) => (tab === 'All' ? true : a.status === tab))
  function act(status) {
    if (!selected) return
    updateAssignment(selected.id, { status, managerFeedback: feedback }); addReview({ assignmentId: selected.id, status, feedback })
    addAssignmentUpdate(selected.id, { userName: 'Demo Manager', oldStatus: selected.status, newStatus: status, note: feedback || (status === 'Approved' ? 'Assignment approved.' : 'Assignment returned for corrections.') })
    showToast({ title: status === 'Approved' ? 'assignment approved' : 'returned for corrections', message: 'Review decision saved.' }); window.location.reload()
  }
  return <>
    <PageHeader title="Review Queue" subtitle="Review submitted assignments, approve work, or return items for correction." />
    <section className="kpi-grid small">{[
      ['Submitted for Review', assignments.filter((a) => a.status === 'Submitted for Review').length],
      ['Under Review', assignments.filter((a) => a.status === 'Under Review').length],
      ['Returned for Corrections', assignments.filter((a) => a.status === 'Returned for Corrections').length],
      ['Approved This Month', assignments.filter((a) => a.status === 'Approved').length],
    ].map(([k, v]) => <KpiCard key={k} icon={ClipboardCheck} label={k} value={v} hint="" tone="blue" />)}</section>
    <div className="tabs">{['Submitted for Review', 'Under Review', 'Returned for Corrections', 'Approved', 'Completed', 'All'].map((x) => <button key={x} className={tab === x ? 'active' : ''} onClick={() => setTab(x)}>{x}</button>)}</div>
    <Card title="Queue"><div className="table-wrap"><table><thead><tr><th>Assignment</th><th>Officer</th><th>Entity</th><th>Submitted Date</th><th>Priority</th><th>Status</th><th>Latest Note</th><th>Action</th></tr></thead><tbody>{rows.map((a) => <tr key={a.id}><td><strong>{a.title}</strong></td><td><div className="person"><span>{initials(officers.find((o) => o.id === a.assignedTo)?.name || 'O')}</span>{officers.find((o) => o.id === a.assignedTo)?.name || '-'}</div></td><td>{a.relatedEntity}</td><td>{formatDate(a.updatedAt)}</td><td><PriorityBadge priority={a.priority} /></td><td><StatusBadge status={a.status} /></td><td>{a.progressNote}</td><td><button className="btn secondary xs" onClick={() => setSelectedId(a.id)}>Open Review</button></td></tr>)}</tbody></table></div></Card>
    {selected ? <div className="modal-backdrop" onMouseDown={() => setSelectedId('')}><div className="modal-card" onMouseDown={(e) => e.stopPropagation()}><div className="modal-head"><h3>Review Assignment</h3><button className="icon-btn" onClick={() => setSelectedId('')}>×</button></div><div className="modal-body"><h4>{selected.title}</h4><p>{selected.description}</p><p><strong>Officer note:</strong> {selected.progressNote}</p><p><strong>Attachment:</strong> {selected.attachmentName || 'No attachment uploaded (demo).'}</p><label>Feedback<textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} /></label></div><div className="modal-foot"><button className="btn ghost" onClick={() => act('Under Review')}>Mark Under Review</button><button className="btn secondary" onClick={() => act('Returned for Corrections')}>Return for Corrections</button><button className="btn primary" onClick={() => act('Approved')}>Approve</button></div></div></div> : null}
  </>
}

function ManagerOfficers() {
  const [officers, setOfficers] = useState(getOfficers()); const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false); const [form, setForm] = useState({ name: '', email: '', position: '', department: 'Compliance', status: 'Active', phone: '' })
  const assignments = getAssignments(); const { showToast } = useToast()
  const filtered = officers.filter((o) => `${o.name} ${o.email} ${o.position}`.toLowerCase().includes(search.toLowerCase()))
  function saveOfficer(e) { e.preventDefault(); const next = { id: `officer-${Date.now()}`, ...form }; saveOfficers([...getOfficers(), next]); setOfficers(getOfficers()); setOpen(false); showToast({ title: 'officer added', message: 'Officer added successfully.' }) }
  return <>
    <PageHeader title="Officers" subtitle="Manage department users, workload, and assignment capacity." actions={<button className="btn primary" onClick={() => setOpen(true)}><Plus size={14} />Add Officer</button>} />
    <section className="kpi-grid small">{[
      ['Total Officers', officers.length], ['Active Officers', officers.length], ['Assignments Assigned', assignments.length], ['Officers With Overdue Work', officers.filter((o) => assignments.some((a) => a.assignedTo === o.id && a.status === 'Overdue')).length],
    ].map(([k, v]) => <KpiCard key={k} icon={Users} label={k} value={v} hint="" tone="purple" />)}</section>
    <div className="filters"><SearchInput value={search} onChange={setSearch} placeholder="Search officers..." /></div>
    <Card title="Officer Directory"><div className="table-wrap"><table><thead><tr><th>Officer</th><th>Position</th><th>Email</th><th>Active</th><th>Submitted</th><th>Overdue</th><th>Completed</th></tr></thead><tbody>{filtered.map((o) => { const own = assignments.filter((a) => a.assignedTo === o.id); return <tr key={o.id}><td><div className="person"><span>{initials(o.name)}</span><strong>{o.name}</strong></div></td><td>{o.position}</td><td>{o.email}</td><td>{own.filter((a) => ['In Progress', 'On Site / Examination Ongoing', 'Report Drafting'].includes(a.status)).length}</td><td>{own.filter((a) => ['Submitted for Review', 'Resubmitted'].includes(a.status)).length}</td><td className="danger">{own.filter((a) => a.status === 'Overdue').length}</td><td>{own.filter((a) => ['Completed', 'Approved'].includes(a.status)).length}</td></tr> })}</tbody></table></div></Card>
    {open ? <div className="modal-backdrop" onMouseDown={() => setOpen(false)}><div className="modal-card wide" onMouseDown={(e) => e.stopPropagation()}><div className="modal-head"><h3>Add Officer</h3><button className="icon-btn" onClick={() => setOpen(false)}>×</button></div><form onSubmit={saveOfficer} className="modal-split"><div className="form-grid two"><label>Full Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Position<input required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></label><label>Department / Unit<input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></label><label>Role<input value="Officer" disabled /></label><label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Active</option><option>Inactive</option></select></label><label className="full">Phone / Contact<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label></div><aside className="help-box"><h4>Permission Summary</h4><p>Officer can view own assignments, update progress, upload report, and submit for review.</p><p className="muted">Production deployment would create secure credentials through the authentication provider.</p></aside><div className="modal-foot full"><button className="btn ghost" type="button" onClick={() => setOpen(false)}>Cancel</button><button className="btn primary" type="submit">Save Officer</button></div></form></div></div> : null}
  </>
}

function ManagerReports() {
  const { showToast } = useToast(); const [selected, setSelected] = useState('Assignment Status Report')
  const reports = ['Assignment Status Report', 'Officer Workload Report', 'Overdue Assignments Report', 'Submitted for Review Report', 'Completed Assignments Report']
  return <>
    <PageHeader title="Reports" subtitle="Generate and export management reports." />
    <div className="report-grid">{reports.map((r) => <Card key={r} title={r} className={selected === r ? 'active-card' : ''} action={<button className="btn ghost xs" onClick={() => setSelected(r)}>Preview</button>}><p className="muted">Institutional summary and metrics for {r.toLowerCase()}.</p><div className="header-actions"><button className="btn primary xs" onClick={() => showToast({ title: 'report generated', message: `${r} generated.` })}>Generate</button><button className="btn secondary xs" onClick={() => showToast({ title: 'export', message: `${r} PDF export simulated.` })}>Export PDF</button><button className="btn secondary xs" onClick={() => showToast({ title: 'export', message: `${r} Excel export simulated.` })}>Export Excel</button></div></Card>)}</div>
    <Card title={`Preview: ${selected}`}><div className="mini-metrics"><li><span>Total Assignments</span><strong>45</strong></li><li><span>In Progress</span><strong>18</strong></li><li><span>Submitted</span><strong>7</strong></li><li><span>Overdue</span><strong>9</strong></li></div><p className="muted">This report summarizes current assignment workflow health and highlights risk areas requiring management action.</p></Card>
  </>
}

function ManagerSettings({ onReset }) {
  const [confirm, setConfirm] = useState(false)
  return <>
    <PageHeader title="Settings" subtitle="Demo mode controls and workflow configuration." />
    <div className="stack">
      {['Demo Mode Settings', 'User Management', 'Status Workflow', 'Assignment Types', 'Security Notice'].map((x) => <Card key={x} title={x}><p className="muted">{x === 'Security Notice' ? 'This demo uses simulated role-based sessions for presentation. Production deployment should use database-backed authentication, role-based authorization, audit logging, and internal server hosting.' : 'Configuration section placeholder for demo presentation.'}</p></Card>)}
      <Card title="Reset Demo Data"><button className="btn secondary" onClick={() => setConfirm(true)}>Reset Demo Data</button></Card>
    </div>
    {confirm ? <div className="modal-backdrop" onMouseDown={() => setConfirm(false)}><div className="modal-card" onMouseDown={(e) => e.stopPropagation()}><div className="modal-head"><h3>Reset demo data?</h3></div><div className="modal-body"><p>This will restore seeded officers, assignments, and updates in localStorage.</p></div><div className="modal-foot"><button className="btn ghost" onClick={() => setConfirm(false)}>Cancel</button><button className="btn primary" onClick={() => { onReset(); setConfirm(false) }}>Reset</button></div></div></div> : null}
  </>
}

function OfficerSubmissions({ user }) { const rows = getAssignmentsForOfficer(user.id).filter((a) => ['Submitted for Review', 'Under Review', 'Resubmitted'].includes(a.status)); return <SimpleAssignments title="Submitted Reports" subtitle="Assignments waiting for manager review." rows={rows} /> }
function OfficerCorrections({ user }) { const rows = getAssignmentsForOfficer(user.id).filter((a) => a.status === 'Returned for Corrections'); return <SimpleAssignments title="Returned Corrections" subtitle="Assignments returned for correction and resubmission." rows={rows} /> }
function SimpleAssignments({ title, subtitle, rows }) { return <><PageHeader title={title} subtitle={subtitle} /><Card title={title}><div className="assignment-grid">{rows.map((a) => <article key={a.id} className="assignment-card"><div><strong>{a.title}</strong><small>{a.relatedEntity}</small><p>{a.progressNote}</p></div><div className="stack-sm"><StatusBadge status={a.status} /><Link className="btn ghost xs" to={`/officer/assignments/${a.id}`}>Open</Link></div></article>)}</div></Card></> }
function PlaceholderPage({ title, subtitle }) { return <Card title={title}><p className="muted">{subtitle}</p></Card> }

const managerNav = [{ to: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard }, { to: '/manager/assignments', label: 'Assignments', icon: ClipboardList }, { to: '/manager/assignments/new', label: 'Create Assignment', icon: Plus }, { to: '/manager/officers', label: 'Officers', icon: Users }, { to: '/manager/review-queue', label: 'Review Queue', icon: ClipboardCheck }, { to: '/manager/reports', label: 'Reports', icon: FileText }, { to: '/manager/settings', label: 'Settings', icon: Settings }]
const officerNav = [{ to: '/officer/dashboard', label: 'My Dashboard', icon: LayoutDashboard }, { to: '/officer/assignments', label: 'My Assignments', icon: ClipboardList }, { to: '/officer/submissions', label: 'Submitted Reports', icon: CheckCircle2 }, { to: '/officer/corrections', label: 'Returned Corrections', icon: AlertTriangle }, { to: '/officer/profile', label: 'Profile', icon: User }]
function ManagerRoutes({ user, setUser, onReset }) { return <AppShell user={user} onLogout={setUser} title="Manager Workspace" subtitle="Department assignment operations" items={managerNav}><Routes><Route path="/dashboard" element={<ManagerDashboard />} /><Route path="/assignments" element={<ManagerAssignments />} /><Route path="/assignments/new" element={<ManagerCreateAssignment />} /><Route path="/officers" element={<ManagerOfficers />} /><Route path="/review-queue" element={<ManagerReviewQueue />} /><Route path="/reports" element={<ManagerReports />} /><Route path="/settings" element={<ManagerSettings onReset={onReset} />} /></Routes></AppShell> }
function OfficerRoutes({ user, setUser }) { return <AppShell user={user} onLogout={setUser} title="Officer Workspace" subtitle="My assignment execution" items={officerNav}><Routes><Route path="/dashboard" element={<OfficerDashboard user={user} />} /><Route path="/assignments" element={<OfficerAssignments user={user} />} /><Route path="/assignments/:id" element={<OfficerAssignmentDetail user={user} />} /><Route path="/submissions" element={<OfficerSubmissions user={user} />} /><Route path="/corrections" element={<OfficerCorrections user={user} />} /><Route path="/profile" element={<PlaceholderPage title="Profile" subtitle="Profile details placeholder for demo." />} /></Routes></AppShell> }

function App() {
  const [user, setUser] = useState(() => getCurrentUser()); const { showToast } = useToast()
  useEffect(() => { seedDemoData(false) }, [])
  function resetDemo() { seedDemoData(true); showToast({ title: 'demo data reset', message: 'Seed data restored successfully.' }); window.location.reload() }
  return <Routes><Route path="/" element={<Navigate to={user ? (user.role === 'manager' ? '/manager/dashboard' : '/officer/dashboard') : '/login'} replace />} /><Route path="/login" element={user ? <Navigate to={user.role === 'manager' ? '/manager/dashboard' : '/officer/dashboard'} replace /> : <LoginPage onSignedIn={setUser} />} /><Route path="/manager/*" element={<ProtectedRoute>{user ? <ManagerRoutes user={user} setUser={setUser} onReset={resetDemo} /> : null}</ProtectedRoute>} /><Route path="/officer/*" element={<ProtectedRoute>{user ? <OfficerRoutes user={user} setUser={setUser} /> : null}</ProtectedRoute>} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>
}

function SendIcon(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg> }

export default App
