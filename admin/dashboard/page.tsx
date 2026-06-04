'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, BarChart3, Calendar, Settings } from 'lucide-react';

interface DashboardStats {
  totalAppointments: number;
  byHour: Array<{ _id: string; count: number }>;
  byDay: Array<{ _id: string; count: number }>;
  byService: Array<{ _id: string; count: number; revenue: number }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('İstatistikler yüklenemedi');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-purple-600 rounded-full animate-spin">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
          </div>
          <p className="text-gray-600 dark:text-gray-300">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="sticky top-0 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-purple-200/20 dark:border-purple-900/20 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Admin Paneli
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Dashboard</p>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
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

        {/* Statistics */}
        {stats && (
          <div>
            <h2 className="text-3xl font-bold mb-8">İstatistikler</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
                <p className="text-sm opacity-90 mb-2">Toplam Randevular</p>
                <p className="text-4xl font-bold">{stats.totalAppointments}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
                <p className="text-sm opacity-90 mb-2">En Yoğun Saat</p>
                <p className="text-2xl font-bold">
                  {stats.byHour.length > 0
                    ? stats.byHour.reduce((prev, current) =>
                        prev.count > current.count ? prev : current
                      )._id
                    : '-'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
                <p className="text-sm opacity-90 mb-2">Toplam Gelir</p>
                <p className="text-2xl font-bold">
                  £
                  {stats.byService.reduce((sum, service) => sum + service.revenue, 0)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-lg">
                <p className="text-sm opacity-90 mb-2">Hizmet Sayısı</p>
                <p className="text-3xl font-bold">{stats.byService.length}</p>
              </div>
            </div>

            {/* Service Revenue */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-purple-200/50 dark:border-purple-900/50 p-6 mb-12">
              <h3 className="text-xl font-bold mb-6">Hizmet Bazında Gelir</h3>
              <div className="space-y-4">
                {stats.byService.map((service) => (
                  <div key={service._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{service._id}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {service.count} randevu
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">£{service.revenue}</p>
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                          style={{
                            width: `${
                              (service.revenue /
                                Math.max(
                                  ...stats.byService.map((s) => s.revenue)
                                )) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
