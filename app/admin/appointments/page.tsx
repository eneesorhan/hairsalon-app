'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LogOut,
  Search,
  ChevronLeft,
  Trash2,
  CheckCircle,
  Clock,
  User,
  Mail,
  Phone,
  Eye,
  Plus,
} from 'lucide-react';

interface Appointment {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: {
    _id: string;
    name: string;
    price: number;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalPrice: number;
  notes?: string;
  createdAt: string;
}

export default function AdminAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [walkInData, setWalkInData] = useState({ date: '', startTime: '', notes: '' });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchAppointments();
  }, [router]);

  useEffect(() => {
    let filtered = appointments;
    if (statusFilter !== 'all') {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (apt) =>
          apt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          apt.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
          apt.customerPhone.includes(searchQuery)
      );
    }
    setFilteredAppointments(filtered);
  }, [appointments, searchQuery, statusFilter]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) { router.push('/admin/login'); return; }
        throw new Error('Randevular yüklenemedi');
      }
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAppointment = async (id: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (!response.ok) throw new Error('Güncelleme başarısız');
      setAppointments(appointments.map((apt) =>
        apt._id === id ? { ...apt, status: 'completed' } : apt
      ));
      if (selectedAppointment?._id === id) {
        setSelectedAppointment({ ...selectedAppointment, status: 'completed' });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Bu randevuyu silmek istediğinize emin misiniz?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/appointments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Silme başarısız');
      setAppointments(appointments.filter((apt) => apt._id !== id));
      setSelectedAppointment(null);
      setShowModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  const handleAddWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/appointments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...walkInData, isWalkIn: true }),
      });
      if (!response.ok) throw new Error('Walk-in eklenemedi');
      alert('Walk-in başarıyla eklendi!');
      setShowWalkInForm(false);
      setWalkInData({ date: '', startTime: '', notes: '' });
      fetchAppointments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return styles[status] || styles.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Bekleme',
      confirmed: 'Onaylı',
      completed: 'Tamamlandı',
      cancelled: 'İptal',
    };
    return labels[status] || status;
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700">
              <ChevronLeft className="w-5 h-5" />
              Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Randevular</h1>
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters & Actions */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <button
              onClick={() => setShowWalkInForm(!showWalkInForm)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-all"
            >
              <Plus className="w-5 h-5" />
              Walk-in Ekle
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Ad, e-posta veya telefon ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-purple-200 dark:border-purple-900/50 rounded-lg focus:border-purple-600 focus:outline-none dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-slate-800 border-2 border-purple-200 dark:border-purple-900/50 hover:border-purple-600'
                }`}
              >
                {status === 'all' ? 'Tümü' : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Walk-in Form */}
        {showWalkInForm && (
          <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-lg border-2 border-green-200 dark:border-green-900/50">
            <h2 className="text-xl font-bold mb-4">Walk-in Saati Ekle</h2>
            <form onSubmit={handleAddWalkIn} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Tarih</label>
                  <input
                    type="date"
                    value={walkInData.date}
                    onChange={(e) => setWalkInData({ ...walkInData, date: e.target.value })}
                    required
                    className="w-full p-3 border-2 border-purple-200 dark:border-purple-900/50 rounded-lg focus:border-purple-600 focus:outline-none dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Saat</label>
                  <input
                    type="time"
                    value={walkInData.startTime}
                    onChange={(e) => setWalkInData({ ...walkInData, startTime: e.target.value })}
                    required
                    className="w-full p-3 border-2 border-purple-200 dark:border-purple-900/50 rounded-lg focus:border-purple-600 focus:outline-none dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Notlar</label>
                  <input
                    type="text"
                    value={walkInData.notes}
                    onChange={(e) => setWalkInData({ ...walkInData, notes: e.target.value })}
                    placeholder="(İsteğe bağlı)"
                    className="w-full p-3 border-2 border-purple-200 dark:border-purple-900/50 rounded-lg focus:border-purple-600 focus:outline-none dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-all">
                  Ekle
                </button>
                <button type="button" onClick={() => setShowWalkInForm(false)} className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-semibold transition-all">
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-purple-200/50 dark:border-purple-900/50 overflow-hidden">
          {filteredAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200/50 dark:border-purple-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold">Müşteri</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Hizmet</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Tarih & Saat</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Durum</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Fiyat</th>
                    <th className="px-6 py-4 text-center text-sm font-bold">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-200/50 dark:divide-purple-900/50">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold">{appointment.customerName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.customerEmail}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold">{appointment.serviceId?.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">£{appointment.serviceId?.price}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold">{appointment.date}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.startTime} - {appointment.endTime}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(appointment.status)}`}>
                          {getStatusLabel(appointment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold">£{appointment.totalPrice}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => { setSelectedAppointment(appointment); setShowModal(true); }}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                            Detay
                          </button>
                          <button
                            onClick={() => handleDeleteAppointment(appointment._id)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              {searchQuery || statusFilter !== 'all' ? 'Arama kriterlerine göre randevu bulunamadı' : 'Henüz randevu yok'}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
            <p className="text-sm opacity-90 mb-1">Toplam</p>
            <p className="text-4xl font-bold">{appointments.length}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg p-6 shadow-lg">
            <p className="text-sm opacity-90 mb-1">Bekleyen</p>
            <p className="text-4xl font-bold">{appointments.filter((a) => a.status === 'pending').length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
            <p className="text-sm opacity-90 mb-1">Onaylı</p>
            <p className="text-4xl font-bold">{appointments.filter((a) => a.status === 'confirmed').length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
            <p className="text-sm opacity-90 mb-1">Toplam Gelir</p>
            <p className="text-3xl font-bold">£{appointments.reduce((sum, a) => sum + a.totalPrice, 0)}</p>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Randevu Detayları</h2>
            <div className="space-y-6">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  Müşteri Bilgileri
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Ad:</strong> {selectedAppointment.customerName}</p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${selectedAppointment.customerEmail}`} className="text-blue-600 hover:underline">
                      {selectedAppointment.customerEmail}
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${selectedAppointment.customerPhone}`} className="text-blue-600 hover:underline">
                      {selectedAppointment.customerPhone}
                    </a>
                  </p>
                </div>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Randevu Bilgileri
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Hizmet:</strong> {selectedAppointment.serviceId?.name}</p>
                  <p><strong>Tarih:</strong> {selectedAppointment.date}</p>
                  <p><strong>Saat:</strong> {selectedAppointment.startTime} - {selectedAppointment.endTime}</p>
                  <p><strong>Fiyat:</strong> £{selectedAppointment.totalPrice}</p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <strong>Durum:</strong>{' '}
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(selectedAppointment.status)}`}>
                      {getStatusLabel(selectedAppointment.status)}
                    </span>
                  </p>
                </div>
              </div>
              {selectedAppointment.notes && (
                <div className="pb-4">
                  <h3 className="font-bold text-lg mb-2">Notlar</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedAppointment.notes}</p>
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <strong>Oluşturulma:</strong> {new Date(selectedAppointment.createdAt).toLocaleString('tr-TR')}
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              {selectedAppointment.status !== 'completed' && selectedAppointment.status !== 'cancelled' && (
                <button
                  onClick={() => handleCompleteAppointment(selectedAppointment._id)}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  İşlem Tamamlandı
                </button>
              )}
              {selectedAppointment.status === 'completed' && (
                <div className="w-full px-4 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-semibold text-center">
                  ✅ Bu randevu tamamlandı
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-semibold hover:bg-gray-400 transition-all"
                >
                  Kapat
                </button>
                <button
                  onClick={() => handleDeleteAppointment(selectedAppointment._id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
