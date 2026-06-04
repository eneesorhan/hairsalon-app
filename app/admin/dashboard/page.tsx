'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Calendar, BarChart3, Settings, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Stats {
  totalAppointments: number;
  busiestHour: string;
  totalRevenue: number;
  serviceCount: number;
}

interface CalendarAppointment {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
  notes?: string;
  serviceId: { name: string; price: number } | null;
}

const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

function getDayColor(count: number) {
  if (count === 0) return '';
  if (count <= 2) return 'bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700';
  if (count <= 4) return 'bg-purple-300 dark:bg-purple-700/60 border-purple-400 dark:border-purple-600';
  return 'bg-purple-500 dark:bg-purple-600 border-purple-600 dark:border-purple-500 text-white';
}

function getStatusLabel(status: string) {
  const m: Record<string, string> = {
    pending: 'Bekliyor', confirmed: 'Onaylı',
    completed: 'Tamamlandı', cancelled: 'İptal',
  };
  return m[status] || status;
}

function getStatusColor(status: string) {
  const m: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };
  return m[status] || m.pending;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Calendar state
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth() + 1); // 1-indexed
  const [calData, setCalData] = useState<Record<string, CalendarAppointment[]>>({});
  const [calLoading, setCalLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { router.push('/admin/login'); return; }
    fetchStats(token);
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    fetchCalendar(token, calYear, calMonth);
  }, [calYear, calMonth]);

  const fetchStats = async (token: string) => {
    try {
      const res = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      setStats(await res.json());
    } catch {
      setError('İstatistikler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendar = async (token: string, year: number, month: number) => {
    setCalLoading(true);
    try {
      const res = await fetch(`/api/admin/calendar?year=${year}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCalData(data.byDate || {});
    } catch {
      // fail silently
    } finally {
      setCalLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const prevMonth = () => {
    if (calMonth === 1) { setCalYear(y => y - 1); setCalMonth(12); }
    else setCalMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (calMonth === 12) { setCalYear(y => y + 1); setCalMonth(1); }
    else setCalMonth(m => m + 1);
    setSelectedDay(null);
  };

  // Build calendar grid (Mon-Sun, ISO week)
  const buildCalendarDays = () => {
    const firstDay = new Date(calYear, calMonth - 1, 1);
    // 0=Sun → convert to Mon-first: Mon=0..Sun=6
    const startDow = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(calYear, calMonth, 0).getDate();

    const cells: (number | null)[] = Array(startDow).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  };

  const dateKey = (day: number) =>
    `${calYear}-${String(calMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const calendarDays = buildCalendarDays();
  const selectedApts = selectedDay ? (calData[selectedDay] || []) : [];

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-5">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Toplam Randevu</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalAppointments}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-5">
              <p className="text-gray-500 dark:text-gray-400 text-sm">En Yoğun Saat</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.busiestHour || '-'}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-5">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Toplam Gelir</p>
              <p className="text-3xl font-bold text-green-600 mt-1">£{stats.totalRevenue}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-5">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Hizmet Sayısı</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.serviceCount}</p>
            </div>
          </div>
        )}

        {/* Calendar + Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">
                {MONTH_NAMES[calMonth - 1]} {calYear}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => { setCalYear(today.getFullYear()); setCalMonth(today.getMonth() + 1); setSelectedDay(null); }}
                  className="px-3 py-1 text-sm rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 transition-colors font-semibold"
                >
                  Bugün
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAY_NAMES.map((d) => (
                <div key={d} className="text-center text-xs font-bold text-gray-400 dark:text-gray-500 py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            {calLoading ? (
              <div className="h-48 flex items-center justify-center text-gray-400">Yükleniyor...</div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} />;
                  const key = dateKey(day);
                  const count = calData[key]?.length ?? 0;
                  const isToday = key === todayKey;
                  const isSelected = key === selectedDay;

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDay(isSelected ? null : key)}
                      className={`
                        relative aspect-square rounded-lg border flex flex-col items-center justify-center gap-0.5
                        transition-all hover:scale-105 cursor-pointer
                        ${isSelected
                          ? 'ring-2 ring-purple-600 ring-offset-1'
                          : 'border-transparent'}
                        ${isToday && !count ? 'border-purple-400 dark:border-purple-500' : ''}
                        ${count > 0 ? getDayColor(count) : 'hover:bg-gray-100 dark:hover:bg-slate-700'}
                      `}
                    >
                      <span className={`text-sm font-semibold leading-none ${isToday ? 'text-purple-600 dark:text-purple-400' : count > 4 ? 'text-white' : ''}`}>
                        {day}
                      </span>
                      {count > 0 && (
                        <span className={`text-xs font-bold leading-none ${count > 4 ? 'text-white/90' : 'text-purple-700 dark:text-purple-300'}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-purple-100 dark:bg-purple-900/40 border border-purple-300 inline-block" />
                1–2 randevu
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-purple-300 dark:bg-purple-700/60 border border-purple-400 inline-block" />
                3–4 randevu
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-purple-500 dark:bg-purple-600 border border-purple-600 inline-block" />
                5+ randevu
              </span>
            </div>
          </div>

          {/* Side panel: selected day details */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 flex flex-col">
            {selectedDay ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">
                    {new Date(selectedDay + 'T00:00:00').toLocaleDateString('tr-TR', {
                      day: 'numeric', month: 'long', weekday: 'long',
                    })}
                  </h3>
                  <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {selectedApts.length === 0 ? (
                  <p className="text-gray-400 dark:text-gray-500 text-sm text-center mt-8">
                    Bu gün için randevu yok
                  </p>
                ) : (
                  <div className="space-y-3 overflow-y-auto flex-1">
                    {selectedApts.map((apt) => (
                      <div
                        key={apt._id}
                        className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200/50 dark:border-purple-900/50"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-purple-700 dark:text-purple-300">
                            {apt.startTime} – {apt.endTime}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusColor(apt.status)}`}>
                            {getStatusLabel(apt.status)}
                          </span>
                        </div>
                        <p className="font-semibold text-sm">{apt.customerName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{apt.serviceId?.name}</p>
                        <p className="text-xs font-bold text-green-600 dark:text-green-400 mt-1">£{apt.totalPrice}</p>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  href="/admin/appointments"
                  className="mt-4 text-center text-sm text-purple-600 hover:underline font-semibold"
                >
                  Tümünü Yönet →
                </Link>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-gray-400 dark:text-gray-500">
                <Calendar className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm text-center">Detayları görmek için takvimde bir güne tıkla</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/appointments"
            className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-purple-200/50 dark:border-purple-900/50 hover:shadow-lg transition-all group hover:bg-purple-50 dark:hover:bg-purple-900/10"
          >
            <Calendar className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg">Randevular</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tüm randevuları yönet</p>
          </Link>

          <Link
            href="/admin/services"
            className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-purple-200/50 dark:border-purple-900/50 hover:shadow-lg transition-all group hover:bg-purple-50 dark:hover:bg-purple-900/10"
          >
            <BarChart3 className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg">Hizmetler</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Hizmet ekle/düzenle/sil</p>
          </Link>

          <Link
            href="/admin/settings"
            className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-purple-200/50 dark:border-purple-900/50 hover:shadow-lg transition-all group hover:bg-purple-50 dark:hover:bg-purple-900/10"
          >
            <Settings className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg">Ayarlar</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Çalışma saatleri ve ayarlar</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
