import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, isSameDay,
  format, addMonths, subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { projectsApi } from '@/utils/api';
import Header from '@/components/layout/Header';
import { PRIORITY_COLORS } from '@/types';

export default function CalendarPage() {
  const [current, setCurrent] = useState(new Date());
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: () => projectsApi.getAll().then(r => r.data) });

  const allTasks = (projects || []).flatMap((p: any) =>
    (p.tasks || []).map((t: any) => ({ ...t, projectName: p.name, projectColor: p.color, projectEmoji: p.emoji }))
  );

  const tasksByDate = allTasks.reduce((acc: any, t: any) => {
    if (!t.dueDate) return acc;
    const key = format(new Date(t.dueDate), 'yyyy-MM-dd');
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Calendario" subtitle="Tareas y fechas límite" />
      <div className="flex-1 overflow-hidden p-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrent(d => subMonths(d, 1))} className="btn-ghost p-2"><ChevronLeft size={16} /></button>
          <h2 className="text-base font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>
            {format(current, 'MMMM yyyy', { locale: es })}
          </h2>
          <button onClick={() => setCurrent(d => addMonths(d, 1))} className="btn-ghost p-2"><ChevronRight size={16} /></button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map(d => (
            <div key={d} className="text-center text-xs font-medium py-1.5" style={{ color: 'var(--text-tertiary)' }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px flex-1 overflow-hidden" style={{ background: 'var(--border)' }}>
          {days.map(day => {
            const key = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDate[key] || [];
            const inMonth = isSameMonth(day, current);
            const today = isToday(day);

            return (
              <div
                key={key}
                className="min-h-[80px] p-1.5 overflow-hidden"
                style={{ background: today ? 'rgba(0,122,255,0.04)' : 'var(--bg)' }}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1 ${today ? 'text-white font-semibold' : ''}`}
                  style={{ background: today ? 'var(--accent)' : 'transparent', color: today ? 'white' : inMonth ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
                >
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5">
                  {dayTasks.slice(0, 3).map((t: any, i: number) => (
                    <div key={i} className="flex items-center gap-1 px-1 py-0.5 rounded text-[10px] truncate" style={{ background: `${PRIORITY_COLORS[t.priority as keyof typeof PRIORITY_COLORS]}18` }}>
                      <span>{t.projectEmoji || '📁'}</span>
                      <span className="truncate" style={{ color: 'var(--text-primary)' }}>{t.title}</span>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-[10px] px-1" style={{ color: 'var(--text-tertiary)' }}>+{dayTasks.length - 3} más</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
