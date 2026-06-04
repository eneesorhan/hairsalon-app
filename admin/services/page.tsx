'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, ChevronLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface Service {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: 'cutting' | 'coloring' | 'styling' | 'treatment' | 'other';
  isActive: boolean;
}

interface FormData {
  name: string;
  description: string;
  duration: number;
  price: number;
  category: 'cutting' | 'coloring' | 'styling' | 'treatment' | 'other';
  isActive: boolean;
}

export default function AdminServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    duration: 60,
    price: 0,
    category: 'other',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchServices();
  }, [router]);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');

      if (!response.ok) {
        throw new Error('Hizmetler yüklenemedi');
      }

      const data = await response.json();
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      isActive: e.target.checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingId
        ? `/api/admin/services/${editingId}`
        : '/api/admin/services';

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('İşlem başarısız');
      }

      const result = await response.json();

      if (editingId) {
        setServices(
          services.map((s) => (s._id === editingId ? result : s))
        );
      } else {
        setServices([...services, result]);
      }

      resetForm();
      alert(editingId ? 'Hizmet güncellendi' : 'Hizmet eklendi');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingId(service._id);
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      category: service.category,
      isActive: service.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu hizmeti silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Silinme başarısız');
      }

      setServices(services.filter((s) => s._id !== id));
      alert('Hizmet silindi');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      duration: 60,
      price: 0,
      category: 'other',
      isActive: true,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      cutting: 'Kesim',
      coloring: 'Boyama',
      styling: 'Styling',
      treatment: 'Tedavi',
      other: 'Diğer',
    };
    return labels[category as keyof typeof labels] || category;
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
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700"
            >
              <ChevronLeft className="w-5 h-5" />
              Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Hizmetler</h1>
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Add Service Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-8 inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-all"
          >
            <Plus className="w-5 h-5" />
            Yeni Hizmet Ekle
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-lg border-2 border-purple-200 dark:border-purple-900/50">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? 'Hizmeti Düzenle' : 'Yeni Hizmet Ekle'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Name */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  Hizmet Adı *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Örn: Saç Kesimi"
                  className="w-full p-3 border-2 border-purple-200 dark:border-purple-900/50 rounded-lg focus:border-purple-600 focus:outline-none dark:bg-slate-700 dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold mb-2">Açıklama</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Hizmetin detaylı açıklaması..."
                  rows={4}
                  className="w-full p-3 border-2 border-purple-200 dark:border-purple-900/50 rounded-lg focus:border-purple-600 focus:outline-none dark:bg-slate-700 dark:text-white"
                />
              </div>

              {/* Duration, Price, Category Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Süre (Dakika) *
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-purple-200 dark:border-purple-900/50 rounded-lg focus:border-purple-600 focus:outline-none dark:bg-slate-700 dark:text-white"
                  >
                    <option value="30">30 dk</option>
                    <option value="45">45 dk</option>
                    <option value="60">60 dk</option>
                    <option value="90">90 dk</option>
                    <option value="120">120 dk</option>
                    <option value="150">150 dk</option>
                    <option value="180">180 dk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    Fiyat (£) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full p-3 border-2 border-purple-200 dark:border-purple-900/50 rounded-lg focus:border-purple-600 focus:outline-none dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    Kategori *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-purple-200 dark:border-purple-900/50 rounded-lg focus:border-purple-600 focus:outline-none dark:bg-slate-700 dark:text-white"
                  >
                    <option value="cutting">Kesim</option>
                    <option value="coloring">Boyama</option>
                    <option value="styling">Styling</option>
                    <option value="treatment">Tedavi</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 rounded border-purple-300"
                />
                <label htmlFor="isActive" className="font-semibold cursor-pointer">
                  Aktif (müşteriler tarafından seçilebilir)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-all disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {submitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-semibold transition-all"
                >
                  <X className="w-5 h-5" />
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service._id}
              className={`p-6 rounded-lg border-2 transition-all ${
                service.isActive
                  ? 'bg-white dark:bg-slate-800 border-purple-200 dark:border-purple-900/50'
                  : 'bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-gray-600 opacity-60'
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{service.name}</h3>
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded mt-1 inline-block">
                    {getCategoryLabel(service.category)}
                  </span>
                </div>
                {!service.isActive && (
                  <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded">
                    Deaktif
                  </span>
                )}
              </div>

              {/* Description */}
              {service.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {service.description}
                </p>
              )}

              {/* Details */}
              <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4 mb-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Süre:
                  </span>
                  <span className="font-bold">{service.duration} dk</span>
                </div>
                <div className="flex justify-between border-t border-purple-200 dark:border-purple-800 pt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Fiyat:
                  </span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    £{service.price}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition-all"
                >
                  <Edit className="w-4 h-4" />
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(service._id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Henüz hizmet eklenmemiş
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-all"
            >
              <Plus className="w-5 h-5" />
              İlk Hizmeti Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
