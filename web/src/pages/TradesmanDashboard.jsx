import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CalendarCheck, TrendingUp, Star,
  MapPin, Clock, CheckCircle2, X,
  ChevronLeft, ChevronRight, ClipboardList,
  Zap, Calendar, User, Banknote,
} from 'lucide-react';
import { jobsApi, authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './TradesmanDashboard.css';

/* ── date helpers ─────────────────────────────────────────────────────────── */
const isSameDay = (dateStr, ref) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth()    === ref.getMonth()    &&
    d.getDate()     === ref.getDate()
  );
};

const getWeekDays = (base) => {
  const d    = new Date(base);
  const dow  = d.getDay(); // 0 = Sun
  const mon  = new Date(d);
  mon.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(mon);
    day.setDate(mon.getDate() + i);
    return day;
  });
};

const fmtTime  = (s) => s ? new Date(s).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : null;
const fmtShort = (s) => new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

const DAY_NAMES   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

function timeOfDay() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function TradesmanDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [jobs,        setJobs]        = useState([]);
  const [profile,     setProfile]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [weekBase,    setWeekBase]    = useState(new Date());
  const [markDoneJob, setMarkDoneJob] = useState(null);

  const fetchData = async () => {
    try {
      const [jobsRes, meRes] = await Promise.all([jobsApi.mine(), authApi.me()]);
      setJobs(jobsRes.data.jobs || []);
      setProfile(meRes.data.profile);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);

  /* ── derived ── */
  const today       = new Date();
  const weekDays    = getWeekDays(weekBase);
  const pendingJobs = jobs.filter(j => j.status === 'pending');
  const acceptedJobs= jobs.filter(j => j.status === 'accepted');
  const doneJobs    = jobs.filter(j => j.status === 'done');
  const dayJobs     = acceptedJobs
    .filter(j => j.scheduled_at && isSameDay(j.scheduled_at, selectedDay))
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

  const todayCount  = acceptedJobs.filter(j => isSameDay(j.scheduled_at, today)).length;

  const [wkStart, wkEnd] = [weekDays[0], new Date(weekDays[6])];
  wkEnd.setHours(23, 59, 59, 999);
  const weekEarnings = jobs
    .filter(j => j.status === 'completed' && j.final_fee > 0 && j.scheduled_at)
    .filter(j => { const d = new Date(j.scheduled_at); return d >= wkStart && d <= wkEnd; })
    .reduce((s, j) => s + (j.final_fee || 0), 0);

  const rating      = profile?.avg_rating   || 0;
  const reviewCount = profile?.review_count || 0;

  const upcomingJobs = acceptedJobs
    .filter(j => j.scheduled_at && !isSameDay(j.scheduled_at, today) && new Date(j.scheduled_at) > today)
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
    .slice(0, 5);

  /* ── calendar title ── */
  const [m0, m1] = [weekDays[0].getMonth(), weekDays[6].getMonth()];
  const calTitle = m0 === m1
    ? `${MONTH_NAMES[m0]} ${weekDays[0].getFullYear()}`
    : `${MONTH_NAMES[m0]} – ${MONTH_NAMES[m1]} ${weekDays[6].getFullYear()}`;

  const selLabel = selectedDay.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  if (loading) return (
    <div className="page-wrap" style={{ textAlign: 'center', paddingTop: 100 }}>
      <span className="spinner spinner-dark" style={{ width: 36, height: 36 }} />
    </div>
  );

  return (
    <div className="dash-wrap page-wrap">

      {/* ── Greeting ── */}
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">Good {timeOfDay()}, {user?.name?.split(' ')[0]}!</h1>
          <p className="dash-date">
            {today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button className="btn btn-secondary btn-sm dash-all-btn" onClick={() => navigate('/my-jobs')}>
          All Jobs
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="dash-stats">
        <div className={`stat-card ${pendingJobs.length > 0 ? 'stat-alert' : ''}`}>
          <div className="stat-card-icon stat-icon-orange"><Bell size={18} /></div>
          <div className="stat-card-info">
            <div className="stat-card-value">
              {pendingJobs.length}
              {pendingJobs.length > 0 && <span className="stat-dot-live" />}
            </div>
            <div className="stat-card-label">Pending Requests</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon stat-icon-blue"><CalendarCheck size={18} /></div>
          <div className="stat-card-info">
            <div className="stat-card-value">{todayCount}</div>
            <div className="stat-card-label">Today's Jobs</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon stat-icon-green"><TrendingUp size={18} /></div>
          <div className="stat-card-info">
            <div className="stat-card-value">{weekEarnings > 0 ? `${weekEarnings}` : '—'}{weekEarnings > 0 && <span className="stat-unit"> TJS</span>}</div>
            <div className="stat-card-label">This Week's Earnings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon stat-icon-yellow"><Star size={18} /></div>
          <div className="stat-card-info">
            <div className="stat-card-value">
              {rating > 0 ? rating.toFixed(1) : '—'}
              {rating > 0 && <span className="stat-unit"> / 5</span>}
            </div>
            <div className="stat-card-label">
              Rating{reviewCount > 0 ? ` · ${reviewCount} review${reviewCount !== 1 ? 's' : ''}` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="dash-grid">

        {/* ── LEFT: calendar + day schedule ── */}
        <div className="dash-col-left">

          {/* Week calendar */}
          <div className="card dash-calendar">
            <div className="cal-nav-row">
              <button className="cal-nav-btn" onClick={() => setWeekBase(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; })}>
                <ChevronLeft size={16} />
              </button>
              <span className="cal-month-label">{calTitle}</span>
              <button className="cal-nav-btn" onClick={() => setWeekBase(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; })}>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="cal-days-row">
              {weekDays.map((day, i) => {
                const confirmed = acceptedJobs.filter(j => j.scheduled_at && isSameDay(j.scheduled_at, day));
                const pending   = pendingJobs.filter(j => j.scheduled_at && isSameDay(j.scheduled_at, day));
                const isToday   = isSameDay(day.toISOString(), today);
                const isSel     = isSameDay(day.toISOString(), selectedDay);
                return (
                  <button
                    key={i}
                    className={`cal-day-btn ${isSel ? 'cal-sel' : ''} ${isToday && !isSel ? 'cal-today' : ''}`}
                    onClick={() => setSelectedDay(day)}
                  >
                    <span className="cal-day-name">{DAY_NAMES[i]}</span>
                    <span className="cal-day-num">{day.getDate()}</span>
                    <div className="cal-day-dots">
                      {confirmed.length > 0 && (
                        <span className="cal-dot cal-dot-blue" title={`${confirmed.length} job${confirmed.length > 1 ? 's' : ''}`} />
                      )}
                      {pending.length > 0 && (
                        <span className="cal-dot cal-dot-orange" title={`${pending.length} pending`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="cal-legend-row">
              <span className="cal-legend-item"><span className="cal-dot cal-dot-blue" /> Confirmed job</span>
              <span className="cal-legend-item"><span className="cal-dot cal-dot-orange" /> Pending request</span>
            </div>
          </div>

          {/* Day schedule */}
          <div className="card dash-schedule">
            <div className="schedule-hd">
              <div>
                <h2 className="schedule-title">{selLabel}</h2>
                <p className="schedule-sub">{dayJobs.length} job{dayJobs.length !== 1 ? 's' : ''} scheduled</p>
              </div>
            </div>

            {dayJobs.length === 0 ? (
              <div className="schedule-empty">
                <CalendarCheck size={40} className="schedule-empty-icon" />
                <p>No jobs scheduled</p>
                <span>Select another day or wait for new requests</span>
              </div>
            ) : (
              <div className="schedule-list">
                {dayJobs.map((job, idx) => (
                  <div key={job.id} className="sched-item">
                    <div className="sched-time-col">
                      <span className="sched-time">{fmtTime(job.scheduled_at) || '—:—'}</span>
                      {idx < dayJobs.length - 1 && <div className="sched-line" />}
                    </div>
                    <div className="sched-body">
                      <div className="sched-title">{job.title}</div>
                      <div className="sched-meta">
                        <span><User size={11} strokeWidth={2} />{job.customer_name}</span>
                        {job.address && <span><MapPin size={11} strokeWidth={2} />{job.address}</span>}
                      </div>
                      <div className="sched-footer">
                        {job.urgency === 'emergency' && (
                          <span className="badge badge-red" style={{ fontSize: 11 }}><Zap size={10} /> Emergency</span>
                        )}
                        {job.offered_fee && (
                          <span className="sched-fee">{job.offered_fee} TJS budget</span>
                        )}
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm sched-done-btn"
                      onClick={() => setMarkDoneJob(job)}
                    >
                      <CheckCircle2 size={13} />
                      Done
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: requests + upcoming ── */}
        <div className="dash-col-right">

          {/* Incoming requests */}
          <div className="card dash-requests">
            <div className="panel-hd">
              <h2 className="panel-title">
                Incoming Requests
                {pendingJobs.length > 0 && (
                  <span className="panel-badge panel-badge-orange">{pendingJobs.length}</span>
                )}
              </h2>
            </div>

            {pendingJobs.length === 0 ? (
              <div className="panel-empty">
                <ClipboardList size={32} strokeWidth={1.5} className="panel-empty-icon" />
                <p>No pending requests right now</p>
              </div>
            ) : (
              <div className="req-list">
                {pendingJobs.slice(0, 6).map(job => (
                  <RequestCard key={job.id} job={job} onUpdate={fetchData} />
                ))}
                {pendingJobs.length > 6 && (
                  <button className="view-all-btn" onClick={() => navigate('/my-jobs')}>
                    See {pendingJobs.length - 6} more requests →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Awaiting payment */}
          {doneJobs.length > 0 && (
            <div className="card dash-awaiting">
              <div className="panel-hd">
                <h2 className="panel-title">
                  Awaiting Payment
                  <span className="panel-badge panel-badge-green">{doneJobs.length}</span>
                </h2>
              </div>
              <div className="await-list">
                {doneJobs.map(job => (
                  <div key={job.id} className="await-item">
                    <div className="await-info">
                      <div className="await-title">{job.title}</div>
                      <div className="await-client"><User size={11} />{job.customer_name}</div>
                    </div>
                    {job.final_fee > 0 && (
                      <span className="await-fee"><Banknote size={13} />{job.final_fee} TJS</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming confirmed jobs */}
          {upcomingJobs.length > 0 && (
            <div className="card dash-upcoming">
              <div className="panel-hd">
                <h2 className="panel-title">Upcoming Jobs</h2>
              </div>
              <div className="upcoming-list">
                {upcomingJobs.map(job => (
                  <div
                    key={job.id}
                    className="upcoming-item"
                    onClick={() => setSelectedDay(new Date(job.scheduled_at))}
                  >
                    <div className="upcoming-date-badge">
                      <span className="upd-day">{new Date(job.scheduled_at).getDate()}</span>
                      <span className="upd-mon">{MONTH_NAMES[new Date(job.scheduled_at).getMonth()].slice(0, 3)}</span>
                    </div>
                    <div className="upcoming-info">
                      <div className="upcoming-title">{job.title}</div>
                      <div className="upcoming-meta">
                        <span><User size={11} />{job.customer_name}</span>
                        {job.city && <span><MapPin size={11} />{job.city}</span>}
                      </div>
                    </div>
                    <div className="upcoming-time">
                      {job.urgency === 'emergency'
                        ? <span className="badge badge-red" style={{ fontSize: 10 }}><Zap size={9} /> Urgent</span>
                        : <span className="upd-time"><Clock size={11} />{fmtTime(job.scheduled_at)}</span>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Mark Done modal ── */}
      {markDoneJob && (
        <MarkDoneModal
          job={markDoneJob}
          onClose={() => setMarkDoneJob(null)}
          onDone={() => { setMarkDoneJob(null); fetchData(); }}
        />
      )}
    </div>
  );
}

/* ── Request card ─────────────────────────────────────────────────────────── */
function RequestCard({ job, onUpdate }) {
  const [loading, setLoading] = useState(null); // 'accepted' | 'declined' | null

  const handle = async (status) => {
    setLoading(status);
    try {
      await jobsApi.updateStatus(job.id, status);
      onUpdate();
    } catch {
      setLoading(null);
    }
  };

  return (
    <div className="req-card">
      <div className="req-card-top">
        <div className="req-title">{job.title}</div>
        {job.urgency === 'emergency' && (
          <span className="badge badge-red req-urgent-badge"><Zap size={10} /> Emergency</span>
        )}
      </div>
      <div className="req-meta">
        <span><User size={11} />{job.customer_name}</span>
        {job.city && <span><MapPin size={11} />{job.city}</span>}
        {job.scheduled_at && <span><Calendar size={11} />{fmtShort(job.scheduled_at)}</span>}
      </div>
      {job.offered_fee && (
        <div className="req-fee">Budget: <strong>{job.offered_fee} TJS</strong></div>
      )}
      <div className="req-actions">
        <button
          className="btn btn-primary btn-sm"
          disabled={!!loading}
          onClick={() => handle('accepted')}
        >
          {loading === 'accepted' ? <span className="spinner" /> : 'Accept'}
        </button>
        <button
          className="btn btn-secondary btn-sm"
          disabled={!!loading}
          onClick={() => handle('declined')}
        >
          {loading === 'declined' ? <span className="spinner spinner-dark" /> : 'Decline'}
        </button>
      </div>
    </div>
  );
}

/* ── Mark Done modal ──────────────────────────────────────────────────────── */
function MarkDoneModal({ job, onClose, onDone }) {
  const [hours,   setHours]   = useState('');
  const [minutes, setMinutes] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const h        = parseInt(hours)   || 0;
  const m        = parseInt(minutes) || 0;
  const totalHrs = h + m / 60;
  const rate     = job.hourly_rate || 0;
  const total    = totalHrs > 0 && rate > 0 ? Math.round(totalHrs * rate) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (totalHrs <= 0) { setError('Enter at least 1 minute of work'); return; }
    setLoading(true);
    try {
      await jobsApi.updateStatus(job.id, 'done', { hours_worked: parseFloat(totalHrs.toFixed(4)) });
      onDone();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark as done');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card card" onClick={e => e.stopPropagation()}>
        <div className="modal-hd">
          <div>
            <h2 className="modal-title">Mark Job as Done</h2>
            <p className="modal-sub">{job.title}</p>
          </div>
          <button className="modal-x" onClick={onClose}><X size={18} /></button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 10, fontSize: 14 }}>
            Time worked
          </label>
          <div className="time-inputs">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <input className="form-control time-input" type="number" min="0" max="23"
                placeholder="0" value={hours}
                onChange={e => { setHours(e.target.value); setError(''); }} />
              <div className="time-label">hours</div>
            </div>
            <div className="time-sep">:</div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <select className="form-control time-input" value={minutes}
                onChange={e => { setMinutes(e.target.value); setError(''); }}>
                {[0,5,10,15,20,25,30,35,40,45,50,55].map(v => (
                  <option key={v} value={v}>{String(v).padStart(2, '0')}</option>
                ))}
              </select>
              <div className="time-label">minutes</div>
            </div>
          </div>

          {total !== null && (
            <div className="done-preview">
              <Clock size={14} />
              {h}h {m}m × {rate} TJS/hr = <strong>{total} TJS</strong>
            </div>
          )}

          <div className="modal-actions">
            <button className="btn btn-primary" type="submit"
              disabled={loading || totalHrs <= 0} style={{ flex: 1 }}>
              {loading ? <span className="spinner" /> : <><CheckCircle2 size={15} /> Confirm</>}
            </button>
            <button className="btn btn-secondary" type="button"
              onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
