'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Giriş başarısız');
      }

      const data = await response.json();
      // Token'ı localStorage'a kaydet
      localStorage.setItem('adminToken', data.token);
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8">
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
              <Lock className="w-7 h-7 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2">Admin Paneli</h1>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Yönetim paneline giriş yapınız
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Kullanıcı Adı</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full p-3 border-2 border-purple-200 dark:border-purple-900/50 rounded-lg focus:border-purple-600 focus:outline-none dark:bg-slate-700 dark:text-white"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 border-2 border-purple-200 dark:border-purple-900/50 rounded-lg focus:border-purple-600 focus:outline-none dark:bg-slate-700 dark:text-white"
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-purple-600 hover:text-purple-700 font-semibold">
              ← Anasayfaya Dön
            </Link>
          </div>
        </div>

        <p className="text-center text-white/80 text-sm mt-6">
          Test Hesabı: admin / admin123
        </p>
      </div>
    </div>
  );
}
