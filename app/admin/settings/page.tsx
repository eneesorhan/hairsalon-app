'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, ChevronLeft, Save, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BusinessHour {
  _id?: string;
  dayOfWeek: number;
  dayName: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  breakStart: string;
  breakEnd: string;
}

const DEFAULT_HOURS: BusinessHour[] = [
  { dayOfWeek: 0, dayName: 'Pazar',     isOpen: false, openTime: '09:00', closeTime: '18:00', breakStart: '', breakEnd: '' },
  { dayOfWeek: 1, dayName: 'Pazartesi', isOpen: true,  openTime: '09:00', closeTime: '18:00', breakStart: '', breakEnd: '' },
  { dayOfWeek: 2, dayName: 'Salı',      isOpen: true,  openTime: '09:00', closeTime: '18:00', breakStart: '', breakEnd: '' },
  { dayOfWeek: 3, dayName: 'Çarşamba',  isOpen: true,  openTime: '09:00', closeTime: '18:00', breakStart: '', breakEnd: '' },
  { dayOfWeek: 4, dayName: 'Perşembe',  isOpen: true,  openTime: '09:00', closeTime: '18:00', breakStart: '', breakEnd: '' },
  { dayOfWeek: 5, dayName: 'Cuma',      isOpen: true,  openTime: '09:00', closeTime: '18:00', breakStart: '', breakEnd: '' },
  { dayOfWeek: 6, dayName: 'Cumartesi', isOpen: true,  openTime: '10:00', closeTime: '17:00', breakStart: '', breakEnd: '' },
];

export default function AdminSettingsPage() {
  const router = useRouter();
  const [hours, setHours] = useState<BusinessHour[]>(DEFAULT_HOURS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { router.push('/admin/login'); return; }
    fetchHours();
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchHours = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/business-hours', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error();
      const data: BusinessHour[] = await response.json();
      if (data.length > 0) {
        // Merge with defaults to ensure all 7 days exist
        const merged = DEFAULT_HOURS.map((def) => {
          const saved = data.find((d) => d.dayOfWeek === def.dayOfWeek);
          return saved ? { ...def, ...saved } : def;
        });
        setHours(merged);
      }
    } catch {
      // Use defaults silently
    } finally {
      setLoading(false);
    }
  };

  const updateDay = (dayOfWeek: number, field: keyof BusinessHour, value: string | boolean) => {
    setHours((prev) =>
      prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/business-hours', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(hours),
      });
      if (!response.ok) throw new Error();
      setToast({ type: 'success', message: 'Çalışma saatleri kaydedildi!' });
    } catch {
      setToast({ type: 'error', message: 'Kaydetme başarısız, tekrar deneyin.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <p className="text-gray-600 dark:text-gray-300">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="sticky top-0 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-purple-200/20 dark:border-purple-900/20 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700">
              <ChevronLeft className="w-5 h-5" />
              Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Ayarlar</h1>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-all"
          >
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg text-white transition-all ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-5 h-5 shrink-0" />
            : <AlertCircle className="w-5 h-5 shrink-0" />
          }
          {toast.message}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Business Hours Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-purple-200/50 dark:border-purple-900/50 overflow-hidden">
          <div className="px-6 py-5 border-b border-purple-200/50 dark:border-purple-900/50 flex items-center gap-3">
            <Clock className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold">Çalışma Saatleri</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">London (GMT) zaman dilimine göre</p>
            </div>
          </div>

          <div className="divide-y divide-purple-200/30 dark:divide-purple-900/30">
            {hours.map((day) => (
              <div key={day.dayOfWeek} className={`px-6 py-5 transition-colors ${!day.isOpen ? 'opacity-60' : ''}`}>
                {/* Day header row */}
                <div className="flex items-center gap-4 mb-4">
                  {/* Toggle */}
                  <button
                    onClick={() => updateDay(day.dayOfWeek, 'isOpen', !day.isOpen)}
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none ${
                      day.isOpen ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    aria-label={day.isOpen ? 'Kapat' : 'Aç'}
                  >
                    <span
                      className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform mt-0.5 ${
                        day.isOpen ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>

                  <span className={`w-24 font-bold ${day.isOpen ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                    {day.dayName}
                  </span>

                  {!day.isOpen && (
                    <span className="text-sm text-gray-400 dark:text-gray-500 italic">Kapalı</span>
                  )}
                </div>

                {/* Time inputs — only when open */}
                {day.isOpen && (
                  <div className="ml-15 space-y-3 pl-[60px]">
                    {/* Open / Close */}
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 w-20">Açılış</label>
                      <input
                        type="time"
                        value={day.openTime}
                        onChange={(e) => updateDay(day.dayOfWeek, 'openTime', e.target.value)}
                        className="p-2 border-2 border-purple-200 dark:border-purple-900/50 rounded-lg focus:border-purple-600 focus:outline-none dark:bg-slate-700 dark:text-white text-sm"
                      />
                      <span className="text-gray-400">—</span>
                      <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 w-20">Kapanış</label>
                      <input
                        type="time"
                        value={day.closeTime}
                        onChange={(e) => updateDay(day.dayOfWeek, 'closeTime', e.target.value)}
                        className="p-2 border-2 border-purple-200 dark:border-purple-900/50 rounded-lg focus:border-purple-600 focus:outline-none dark:bg-slate-700 dark:text-white text-sm"
                      />
                    </div>

                    {/* Break times */}
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="text-sm text-gray-500 dark:text-gray-400 w-20">Mola Başı</label>
                      <input
                        type="time"
                        value={day.breakStart}
                        onChange={(e) => updateDay(day.dayOfWeek, 'breakStart', e.target.value)}
                        placeholder="--:--"
                        className="p-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-600 focus:outline-none dark:bg-slate-700 dark:text-white text-sm"
                      />
                      <span className="text-gray-400">—</span>
                      <label className="text-sm text-gray-500 dark:text-gray-400 w-20">Mola Sonu</label>
                      <input
                        type="time"
                        value={day.breakEnd}
                        onChange={(e) => updateDay(day.dayOfWeek, 'breakEnd', e.target.value)}
                        placeholder="--:--"
                        className="p-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-600 focus:outline-none dark:bg-slate-700 dark:text-white text-sm"
                      />
                      <span className="text-xs text-gray-400">(isteğe bağlı)</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="px-6 py-5 bg-purple-50 dark:bg-purple-900/10 border-t border-purple-200/50 dark:border-purple-900/50">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold transition-all disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
