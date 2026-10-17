import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  Activity, ArrowDownRight, ArrowLeft, ArrowRight, Bell, BookOpen, CalendarDays, Check,
  ChevronDown, ChevronLeft, ChevronRight, CircleDollarSign, ClipboardCheck, Clock3, GraduationCap,
  ImagePlus, LayoutDashboard, Menu, MoreHorizontal, Pencil, Plus, Search, Settings2, Trash2,
  Users, WalletCards, X,
} from 'lucide-react';
import {
  getGetAttendanceQueryKey, getGetClassesQueryKey, getGetEventsQueryKey, getGetFeesQueryKey,
  getGetHomepageMediaQueryKey, getGetSchoolOverviewQueryKey, getGetStaffQueryKey,
  getGetStudentPerformanceQueryKey, getGetStudentsQueryKey, useAddStudentPerformance,
  useCreateClass, useCreateEvent, useCreateFee, useCreateHomepageMedia, useCreateStudent,
  useDeleteClass, useDeleteEvent, useDeleteFee, useDeleteHomepageMedia, useDeleteStudent,
  useGetAttendance, useGetClasses, useGetEvents, useGetFees, useGetHomepageMedia,
  useGetSchoolOverview, useGetStaff, useGetStudentPerformance, useGetStudents,
  useMarkAttendance, useUpdateClass, useUpdateEvent, useUpdateFee, useUpdateHomepageMedia,
  useUpdateStudent,
} from '@workspace/api-client-react';
import type {
  AttendanceRecord, FeeInvoice, HomepageMedia, SchoolClass, SchoolEvent, Student,
} from '@workspace/api-client-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import NotFound from '@/pages/not-found';

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } });
const today = new Date().toISOString().slice(0, 10);
const academicYear = `${new Date().getFullYear()} — ${new Date().getFullYear() + 1}`;
const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
const dateLabel = (value?: string) => value ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
const dayOf = (value?: string) => value ? new Date(`${value.slice(0, 10)}T12:00:00`).getDate() : '—';
const monthOf = (value?: string) => value ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'short' }) : '';

function Shell({ children }: { children: ReactNode }) {
  const [path] = useLocation();
  const [mobileNav, setMobileNav] = useState(false);
  const nav = [
    { label: 'Overview', href: '/', icon: LayoutDashboard },
    { label: 'Attendance', href: '/attendance', icon: ClipboardCheck },
    { label: 'Students', href: '/students', icon: GraduationCap },
    { label: 'Classes', href: '/classes', icon: BookOpen },
    { label: 'Fee follow-up', href: '/fees', icon: WalletCards },
    { label: 'Events', href: '/events', icon: CalendarDays },
    { label: 'Homepage media', href: '/media', icon: ImagePlus },
  ];
  return <div className="app-shell">
    {mobileNav && <button aria-label="Close navigation" onClick={() => setMobileNav(false)} style={{ position: 'fixed', inset: 0, zIndex: 19, border: 0, background: '#172b2380' }} />}
    <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
      <Link href="/" className="brand" onClick={() => setMobileNav(false)}>
        <span className="brand-mark"><GraduationCap size={21} /></span>
        <span><span className="brand-name">Willow Creek</span><span className="brand-sub">School office</span></span>
      </Link>
      <div className="nav-label">Workspace</div>
      <nav className="nav-list">{nav.map(({ label, href, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobileNav(false)} className={`nav-item ${path === href ? 'active' : ''}`} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon size={17} strokeWidth={1.8} /><span>{label}</span>{path === href && <span style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: '#45604b' }} />}</Link>)}</nav>
      <div className="sidebar-bottom"><div className="school-mini">Willow Creek Academy</div><div className="school-year">Academic year {academicYear}</div></div>
    </aside>
    <main className="main">
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}><button className="icon-button hamburger" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={18} /></button><div className="crumb">Willow Creek Academy <span style={{ padding: '0 8px', color: '#bdc3ba' }}>/</span><strong>{nav.find((item) => item.href === path)?.label || 'Page'}</strong></div></div>
        <div className="top-actions"><button className="icon-button" aria-label="Notifications"><Bell size={17} /></button><div className="profile"><div className="profile-avatar">WC</div><div className="profile-text"><b>School office</b><span>Administrator</span></div><ChevronDown size={14} color="#829087" /></div></div>
      </header>
      {children}
    </main>
  </div>;
}

function Head({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: ReactNode }) {
  return <div className="page-head"><div><div className="eyebrow">{eyebrow}</div><h1 className="page-title">{title}</h1><p className="page-subtitle">{subtitle}</p></div>{action}</div>;
}
function LoadingCards() { return <div className="grid stats-grid">{[0, 1, 2, 3].map((i) => <div className="skeleton" key={i} />)}</div>; }
function LoadError({ onRetry }: { onRetry: () => void }) { return <div className="error-box"><span>We couldn’t load this view. Please try again.</span><button className="btn small secondary" onClick={onRetry}>Retry</button></div>; }
function Empty({ title, detail }: { title: string; detail: string }) { return <div className="empty-state"><div className="empty-mark"><BookOpen size={20} /></div><b>{title}</b><span>{detail}</span></div>; }
function Avatar({ name, src }: { name: string; src?: string | null }) { return <span className="avatar">{src ? <img src={src} alt="" /> : initials(name)}</span>; }
function Modal({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}><div className="modal" role="dialog" aria-modal="true"><div className="modal-head"><div><div className="eyebrow">School office</div><h2 className="modal-title">{title}</h2></div><button className="icon-button" onClick={close} aria-label="Close"><X size={17} /></button></div>{children}</div></div>;
}
function Field({ label, children, full = false }: { label: string; children: ReactNode; full?: boolean }) { return <div className={`form-field ${full ? 'full' : ''}`}><label>{label}</label>{children}</div>; }
function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) { return <div style={{ display: 'flex', gap: 5 }}><button className="icon-button" style={{ width: 30, height: 30 }} onClick={onEdit} aria-label="Edit"><Pencil size={13} /></button><button className="icon-button" style={{ width: 30, height: 30, color: '#a35447' }} onClick={onDelete} aria-label="Delete"><Trash2 size={13} /></button></div>; }

function Carousel() {
  const media = useGetHomepageMedia();
  const items = useMemo(() => (media.data || []).filter((item) => item.isActive).sort((a, b) => a.sortOrder - b.sortOrder), [media.data]);
  const fallback = [
    { id: -1, title: 'A place to learn, grow and belong', caption: 'A look at the bright moments that make every school day meaningful.', mediaType: 'image' as const, url: '/campus-courtyard.jpg', isActive: true, sortOrder: 0 },
    { id: -2, title: 'Celebrating every culture', caption: 'Our school community brings its stories, traditions and talents together.', mediaType: 'image' as const, url: '/cultural-day.jpg', isActive: true, sortOrder: 1 },
    { id: -3, title: 'Curiosity in every classroom', caption: 'Small discoveries become big ideas when students learn together.', mediaType: 'image' as const, url: '/young-makers.jpg', isActive: true, sortOrder: 2 },
  ];
  const slides: HomepageMedia[] = items.length ? items : fallback;
  const [index, setIndex] = useState(0);
  useEffect(() => { setIndex(0); }, [slides.length]);
  useEffect(() => { if (slides.length < 2) return; const timer = window.setInterval(() => setIndex((current) => (current + 1) % slides.length), 6000); return () => window.clearInterval(timer); }, [slides.length]);
  const active = slides[index];
  const shift = (direction: number) => setIndex((current) => (current + direction + slides.length) % slides.length);
  return <section className="card carousel" aria-label="School homepage media">
    {active.mediaType === 'video' ? <video key={active.id} src={active.url} className="slide-image" autoPlay muted loop playsInline /> : <img key={active.id} src={active.url} className="slide-image" alt={active.title} />}
    <div className="slide-shade" /><div className="carousel-content"><div className="carousel-kicker">Life at Willow Creek</div><h2 className="carousel-title">{active.title}</h2><p className="carousel-caption">{active.caption}</p></div>
    <div className="carousel-controls"><div className="carousel-dots">{slides.map((slide, i) => <button key={slide.id} className={`carousel-dot ${i === index ? 'active' : ''}`} aria-label={`Show slide ${i + 1}`} onClick={() => setIndex(i)} />)}</div><button className="carousel-control" aria-label="Previous slide" onClick={() => shift(-1)}><ChevronLeft size={17} /></button><button className="carousel-control" aria-label="Next slide" onClick={() => shift(1)}><ChevronRight size={17} /></button></div>
  </section>;
}

function Dashboard() {
  const overview = useGetSchoolOverview();
  const events = useGetEvents();
  const data = overview.data;
  const attendance = data?.attendance;
  const rate = attendance?.studentTotal ? Math.round(attendance.studentPresent / attendance.studentTotal * 100) : 0;
  const stats = [
    { label: 'Enrolled students', value: data?.studentCount, foot: 'Across all year groups', icon: Users },
    { label: 'Teaching & support', value: data?.staffCount, foot: 'Staff members', icon: GraduationCap },
    { label: 'Active classes', value: data?.classCount, foot: 'Learning groups', icon: BookOpen },
    { label: 'Fees outstanding', value: data ? money(data.fees.pendingAmount) : '—', foot: `${data?.fees.pendingStudents ?? '—'} families to follow up`, icon: CircleDollarSign },
  ];
  return <><Head eyebrow={`${new Intl.DateTimeFormat('en', { weekday: 'long' }).format(new Date())}, school office`} title="Good morning." subtitle="Here’s the rhythm of your school today." action={<Link href="/attendance" className="btn"><ClipboardCheck size={15} /> Take attendance</Link>} />
    {overview.isLoading ? <LoadingCards /> : overview.isError ? <LoadError onRetry={() => void overview.refetch()} /> : <>
      <div className="grid stats-grid">{stats.map(({ label, value, foot, icon: Icon }) => <article className="card stat-card" key={label}><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={16} /></span></div><div className="stat-value">{value ?? '—'}</div><div className="stat-foot">{foot}</div></article>)}</div>
      <div className="grid dashboard-grid"><div className="grid" style={{ gap: 16 }}><Carousel />
        <section className="card"><div className="table-card-head"><div><h2 className="section-title">Fee collection</h2><p className="section-note" style={{ marginBottom: 0 }}>Paid and pending, month by month</p></div><Link href="/fees" className="btn ghost small">View fees <ArrowRight size={13} /></Link></div><FeeChart data={data?.feeTrend || []} /></section>
      </div>
      <div className="right-stack">
        <section className="card attendance-card"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}><div><h2 className="section-title">Today’s attendance</h2><p className="section-note">Students present so far</p></div><Link href="/attendance" className="btn ghost small">Review</Link></div><div className="ring-row"><div className="ring" style={{ '--pct': `${rate}%` } as React.CSSProperties}><strong>{attendance ? `${rate}%` : '—'}</strong></div><div className="ring-copy"><b>{attendance?.studentPresent ?? '—'} of {attendance?.studentTotal ?? '—'}</b><span>students marked present</span><div style={{ marginTop: 8, fontSize: 10, color: '#829087' }}>Staff: {attendance?.staffPresent ?? '—'} / {attendance?.staffTotal ?? '—'} present</div></div></div></section>
        <section className="card attendance-card"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}><div><h2 className="section-title">Coming up</h2><p className="section-note">School calendar highlights</p></div><Link href="/events" className="icon-button" aria-label="View events"><ArrowRight size={15} /></Link></div>
          {events.isLoading ? <div className="skeleton" style={{ height: 110 }} /> : events.isError ? <div style={{ fontSize: 11, color: '#a35447' }}>Events couldn’t be loaded.</div> : events.data?.length ? <div className="event-list">{events.data.slice().sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3).map((event) => <EventMini event={event} key={event.id} />)}</div> : <Empty title="A little room in the calendar" detail="Add an event when something is planned." />}
        </section>
      </div></div></>}
  </>;
}
function FeeChart({ data }: { data: { month: string; paid: number; pending: number }[] }) {
  if (!data.length) return <div className="empty-state" style={{ padding: 24 }}><span>No fee trend has been recorded yet.</span></div>;
  return <div className="chart-box"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><defs><linearGradient id="paidFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5c8969" stopOpacity={.27} /><stop offset="100%" stopColor="#5c8969" stopOpacity={0} /></linearGradient><linearGradient id="pendingFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d69a76" stopOpacity={.18} /><stop offset="100%" stopColor="#d69a76" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#eeece4" vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#89958c', fontSize: 10 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: '#89958c', fontSize: 9 }} tickFormatter={(v) => `₹${v}`} /><Tooltip formatter={(value) => money(Number(value))} contentStyle={{ borderRadius: 10, border: '1px solid #e7e2d8', fontSize: 11 }} /><Area type="monotone" dataKey="paid" name="Paid" stroke="#4c795b" strokeWidth={2} fill="url(#paidFill)" /><Area type="monotone" dataKey="pending" name="Pending" stroke="#cf8c67" strokeWidth={2} fill="url(#pendingFill)" /></AreaChart></ResponsiveContainer></div>;
}
function EventMini({ event }: { event: SchoolEvent }) { return <div className="event-item"><div className="event-date"><b>{dayOf(event.date)}</b><small>{monthOf(event.date)}</small></div><div className="event-info"><b>{event.title}</b><span>{event.time} · {event.location}</span></div></div>; }

function AttendancePage() {
  const client = useQueryClient();
  const [date, setDate] = useState(today);
  const [personType, setPersonType] = useState<'student' | 'staff'>('student');
  const [classId, setClassId] = useState('');
  const classes = useGetClasses();
  const students = useGetStudents(classId ? { classId: Number(classId) } : undefined);
  const staff = useGetStaff();
  const queryParams = { date, personType, ...(personType === 'student' && classId ? { classId: Number(classId) } : {}) };
  const attendance = useGetAttendance(queryParams);
  const mark = useMarkAttendance();
  const records = attendance.data || [];
  const people = personType === 'student' ? (students.data || []).map((s) => ({ id: s.id, name: s.name, detail: s.admissionNumber, classId: s.classId ?? undefined, className: s.className ?? undefined })) : (staff.data || []).map((s) => ({ id: s.id, name: s.name, detail: s.role, classId: undefined as number | undefined, className: undefined as string | undefined }));
  const filteredPeople = personType === 'student' && classId ? people.filter((person) => person.classId === Number(classId)) : people;
  const statusFor = (id: number) => records.find((record) => record.personId === id && record.personType === personType)?.status;
  const changeStatus = (person: typeof filteredPeople[number], status: 'present' | 'absent' | 'late' | 'leave') => {
    mark.mutate({ data: { personId: person.id, personType, classId: person.classId ?? null, date, status } }, { onSuccess: () => { void client.invalidateQueries({ queryKey: getGetAttendanceQueryKey(queryParams) }); void client.invalidateQueries({ queryKey: getGetSchoolOverviewQueryKey() }); } });
  };
  const retry = () => { void attendance.refetch(); void (personType === 'student' ? students.refetch() : staff.refetch()); };
  const present = records.filter((record) => record.status === 'present').length;
  return <><Head eyebrow="Daily routines" title="Attendance" subtitle="A clear view of who’s here, and who needs a check-in." action={<button className="btn" onClick={() => filteredPeople.forEach((person) => { if (!statusFor(person.id)) changeStatus(person, 'present'); })} disabled={mark.isPending}><Check size={15} /> Mark remaining present</button>} />
    <div className="card" style={{ padding: 17, marginBottom: 16 }}><div className="toolbar">
      <input className="field" type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Attendance date" />
      <select className="select" value={personType} onChange={(e) => { setPersonType(e.target.value as 'student' | 'staff'); setClassId(''); }}><option value="student">Students</option><option value="staff">Staff</option></select>
      {personType === 'student' && <select className="select" value={classId} onChange={(e) => setClassId(e.target.value)}><option value="">All classes</option>{(classes.data || []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>}
      <span style={{ marginLeft: 'auto', color: '#78877d', fontSize: 11 }}>{present} marked present · {records.length} records</span>
    </div></div>
    {attendance.isLoading || (personType === 'student' ? students.isLoading : staff.isLoading) ? <div className="skeleton" /> : attendance.isError || (personType === 'student' ? students.isError : staff.isError) ? <LoadError onRetry={retry} /> :
      <section className="card table-card"><div className="table-card-head"><div><h2 className="section-title">{personType === 'student' ? 'Student register' : 'Staff register'}</h2><p className="section-note" style={{ marginBottom: 0 }}>Select a status for each person. Changes save as you go.</p></div><span className="pill active">{filteredPeople.length} people</span></div>
        {filteredPeople.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Name</th><th>{personType === 'student' ? 'Class' : 'Role'}</th><th>Present</th><th>Absent</th><th>Late</th><th>Leave</th></tr></thead><tbody>{filteredPeople.map((person) => <tr key={person.id} data-testid={`row-attendance-${person.id}`}><td><div className="person"><Avatar name={person.name} /><div><b>{person.name}</b><small>{person.detail}</small></div></div></td><td>{person.className || person.detail}</td>{(['present', 'absent', 'late', 'leave'] as const).map((status) => <td key={status}><button onClick={() => changeStatus(person, status)} disabled={mark.isPending} className={`pill ${status}`} style={{ border: statusFor(person.id) === status ? '1px solid currentColor' : '1px solid transparent', opacity: !statusFor(person.id) || statusFor(person.id) === status ? 1 : .45 }}>{statusFor(person.id) === status && <Check size={10} style={{ marginRight: 4 }} />}{status}</button></td>)}</tr>)}</tbody></table></div> : <Empty title="No people in this view" detail="Try another class or check the student and staff records." />}
      </section>}
  </>;
}

function StudentsPage() {
  const client = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Student | null>(null);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const students = useGetStudents(search ? { search } : undefined);
  const create = useCreateStudent(); const update = useUpdateStudent(); const remove = useDeleteStudent();
  const classes = useGetClasses();
  const invalidate = () => { void client.invalidateQueries({ queryKey: getGetStudentsQueryKey() }); void client.invalidateQueries({ queryKey: getGetClassesQueryKey() }); };
  const openEdit = (student: Student) => { setEditing(student); setModal(true); };
  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const input = { name: String(values.name), admissionNumber: String(values.admissionNumber), grade: String(values.grade), section: String(values.section), email: String(values.email), phone: String(values.phone || ''), classId: values.classId ? Number(values.classId) : null };
    if (editing) update.mutate({ studentId: editing.id, data: input }, { onSuccess: () => { invalidate(); setModal(false); } });
    else create.mutate({ data: input }, { onSuccess: () => { invalidate(); setModal(false); } });
  };
  const deleteOne = (student: Student) => { if (window.confirm(`Remove ${student.name} from student records?`)) remove.mutate({ studentId: student.id }, { onSuccess: invalidate }); };
  return <><Head eyebrow="Student life" title="Students" subtitle="Know every learner by name, progress and next step." action={<button className="btn" onClick={() => { setEditing(null); setModal(true); }}><Plus size={15} /> Add student</button>} />
    {selected ? <StudentDetail student={selected} back={() => setSelected(null)} /> : <>
      <div className="card" style={{ padding: 14, marginBottom: 14 }}><div className="toolbar"><div className="search-wrap"><Search size={15} /><input className="field" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or admission number" data-testid="input-student-search" /></div><span style={{ color: '#829087', fontSize: 11 }}>{students.data?.length ?? 0} students</span></div></div>
      {students.isLoading ? <div className="skeleton" /> : students.isError ? <LoadError onRetry={() => void students.refetch()} /> : <div className="card table-card"><div className="table-card-head"><div><h2 className="section-title">Student directory</h2><p className="section-note" style={{ marginBottom: 0 }}>Select a student to explore their learning story.</p></div></div>
        {students.data?.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Student</th><th>Class</th><th>Attendance</th><th>Average score</th><th>Contact</th><th>Manage</th></tr></thead><tbody>{students.data.map((student) => <tr key={student.id}><td><button onClick={() => setSelected(student)} style={{ padding: 0, border: 0, background: 'transparent', textAlign: 'left' }}><div className="person"><Avatar name={student.name} src={student.avatarUrl} /><div><b>{student.name}</b><small>{student.admissionNumber}</small></div></div></button></td><td>{student.className || `${student.grade} · ${student.section}`}</td><td><span className="pill active">{student.attendanceRate}%</span></td><td>{student.averageScore}%</td><td>{student.email}</td><td><RowActions onEdit={() => openEdit(student)} onDelete={() => deleteOne(student)} /></td></tr>)}</tbody></table></div> : <Empty title="No students found" detail={search ? 'Try a different name or admission number.' : 'Add your first student to begin building the directory.'} />}</div>}
    </>}
    {modal && <Modal title={editing ? 'Edit student record' : 'Add a student'} close={() => setModal(false)}><form onSubmit={save}><div className="form-grid">
      <Field label="Full name"><input name="name" required defaultValue={editing?.name} /></Field><Field label="Admission number"><input name="admissionNumber" required defaultValue={editing?.admissionNumber} /></Field>
      <Field label="Grade"><input name="grade" required defaultValue={editing?.grade} /></Field><Field label="Section"><input name="section" required defaultValue={editing?.section} /></Field>
      <Field label="Email"><input name="email" type="email" defaultValue={editing?.email} /></Field><Field label="Phone"><input name="phone" defaultValue={editing?.phone} /></Field>
      <Field label="Class" full><select name="classId" defaultValue={editing?.classId ?? ''}><option value="">Unassigned</option>{(classes.data || []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
    </div><div className="modal-actions"><button type="button" className="btn secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn" disabled={create.isPending || update.isPending}>{editing ? 'Save changes' : 'Add student'}</button></div></form></Modal>}
  </>;
}
function StudentDetail({ student, back }: { student: Student; back: () => void }) {
  const client = useQueryClient();
  const [subject, setSubject] = useState('');
  const performance = useGetStudentPerformance(student.id, { query: { enabled: true, queryKey: getGetStudentPerformanceQueryKey(student.id) } });
  const add = useAddStudentPerformance();
  const records = performance.data || [];
  const subjects = [...new Set(records.map((record) => record.subject))];
  const selectedSubject = subject || subjects[0] || '';
  const points = records.filter((record) => !selectedSubject || record.subject === selectedSubject).map((record) => ({ ...record, percentage: Math.round(record.score / record.maxScore * 100), label: record.assessment }));
  const submitScore = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = event.currentTarget; const values = Object.fromEntries(new FormData(form).entries()); add.mutate({ studentId: student.id, data: { subject: String(values.subject), assessment: String(values.assessment), score: Number(values.score), maxScore: Number(values.maxScore), recordedAt: String(values.recordedAt) } }, { onSuccess: () => { void client.invalidateQueries({ queryKey: getGetStudentPerformanceQueryKey(student.id) }); form.reset(); } }); };
  return <><button className="btn ghost small" onClick={back} style={{ marginBottom: 14 }}><ArrowLeft size={14} /> Back to students</button><div className="student-detail">
    <aside className="card student-profile-card"><div className="student-profile-top"><div className="student-big-avatar">{student.avatarUrl ? <img src={student.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(student.name)}</div><h2>{student.name}</h2><p>{student.admissionNumber} · {student.className || `${student.grade} ${student.section}`}</p></div><div className="student-facts"><div className="student-fact"><span>Attendance</span><b>{student.attendanceRate}%</b></div><div className="student-fact"><span>Average score</span><b>{student.averageScore}%</b></div><div className="student-fact"><span>Email</span><b>{student.email}</b></div><div className="student-fact"><span>Phone</span><b>{student.phone || 'Not provided'}</b></div></div></aside>
    <div className="grid" style={{ gap: 15, alignContent: 'start' }}><section className="card"><div className="table-card-head"><div><h2 className="section-title">Learning progress</h2><p className="section-note" style={{ marginBottom: 0 }}>Assessment scores over time</p></div><select className="select" value={selectedSubject} onChange={(e) => setSubject(e.target.value)}><option value="">All subjects</option>{subjects.map((item) => <option key={item}>{item}</option>)}</select></div>
      {performance.isLoading ? <div className="skeleton" style={{ height: 250 }} /> : performance.isError ? <LoadError onRetry={() => void performance.refetch()} /> : points.length ? <div className="chart-box" style={{ height: 250 }}><ResponsiveContainer width="100%" height="100%"><AreaChart data={points}><defs><linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#577e60" stopOpacity={.28} /><stop offset="100%" stopColor="#577e60" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#eeece4" vertical={false} /><XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#89958c', fontSize: 9 }} /><YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: '#89958c', fontSize: 9 }} /><Tooltip formatter={(v) => `${v}%`} /><Area type="monotone" dataKey="percentage" name="Score" stroke="#4c795b" strokeWidth={2} fill="url(#scoreFill)" /></AreaChart></ResponsiveContainer></div> : <Empty title="No assessments yet" detail="Add a result to start tracking this student's progress." />}
    </section><section className="card" style={{ padding: 18 }}><h2 className="section-title">Record an assessment</h2><p className="section-note">Add a score to the student’s learning history.</p><form onSubmit={submitScore}><div className="form-grid"><Field label="Subject"><input name="subject" required placeholder="e.g. Mathematics" /></Field><Field label="Assessment"><input name="assessment" required placeholder="e.g. Unit 3 quiz" /></Field><Field label="Score"><input name="score" type="number" min="0" required /></Field><Field label="Out of"><input name="maxScore" type="number" min="1" required defaultValue="100" /></Field><Field label="Date" full><input name="recordedAt" type="date" required defaultValue={today} /></Field></div><button className="btn" style={{ marginTop: 15 }} disabled={add.isPending}><Plus size={14} /> Add result</button></form></section></div>
  </div></>;
}

function ClassesPage() {
  const client = useQueryClient();
  const classes = useGetClasses(); const students = useGetStudents(); const staff = useGetStaff();
  const create = useCreateClass(); const update = useUpdateClass(); const remove = useDeleteClass();
  const [modal, setModal] = useState(false); const [editing, setEditing] = useState<SchoolClass | null>(null);
  const invalidate = () => { void client.invalidateQueries({ queryKey: getGetClassesQueryKey() }); void client.invalidateQueries({ queryKey: getGetStudentsQueryKey() }); void client.invalidateQueries({ queryKey: getGetSchoolOverviewQueryKey() }); };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const values = new FormData(event.currentTarget);
    const data = { name: String(values.get('name')), grade: String(values.get('grade')), section: String(values.get('section')), room: String(values.get('room')), teacherId: values.get('teacherId') ? Number(values.get('teacherId')) : null, studentIds: values.getAll('studentIds').map(Number) };
    if (editing) update.mutate({ classId: editing.id, data }, { onSuccess: () => { invalidate(); setModal(false); } });
    else create.mutate({ data }, { onSuccess: () => { invalidate(); setModal(false); } });
  };
  const deleteItem = (item: SchoolClass) => { if (window.confirm(`Delete ${item.name}?`)) remove.mutate({ classId: item.id }, { onSuccess: invalidate }); };
  const open = (item?: SchoolClass) => { setEditing(item || null); setModal(true); };
  return <><Head eyebrow="Teaching spaces" title="Classes" subtitle="Keep rooms, teaching teams and student groups in sync." action={<button className="btn" onClick={() => open()}><Plus size={15} /> Create class</button>} />
    {classes.isLoading ? <div className="grid class-grid">{[1, 2, 3].map((x) => <div key={x} className="skeleton" />)}</div> : classes.isError ? <LoadError onRetry={() => void classes.refetch()} /> : classes.data?.length ? <div className="grid class-grid">{classes.data.map((item, index) => <article className="card class-card" key={item.id}><div className="class-grade">Grade {item.grade} · Section {item.section}</div><h2 className="class-title">{item.name}</h2><div className="class-meta"><span>{item.studentCount} students</span><span>Room {item.room || '—'}</span></div><div className="class-teacher"><span className="avatar" style={{ width: 29, height: 29 }}>{initials(item.teacherName || '—')}</span><span>{item.teacherName || 'Teacher not assigned'}</span><span style={{ marginLeft: 'auto' }}><RowActions onEdit={() => open(item)} onDelete={() => deleteItem(item)} /></span></div><div style={{ marginTop: 12, display: 'flex', gap: 5, flexWrap: 'wrap' }}>{(students.data || []).filter((student) => item.studentIds.includes(student.id)).slice(0, 5).map((student) => <span className="pill active" key={student.id}>{student.name.split(' ')[0]}</span>)}{item.studentCount > 5 && <span className="pill" style={{ background: '#f0ede4', color: '#728078' }}>+{item.studentCount - 5}</span>}</div><span style={{ position: 'absolute', right: 20, top: 19, font: '800 24px Manrope', color: `hsl(${145 + index * 22} 18% 87%)` }}>{String(index + 1).padStart(2, '0')}</span></article>)}</div> : <div className="card"><Empty title="No classes set up yet" detail="Create a class and map its students and teacher." /></div>}
    {modal && <Modal title={editing ? 'Edit class' : 'Create a class'} close={() => setModal(false)}><form onSubmit={submit}><div className="form-grid">
      <Field label="Class name"><input name="name" required defaultValue={editing?.name} placeholder="e.g. Cedar Room" /></Field><Field label="Room"><input name="room" required defaultValue={editing?.room} /></Field>
      <Field label="Grade"><input name="grade" required defaultValue={editing?.grade} /></Field><Field label="Section"><input name="section" required defaultValue={editing?.section} /></Field>
      <Field label="Class teacher" full><select name="teacherId" defaultValue={editing?.teacherId ?? ''}><option value="">Unassigned</option>{(staff.data || []).map((person) => <option value={person.id} key={person.id}>{person.name} — {person.role}</option>)}</select></Field>
      <Field label="Students" full><div style={{ maxHeight: 155, overflow: 'auto', border: '1px solid #e2ded3', borderRadius: 9, padding: '7px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>{(students.data || []).map((student) => <label key={student.id} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#56675d' }}><input type="checkbox" name="studentIds" value={student.id} defaultChecked={editing?.studentIds.includes(student.id)} />{student.name}</label>)}</div></Field>
    </div><div className="modal-actions"><button type="button" className="btn secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn" disabled={create.isPending || update.isPending}>{editing ? 'Save class' : 'Create class'}</button></div></form></Modal>}
  </>;
}

function FeesPage() {
  const client = useQueryClient();
  const [status, setStatus] = useState('');
  const fees = useGetFees(status ? { status: status as 'paid' | 'partial' | 'pending' } : undefined);
  const overview = useGetSchoolOverview(); const students = useGetStudents();
  const create = useCreateFee(); const update = useUpdateFee(); const remove = useDeleteFee();
  const [modal, setModal] = useState(false); const [editing, setEditing] = useState<FeeInvoice | null>(null);
  const invoices = fees.data || [];
  const paid = invoices.reduce((sum, item) => sum + item.paidAmount, 0);
  const balance = invoices.reduce((sum, item) => sum + Math.max(0, item.amount - item.paidAmount), 0);
  const invalidate = () => { void client.invalidateQueries({ queryKey: getGetFeesQueryKey() }); void client.invalidateQueries({ queryKey: getGetSchoolOverviewQueryKey() }); };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const input = { studentId: Number(values.studentId), period: String(values.period), amount: Number(values.amount), paidAmount: Number(values.paidAmount || 0), dueDate: String(values.dueDate) };
    if (editing) update.mutate({ feeId: editing.id, data: { period: input.period, amount: input.amount, paidAmount: input.paidAmount, dueDate: input.dueDate } }, { onSuccess: () => { invalidate(); setModal(false); } });
    else create.mutate({ data: input }, { onSuccess: () => { invalidate(); setModal(false); } });
  };
  const markPaid = (invoice: FeeInvoice) => update.mutate({ feeId: invoice.id, data: { paidAmount: invoice.amount } }, { onSuccess: invalidate });
  const deleteItem = (invoice: FeeInvoice) => { if (window.confirm(`Remove the ${invoice.period} invoice for ${invoice.studentName}?`)) remove.mutate({ feeId: invoice.id }, { onSuccess: invalidate }); };
  const open = (item?: FeeInvoice) => { setEditing(item || null); setModal(true); };
  return <><Head eyebrow="Family accounts" title="Fee follow-up" subtitle="A steady, respectful view of school balances and payments." action={<button className="btn" onClick={() => open()}><Plus size={15} /> Create invoice</button>} />
    <div className="grid stats-grid" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>
      {[{ label: 'Collected in view', value: money(paid), foot: `${invoices.filter((i) => i.status === 'paid').length} invoices settled`, icon: Check }, { label: 'Still outstanding', value: money(balance), foot: `${invoices.filter((i) => i.status !== 'paid').length} invoices to follow up`, icon: ArrowDownRight }, { label: 'School balance', value: money(overview.data?.fees.pendingAmount ?? balance), foot: `${overview.data?.fees.pendingStudents ?? invoices.filter((i) => i.status !== 'paid').length} students with a balance`, icon: WalletCards }].map((item) => <article className="card stat-card" key={item.label}><div className="stat-top">{item.label}<span className="stat-icon"><item.icon size={16} /></span></div><div className="stat-value">{fees.isLoading ? '—' : item.value}</div><div className="stat-foot">{item.foot}</div></article>)}
    </div>
    <div className="grid dashboard-grid" style={{ marginBottom: 16 }}><section className="card"><div className="table-card-head"><div><h2 className="section-title">Collection trend</h2><p className="section-note" style={{ marginBottom: 0 }}>School-wide totals by month</p></div></div><FeeChart data={overview.data?.feeTrend || []} /></section><section className="card attendance-card"><h2 className="section-title">Collection snapshot</h2><p className="section-note">Current filtered invoices</p><div style={{ display: 'grid', gap: 14, marginTop: 22 }}><div><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 7 }}><span style={{ color: '#78877d' }}>Paid</span><b style={{ color: '#3f7459' }}>{money(paid)}</b></div><div style={{ height: 7, borderRadius: 6, background: '#eeeae1' }}><div style={{ height: '100%', width: `${paid + balance ? paid / (paid + balance) * 100 : 0}%`, background: '#5b8766', borderRadius: 6, transition: 'width .4s' }} /></div></div><div><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 7 }}><span style={{ color: '#78877d' }}>Outstanding</span><b style={{ color: '#bd7a5a' }}>{money(balance)}</b></div><div style={{ height: 7, borderRadius: 6, background: '#eeeae1' }}><div style={{ height: '100%', width: `${paid + balance ? balance / (paid + balance) * 100 : 0}%`, background: '#d39570', borderRadius: 6, transition: 'width .4s' }} /></div></div><div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eeeae1', paddingTop: 11, fontSize: 11 }}><span style={{ color: '#78877d' }}>Total invoiced</span><b>{money(paid + balance)}</b></div></div></section></div>
    <div className="card" style={{ padding: 13, marginBottom: 14 }}><div className="toolbar"><div className="search-wrap"><Search size={15} /><input className="field" placeholder="Search invoices" onChange={(e) => { /* local table filter below */ document.querySelectorAll<HTMLTableRowElement>('[data-invoice-row]').forEach((row) => { row.hidden = !row.textContent?.toLowerCase().includes(e.target.value.toLowerCase()); }); }} /></div><select className="select" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All payment statuses</option><option value="paid">Paid</option><option value="partial">Partial</option><option value="pending">Pending</option></select></div></div>
    {fees.isLoading ? <div className="skeleton" /> : fees.isError ? <LoadError onRetry={() => void fees.refetch()} /> : <div className="card table-card"><div className="table-card-head"><div><h2 className="section-title">Invoices</h2><p className="section-note" style={{ marginBottom: 0 }}>Payment status and family follow-up</p></div><span style={{ fontSize: 11, color: '#87938a' }}>{invoices.length} invoices</span></div>
      {invoices.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Student</th><th>Period</th><th>Invoice</th><th>Paid</th><th>Progress</th><th>Due date</th><th>Status</th><th>Actions</th></tr></thead><tbody>{invoices.map((item) => { const progress = item.amount ? Math.min(100, Math.round(item.paidAmount / item.amount * 100)) : 0; return <tr data-invoice-row key={item.id}><td><div className="person"><Avatar name={item.studentName} /><div><b>{item.studentName}</b><small>{item.admissionNumber}</small></div></div></td><td>{item.period}</td><td>{money(item.amount)}</td><td>{money(item.paidAmount)}</td><td><div style={{ minWidth: 82 }}><div style={{ height: 6, borderRadius: 5, background: '#eeeae1' }}><div style={{ height: '100%', width: `${progress}%`, borderRadius: 5, background: progress === 100 ? '#5b8766' : '#d39570' }} /></div><small style={{ display: 'block', marginTop: 4, color: '#829087' }}>{progress}% paid</small></div></td><td>{dateLabel(item.dueDate)}</td><td><span className={`pill ${item.status}`}>{item.status}</span></td><td><div style={{ display: 'flex', gap: 5 }}>{item.status !== 'paid' && <button className="btn small secondary" onClick={() => markPaid(item)}>Mark paid</button>}<RowActions onEdit={() => open(item)} onDelete={() => deleteItem(item)} /></div></td></tr>; })}</tbody></table></div> : <Empty title="No invoices here" detail="Create an invoice to start tracking a fee period." />}</div>}
    {modal && <Modal title={editing ? 'Edit invoice' : 'Create invoice'} close={() => setModal(false)}><form onSubmit={submit}><div className="form-grid">
      <Field label="Student" full><select name="studentId" required defaultValue={editing?.studentId ?? ''} disabled={!!editing}><option value="">Choose a student</option>{(students.data || []).map((student) => <option key={student.id} value={student.id}>{student.name} · {student.admissionNumber}</option>)}</select></Field>
      <Field label="Period"><input name="period" required defaultValue={editing?.period} placeholder="e.g. Term 2" /></Field><Field label="Amount"><input name="amount" type="number" min="1" step="0.01" required defaultValue={editing?.amount} /></Field>
      <Field label="Paid so far"><input name="paidAmount" type="number" min="0" step="0.01" defaultValue={editing?.paidAmount ?? 0} /></Field><Field label="Due date"><input name="dueDate" type="date" required defaultValue={editing?.dueDate?.slice(0, 10)} /></Field>
    </div><div className="modal-actions"><button type="button" className="btn secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn" disabled={create.isPending || update.isPending}>{editing ? 'Save invoice' : 'Create invoice'}</button></div></form></Modal>}
  </>;
}

function EventsPage() {
  const client = useQueryClient();
  const events = useGetEvents(); const create = useCreateEvent(); const update = useUpdateEvent(); const remove = useDeleteEvent();
  const [modal, setModal] = useState(false); const [editing, setEditing] = useState<SchoolEvent | null>(null);
  const sorted = (events.data || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const invalidate = () => { void client.invalidateQueries({ queryKey: getGetEventsQueryKey() }); };
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries()); const input = { title: String(values.title), category: String(values.category), date: String(values.date), time: String(values.time), location: String(values.location), description: String(values.description), color: String(values.color) }; if (editing) update.mutate({ eventId: editing.id, data: input }, { onSuccess: () => { invalidate(); setModal(false); } }); else create.mutate({ data: input }, { onSuccess: () => { invalidate(); setModal(false); } }); };
  const removeOne = (item: SchoolEvent) => { if (window.confirm(`Remove “${item.title}” from the calendar?`)) remove.mutate({ eventId: item.id }, { onSuccess: invalidate }); };
  const open = (item?: SchoolEvent) => { setEditing(item || null); setModal(true); };
  return <><Head eyebrow="School community" title="Events" subtitle="Make space for the gatherings, milestones and traditions that matter." action={<button className="btn" onClick={() => open()}><Plus size={15} /> Add event</button>} />
    {events.isLoading ? <div className="grid class-grid">{[1, 2, 3].map((i) => <div key={i} className="skeleton" />)}</div> : events.isError ? <LoadError onRetry={() => void events.refetch()} /> : sorted.length ? <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 14 }}>{sorted.map((event, index) => <article className="card" key={event.id} style={{ padding: 20, overflow: 'hidden', position: 'relative' }}><div style={{ position: 'absolute', right: -18, top: -19, width: 100, height: 100, borderRadius: '50%', background: event.color || ['#e8eedf', '#f4e6d9', '#e6ebef'][index % 3], opacity: .7 }} /><div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}><div className="event-date" style={{ width: 52, height: 58, borderRadius: 13 }}><b>{dayOf(event.date)}</b><small>{monthOf(event.date)}</small></div><RowActions onEdit={() => open(event)} onDelete={() => removeOne(event)} /></div><div style={{ position: 'relative', marginTop: 19 }}><span className="eyebrow" style={{ marginBottom: 6, display: 'block' }}>{event.category}</span><h2 className="section-title" style={{ fontSize: 16 }}>{event.title}</h2><p style={{ fontSize: 11, lineHeight: 1.55, color: '#829087', margin: '8px 0 16px' }}>{event.description}</p><div style={{ display: 'flex', gap: 16, fontSize: 10, color: '#738278' }}><span><Clock3 size={12} style={{ verticalAlign: 'middle', marginRight: 5 }} />{event.time}</span><span><CalendarDays size={12} style={{ verticalAlign: 'middle', marginRight: 5 }} />{event.location}</span></div></div></article>)}</div> : <div className="card"><Empty title="The calendar is open" detail="Add a school event or cultural activity to share it with your community." /></div>}
    {modal && <Modal title={editing ? 'Edit event' : 'Add an event'} close={() => setModal(false)}><form onSubmit={submit}><div className="form-grid">
      <Field label="Event title" full><input name="title" required defaultValue={editing?.title} /></Field>
      <Field label="Category"><input name="category" required defaultValue={editing?.category} placeholder="Community, arts, sport…" /></Field><Field label="Date"><input name="date" type="date" required defaultValue={editing?.date?.slice(0, 10)} /></Field>
      <Field label="Time"><input name="time" required defaultValue={editing?.time} placeholder="9:30 AM" /></Field><Field label="Location"><input name="location" required defaultValue={editing?.location} /></Field>
      <Field label="Description" full><textarea name="description" defaultValue={editing?.description} /></Field><Field label="Accent color" full><input name="color" type="color" defaultValue={editing?.color || '#dce8da'} style={{ height: 40, padding: 4 }} /></Field>
    </div><div className="modal-actions"><button type="button" className="btn secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn" disabled={create.isPending || update.isPending}>{editing ? 'Save event' : 'Add event'}</button></div></form></Modal>}
  </>;
}

function MediaPage() {
  const client = useQueryClient();
  const query = useGetHomepageMedia(); const create = useCreateHomepageMedia(); const update = useUpdateHomepageMedia(); const remove = useDeleteHomepageMedia();
  const [modal, setModal] = useState(false); const [editing, setEditing] = useState<HomepageMedia | null>(null);
  const items = (query.data || []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
  const invalidate = () => { void client.invalidateQueries({ queryKey: getGetHomepageMediaQueryKey() }); };
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries()); const input = { title: String(values.title), caption: String(values.caption), mediaType: String(values.mediaType) as 'image' | 'video', url: String(values.url), isActive: values.isActive === 'on', sortOrder: Number(values.sortOrder) }; if (editing) update.mutate({ mediaId: editing.id, data: input }, { onSuccess: () => { invalidate(); setModal(false); } }); else create.mutate({ data: input }, { onSuccess: () => { invalidate(); setModal(false); } }); };
  const toggle = (item: HomepageMedia) => update.mutate({ mediaId: item.id, data: { isActive: !item.isActive } }, { onSuccess: invalidate });
  const move = (item: HomepageMedia, direction: -1 | 1) => { const index = items.findIndex((media) => media.id === item.id); const other = items[index + direction]; if (!other) return; update.mutate({ mediaId: item.id, data: { sortOrder: other.sortOrder } }, { onSuccess: () => { update.mutate({ mediaId: other.id, data: { sortOrder: item.sortOrder } }, { onSuccess: invalidate }); } }); };
  const removeItem = (item: HomepageMedia) => { if (window.confirm(`Remove “${item.title}” from homepage media?`)) remove.mutate({ mediaId: item.id }, { onSuccess: invalidate }); };
  const open = (item?: HomepageMedia) => { setEditing(item || null); setModal(true); };
  return <><Head eyebrow="School story" title="Homepage media" subtitle="Choose the moments visitors see first. Drag-free ordering keeps every image intentional." action={<button className="btn" onClick={() => open()}><ImagePlus size={15} /> Add media</button>} />
    <div className="card" style={{ padding: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}><div><b style={{ display: 'block', fontSize: 12, color: '#3d5548' }}>Homepage carousel</b><span style={{ fontSize: 10, color: '#839087' }}>Active items rotate automatically; use the arrows to reorder.</span></div><Link href="/" className="btn secondary small">Preview homepage <ArrowRight size={13} /></Link></div>
    {query.isLoading ? <div className="grid media-grid">{[1, 2, 3].map((i) => <div key={i} className="skeleton" />)}</div> : query.isError ? <LoadError onRetry={() => void query.refetch()} /> : items.length ? <div className="grid media-grid">{items.map((item, index) => <article className="card media-card" key={item.id}><div className="media-preview">{item.mediaType === 'video' ? <video src={item.url} controls muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={item.url} alt={item.title} />}{!item.isActive && <span className="pill inactive" style={{ position: 'absolute', top: 10, left: 10 }}>Inactive</span>}<span style={{ position: 'absolute', right: 10, bottom: 10, background: '#203f34dd', color: '#fff', borderRadius: 20, fontSize: 9, padding: '5px 8px' }}>Position {index + 1}</span></div><div className="media-content"><div className="media-title-row"><span className="media-title">{item.title}</span><span className={`pill ${item.isActive ? 'active' : 'inactive'}`}>{item.isActive ? 'Active' : 'Hidden'}</span></div><p className="media-caption">{item.caption || 'No caption added.'}</p><div className="media-actions"><button className="btn ghost small" onClick={() => toggle(item)}>{item.isActive ? 'Deactivate' : 'Activate'}</button><button className="icon-button" style={{ width: 29, height: 29 }} onClick={() => move(item, -1)} disabled={index === 0} aria-label="Move media earlier"><ChevronLeft size={14} /></button><button className="icon-button" style={{ width: 29, height: 29 }} onClick={() => move(item, 1)} disabled={index === items.length - 1} aria-label="Move media later"><ChevronRight size={14} /></button><span style={{ flex: 1 }} /><RowActions onEdit={() => open(item)} onDelete={() => removeItem(item)} /></div></div></article>)}</div> : <div className="card"><Empty title="Your homepage story starts here" detail="Add an image or video to bring your school homepage to life." /></div>}
    {modal && <Modal title={editing ? 'Edit homepage media' : 'Add homepage media'} close={() => setModal(false)}><form onSubmit={submit}><div className="form-grid">
      <Field label="Title" full><input name="title" required defaultValue={editing?.title} /></Field><Field label="Caption" full><textarea name="caption" defaultValue={editing?.caption} /></Field>
      <Field label="Media type"><select name="mediaType" defaultValue={editing?.mediaType || 'image'}><option value="image">Image</option><option value="video">Video</option></select></Field><Field label="Display order"><input name="sortOrder" type="number" min="0" defaultValue={editing?.sortOrder ?? items.length} /></Field>
      <Field label="Image or video URL" full><input name="url" type="text" required defaultValue={editing?.url} placeholder="/images/school.jpg or https://…" /></Field><Field label="Show in homepage carousel" full><label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" name="isActive" defaultChecked={editing?.isActive ?? true} /> Active and visible</label></Field>
    </div><div className="modal-actions"><button type="button" className="btn secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn" disabled={create.isPending || update.isPending}>{editing ? 'Save media' : 'Add media'}</button></div></form></Modal>}
  </>;
}

function RoutedPages() {
  return <Shell><Switch>
    <Route path="/" component={Dashboard} />
    <Route path="/attendance" component={AttendancePage} />
    <Route path="/students" component={StudentsPage} />
    <Route path="/classes" component={ClassesPage} />
    <Route path="/fees" component={FeesPage} />
    <Route path="/events" component={EventsPage} />
    <Route path="/media" component={MediaPage} />
    <Route component={NotFound} />
  </Switch></Shell>;
}
function App() {
  return <QueryClientProvider client={qc}><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedPages /></WouterRouter></QueryClientProvider>;
}
export default App;
