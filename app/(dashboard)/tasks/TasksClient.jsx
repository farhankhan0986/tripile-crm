'use client';

import { useState, useMemo, useRef } from 'react';
import {
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Bell,
  CalendarClock,
  AlertCircle,
  MessageSquarePlus,
  Pencil,
  User,
  Link as LinkIcon,
  CheckSquare,
  StickyNote,
  Filter,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import TaskForm from '@/components/forms/TaskForm';

/* ─── helpers ─────────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getDueDateState(dueDate, status) {
  if (status === 'completed') return 'completed';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  if (due < today) return 'overdue';
  if (due.getTime() === today.getTime()) return 'today';
  return 'upcoming';
}

const STATE_STYLES = {
  overdue:   { card: 'border-l-red-400 bg-red-50/40',    label: 'Overdue',   labelCls: 'text-red-500 font-semibold',   dateCls: 'text-red-500' },
  today:     { card: 'border-l-amber-400 bg-amber-50/40', label: 'Due Today', labelCls: 'text-amber-600 font-semibold', dateCls: 'text-amber-600' },
  upcoming:  { card: 'border-l-transparent bg-white',    label: '',          labelCls: '',                              dateCls: 'text-gray-500' },
  completed: { card: 'border-l-emerald-300 bg-gray-50/60', label: '',        labelCls: '',                              dateCls: 'text-gray-400' },
};

const PRIORITY_PILL = {
  high:   'bg-red-100 text-red-700 ring-1 ring-red-200',
  medium: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200',
  low:    'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
};

/* ─── NoteLog ─────────────────────────────────────────────────── */
function NoteLog({ notes, taskId, onNoteAdded }) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function addNote() {
    if (!text.trim()) { setError('Note cannot be empty.'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addNote: text.trim() }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed.'); return; }
      const d = await res.json();
      onNoteAdded(d.task);
      setText('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-widest">
        <StickyNote size={11} />
        Task Notes
      </div>

      {notes.length === 0 && (
        <p className="text-xs text-gray-400 italic">No notes yet — add your first update below.</p>
      )}

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {notes.map((note, i) => (
          <div key={i} className="relative pl-3 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-blue-200 before:rounded-full">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{note.text}</p>
            <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
              <span className="font-medium text-gray-500">{note.addedBy?.name || 'Unknown'}</span>
              <span>·</span>
              {new Date(note.createdAt).toLocaleString('en-GB', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-start pt-1">
        <textarea
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-300 bg-white transition-shadow"
          rows={2}
          placeholder="e.g. Customer asked to call tomorrow…"
          value={text}
          onChange={(e) => { setText(e.target.value); setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addNote(); }}
        />
        <Button size="sm" onClick={addNote} loading={saving} disabled={saving} className="mt-0.5">
          <MessageSquarePlus size={13} />
          Add
        </Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ─── TaskCard ────────────────────────────────────────────────── */
function TaskCard({ task, currentUser, onToggleStatus, onDelete, onEdit, onUpdated }) {
  const [expanded, setExpanded] = useState(false);
  const [toggling, setToggling] = useState(false);

  const state = getDueDateState(task.dueDate, task.status);
  const { card, label: stateLabel, labelCls, dateCls } = STATE_STYLES[state];
  const canDelete = currentUser.role !== 'agent';
  const canEdit   = currentUser.role !== 'agent';

  const reminderToday = (() => {
    if (!task.reminderDate || task.status === 'completed') return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const rem   = new Date(task.reminderDate); rem.setHours(0, 0, 0, 0);
    return rem.getTime() === today.getTime();
  })();

  async function toggle() {
    setToggling(true);
    await onToggleStatus(task);
    setToggling(false);
  }

  return (
    <div className={`rounded-2xl border border-l-4 ${card} border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start gap-3 px-4 py-3.5">

        {/* Checkbox */}
        <button
          onClick={toggle}
          disabled={toggling}
          className="mt-0.5 flex-shrink-0 text-gray-300 hover:text-emerald-500 active:scale-90 transition-all cursor-pointer disabled:opacity-50"
          title={task.status === 'completed' ? 'Mark as pending' : 'Mark complete'}
        >
          {task.status === 'completed'
            ? <CheckCircle2 size={22} className="text-emerald-500" />
            : <Circle size={22} />}
        </button>

        {/* Body */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`text-sm font-semibold leading-snug ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
              {task.title}
            </span>

            {/* Priority pill */}
            <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md tracking-wide ${PRIORITY_PILL[task.priority] || PRIORITY_PILL.low}`}>
              {task.priority?.toUpperCase()}
            </span>

            {/* Reminder badge */}
            {reminderToday && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-violet-100 text-violet-700 ring-1 ring-violet-200 rounded-full px-2 py-0.5 font-semibold animate-pulse">
                <Bell size={9} />
                Reminder
              </span>
            )}

            {/* Status badge */}
            {task.status === 'completed' && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 rounded-full px-2 py-0.5 font-semibold">
                <CheckCircle2 size={9} /> Done
              </span>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            {/* Due date */}
            <span className={`flex items-center gap-1 text-xs ${dateCls}`}>
              <CalendarClock size={11} />
              {stateLabel ? <span className={labelCls}>{stateLabel} ·</span> : null}
              {formatDate(task.dueDate)}
            </span>

            {/* Reminder date */}
            {task.reminderDate && task.status !== 'completed' && (
              <span className="flex items-center gap-1 text-xs text-violet-500">
                <Bell size={11} />
                {formatDate(task.reminderDate)}
              </span>
            )}

            {/* Assignee */}
            {task.assignedTo && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <User size={11} />
                {task.assignedTo.name}
              </span>
            )}

            {/* Customer */}
            {task.customer && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <LinkIcon size={11} />
                {task.customer.name}
              </span>
            )}

            {/* Notes count */}
            {task.notes?.length > 0 && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 cursor-pointer transition-colors"
              >
                <StickyNote size={11} />
                {task.notes.length} note{task.notes.length !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5 flex-shrink-0 self-start mt-0.5">
          {canEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
              title="Edit"
            >
              <Pencil size={13} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(task._id)}
              className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          )}
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
            title={expanded ? 'Collapse' : 'Notes'}
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Notes panel */}
      {expanded && (
        <div className="px-4 pb-4 pt-3 border-t border-gray-100 bg-gray-50/60">
          <NoteLog
            notes={task.notes || []}
            taskId={task._id}
            onNoteAdded={onUpdated}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Summary bar ─────────────────────────────────────────────── */
function SummaryBar({ tasks }) {
  const overdue   = tasks.filter(t => t.status === 'pending' && getDueDateState(t.dueDate, t.status) === 'overdue').length;
  const dueToday  = tasks.filter(t => t.status === 'pending' && getDueDateState(t.dueDate, t.status) === 'today').length;
  const upcoming  = tasks.filter(t => t.status === 'pending' && getDueDateState(t.dueDate, t.status) === 'upcoming').length;
  const completed = tasks.filter(t => t.status === 'completed').length;

  const stats = [
    { label: 'Overdue',   count: overdue,   cls: 'text-red-600',    bg: 'bg-red-50',     ring: 'ring-red-200'    },
    { label: 'Due Today', count: dueToday,  cls: 'text-amber-600',  bg: 'bg-amber-50',   ring: 'ring-amber-200'  },
    { label: 'Upcoming',  count: upcoming,  cls: 'text-sky-600',    bg: 'bg-sky-50',     ring: 'ring-sky-200'    },
    { label: 'Completed', count: completed, cls: 'text-emerald-600',bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      {stats.map(({ label, count, cls, bg, ring }) => (
        <div key={label} className={`${bg} ring-1 ${ring} rounded-xl px-4 py-3`}>
          <p className={`text-2xl font-bold ${cls}`}>{count}</p>
          <p className={`text-xs font-medium mt-0.5 ${cls} opacity-80`}>{label}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────── */
export default function TasksClient({ initialTasks, currentUser, users, customers }) {
  const [tasks, setTasks]             = useState(initialTasks);
  const [filter, setFilter]           = useState('pending');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [createOpen, setCreateOpen]   = useState(false);
  const [editTask, setEditTask]       = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toastMsg, setToastMsg]       = useState('');
  const toastTimer = useRef(null);

  function showToast(msg) {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 3000);
  }

  const filtered = useMemo(() => {
    let list = tasks;
    if (filter !== 'all') list = list.filter(t => t.status === filter);
    if (assigneeFilter) list = list.filter(t => (t.assignedTo?._id || t.assignedTo?.id) === assigneeFilter);
    return list;
  }, [tasks, filter, assigneeFilter]);

  async function handleCreate(payload) {
    const res  = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'Failed to create task.'); return; }
    setTasks(prev => [data.task, ...prev]);
    setCreateOpen(false);
    showToast('✓ Task created');
  }

  async function handleEdit(payload) {
    const res  = await fetch(`/api/tasks/${editTask._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'Failed to update task.'); return; }
    setTasks(prev => prev.map(t => t._id === data.task._id ? data.task : t));
    setEditTask(null);
    showToast('✓ Task updated');
  }

  async function handleToggleStatus(task) {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    const res  = await fetch(`/api/tasks/${task._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'Failed.'); return; }
    setTasks(prev => prev.map(t => t._id === data.task._id ? { ...t, ...data.task } : t));
    showToast(newStatus === 'completed' ? '✓ Marked complete' : 'Task reopened');
  }

  async function handleDelete(id) {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) { const d = await res.json(); alert(d.error || 'Failed.'); return; }
    setTasks(prev => prev.filter(t => t._id !== id));
    setDeleteConfirm(null);
    showToast('Task deleted');
  }

  function handleUpdated(updatedTask) {
    setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
  }

  const canFilter   = currentUser.role !== 'agent';
  const pendingCount = tasks.filter(t => t.status === 'pending').length;

  const filterTabs = [
    { key: 'pending',   label: 'Pending',   count: tasks.filter(t => t.status === 'pending').length },
    { key: 'completed', label: 'Completed',  count: tasks.filter(t => t.status === 'completed').length },
    { key: 'all',       label: 'All',        count: tasks.length },
  ];

  return (
    <div className="max-w-4xl mx-auto">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckSquare size={16} color="#f8fafc" strokeWidth={2} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Tasks</h1>
            {pendingCount > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full ring-1 ring-amber-200">
                {pendingCount} pending
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 ml-10.5">Reminders and follow-up tasks</p>
        </div>
        <Button id="create-task-btn" onClick={() => setCreateOpen(true)} className="flex-shrink-0">
          <Plus size={15} />
          New Task
        </Button>
      </div>

      {/* ── Summary bar ── */}
      <SummaryBar tasks={tasks} />

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Status tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {filterTabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filter === key
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {label}
              <span className={`text-[10px] px-1 rounded ${filter === key ? 'bg-gray-100 text-gray-600' : 'bg-gray-200/60 text-gray-400'}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Assignee filter */}
        {canFilter && users.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Filter size={12} className="text-gray-400" />
            <select
              value={assigneeFilter}
              onChange={e => setAssigneeFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
            >
              <option value="">All Assignees</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>
          </div>
        )}

        <span className="text-xs text-gray-300 ml-auto">
          {filtered.length} task{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Task list ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <CheckCircle2 size={28} className="text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-400">
            {filter === 'completed' ? 'No completed tasks yet' : filter === 'pending' ? 'No pending tasks 🎉' : 'No tasks found'}
          </p>
          <p className="text-xs text-gray-300 mt-1">
            {filter === 'pending' ? 'All caught up!' : 'Create one using the button above.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              currentUser={currentUser}
              onToggleStatus={handleToggleStatus}
              onDelete={id => setDeleteConfirm(id)}
              onEdit={t => setEditTask(t)}
              onUpdated={handleUpdated}
            />
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Task">
        <TaskForm currentUser={currentUser} users={users} customers={customers}
          onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>

      <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
        {editTask && (
          <TaskForm initialData={editTask} currentUser={currentUser} users={users} customers={customers}
            onSubmit={handleEdit} onCancel={() => setEditTask(null)} />
        )}
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Task" maxWidth="max-w-sm">
        <div className="flex flex-col items-center text-center pt-2 pb-1">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-3">
            <Trash2 size={22} className="text-red-500" />
          </div>
          <p className="text-sm font-semibold text-gray-800 mb-1">Delete this task?</p>
          <p className="text-xs text-gray-400 mb-5">This action cannot be undone.</p>
          <div className="flex gap-2 w-full">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={() => handleDelete(deleteConfirm)}>Delete</Button>
          </div>
        </div>
      </Modal>

      {/* ── Toast ── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-2xl border border-white/10">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
