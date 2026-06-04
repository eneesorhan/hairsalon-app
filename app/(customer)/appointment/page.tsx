'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';

interface Service {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}

export default function AppointmentPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<
    Array<{ startTime: string; endTime: string; isAvailable: boolean }>
  >([]);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successId, setSuccessId] = useState('');

  // Hizmetleri yükle
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        const data = await response.json();
        setServices(data);
      } catch (err) {
        setError('Hizmetler yüklenemedi');
      }
    };

    fetchServices();
  }, []);

  // Tarih seçildiğinde mevcut saatleri yükle
  useEffect(() => {
    if (selectedDate && selectedService) {
      const service = services.find((s) => s._id === selectedService);
      if (service) {
        fetchAvailableSlots(selectedDate, service.duration);
      }
    }
  }, [selectedDate, selectedService, services]);

  const fetchAvailableSlots = async (date: string, duration: number) => {
    try {
      const response = await fetch(
        `/api/timeslots?date=${date}&duration=${duration}`
      );
      const data = await response.json();
      setAvailableSlots(data);
    } catch (err) {
      setError('Saatler yüklenemedi');
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setSelectedDate('');
    setSelectedTime('');
    setStep(2);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          serviceId: selectedService,
          date: selectedDate,
          startTime: selectedTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Randevu oluşturulamadı');
      }

      const data = await response.json();
      setSuccessId(data._id);
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const service = services.find((s) => s._id === selectedService);
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="sticky top-0 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-purple-200/20 dark:border-purple-900/20 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700">
            <ArrowLeft className="w-5 h-5" />
            Geri Dön
          </Link>
          <h1 className="text-2xl font-bold">Randevu Al</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= s
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    step > s ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div>
            <h2 className="text-3xl font-bold mb-8">Hizmet Seçin</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((svc) => (
                <button
                  key={svc._id}
                  onClick={() => handleServiceSelect(svc._id)}
                  className="p-6 text-left border-2 border-purple-200 dark:border-purple-900/50 rounded-lg hover:border-purple-600 hover:shadow-lg transition-all hover:bg-purple-50 dark:hover:bg-purple-900/20 group"
                >
                  <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600">
                    {svc.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    {svc.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      ⏱ {svc.duration} dakika
                    </span>
                    <span className="text-2xl font-bold text-purple-600">
                      £{svc.price}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date and Time Selection */}
        {step === 2 && service && (
          <div>
            <button
              onClick={() => setStep(1)}
              className="mb-6 inline-flex items-center gap-2 text-purple-600 hover:text-purple-700"
            >
              ← Hizmet Seçimine Dön
            </button>

            <h2 className="text-3xl font-bold mb-4">
              Tarih ve Saat Seçin - {service.name}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Date Picker */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-bold mb-3">Tarih</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateSelect(e.target.value)}
                  min={minDate.toISOString().split('T')[0]}
                  max={maxDate.toISOString().split('T')[0]}
                  className="w-full p-3 border-2 border-purple-200 dark:border-purple-900/50 rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="lg:col-span-2">
                  <label className="block text-sm font-bold mb-3">Mevcut Saatler</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot) => (
                        <button
                          key={slot.startTime}
                          onClick={() => handleTimeSelect(slot.startTime)}
                          disabled={!slot.isAvailable}
                          className={`p-3 rounded-lg font-semibold transition-all ${
                            slot.isAvailable
                              ? selectedTime === slot.startTime
                                ? 'bg-purple-600 text-white'
                                : 'bg-white dark:bg-slate-800 border-2 border-purple-200 dark:border-purple-900/50 hover:border-purple-600 hover:shadow-md'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {slot.startTime}
                        </button>
                      ))
                    ) : (
                      <p className="col-span-full text-gray-600 dark:text-gray-300 py-4">
                        Bu tarihte mevcut saat yok
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedTime && (
              <button
                onClick={() => setStep(3)}
                className="mt-8 w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all"
              >
                Devam Et →
              </button>
            )}
          </div>
        )}

        {/* Step 3: Customer Information */}
        {step === 3 && service && (
          <form onSubmit={handleSubmit}>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="mb-6 inline-flex items-center gap-2 text-purple-600 hover:text-purple-700"
            >
              ← Saat Seçimine Dön
            </button>

            <h2 className="text-3xl font-bold mb-4">Bilgilerinizi Girin</h2>

            <div className="bg-white dark:bg-slate-800 rounded-lg border border-purple-200/50 dark:border-purple-900/50 p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Hizmet:</span>
                  <p className="font-bold">{service.name}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Fiyat:</span>
                  <p className="font-bold text-purple-600">£{service.price}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Tarih:</span>
                  <p className="font-bold">{selectedDate}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Saat:</span>
                  <p className="font-bold">{selectedTime}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-2">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleFormChange}
                  required
                  className="w-full p-3 border-2 border-purple-200 dark:border-purple-900/50 rounded-lg focus:border-purple-600 focus:outline-none dark:bg-slate-700"
                  placeholder="Adınız"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  E-Posta *
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleFormChange}
                  required
                  className="w-full p-3 border-2 border-purple-200 dark:border-purple-900/50 rounded-lg focus:border-purple-600 focus:outline-none dark:bg-slate-700"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleFormChange}
                  required
                  className="w-full p-3 border-2 border-purple-200 dark:border-purple-900/50 rounded-lg focus:border-purple-600 focus:outline-none dark:bg-slate-700"
                  placeholder="+44 20 XXXX XXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Notlar (İsteğe Bağlı)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  className="w-full p-3 border-2 border-purple-200 dark:border-purple-900/50 rounded-lg focus:border-purple-600 focus:outline-none dark:bg-slate-700"
                  placeholder="Saç hakkında özel istekleriniz..."
                  rows={4}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Randevu Oluşturuluyor...' : 'Randevu Oluştur'}
            </button>
          </form>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="text-center py-12">
            <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Randevu Onaylandı!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              Randevunuz başarıyla oluşturulmuştur. Onay e-postası e-posta adresinize gönderilmiştir.
            </p>

            <div className="bg-white dark:bg-slate-800 rounded-lg border border-purple-200/50 dark:border-purple-900/50 p-6 mb-8 max-w-md mx-auto text-left">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Randevu ID:</strong> {successId}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Hizmet:</strong> {service?.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Tarih:</strong> {selectedDate}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Saat:</strong> {selectedTime}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all inline-block"
              >
                Anasayfaya Dön
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
