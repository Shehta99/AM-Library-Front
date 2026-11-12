import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import AmLogo from './AmLogo';

export default function Login({ onLoginSuccess }) {
  const [users, setUsers] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');

  // جلب قائمة المستخدمين المسجلين للاختيار من بينهم
  useEffect(() => {
    fetchExistingUsers();
  }, []);

  const fetchExistingUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
      if (res.data.length > 0) {
        setSelectedUsername(res.data[0].username);
      }
    } catch (err) {
      console.error("فشل جلب المستخدمين:", err);
      setError('تعذر الاتصال بالخادم لجلب قائمة المستخدمين. تأكد من تشغيل Backend.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUsername) {
      setError('يرجى اختيار اسم المستخدم');
      return;
    }
    if (!password) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { 
        username: selectedUsername, 
        password: password 
      });
      const userData = response.data;

      // ✅ حفظ الجلسة في sessionStorage لضمان الخروج التلقائي عند إغلاق التبويب
      sessionStorage.setItem('am_user', JSON.stringify(userData));
      
      onLoginSuccess(userData);
    } catch (err) {
      setError(err.response?.data?.message || 'كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans antialiased" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
        {/* رأس الشاشة والشعار */}
        <div className="flex flex-col items-center text-center space-y-3">
          <AmLogo />
          <h2 className="text-xl font-black text-slate-800">تسجيل الدخول للمنظومة</h2>
          <p className="text-xs text-slate-400 font-semibold">اختر الموظف وأدخل كلمة المرور للمتابعة</p>
        </div>

        {/* صندوق رسالة الخطأ */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-2xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        {/* نموذج الدخول */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              اختر الموظف / المستخدم *
            </label>
            {loadingUsers ? (
              <div className="text-xs text-slate-400 p-3 bg-slate-50 rounded-2xl border border-slate-200 animate-pulse text-center font-bold">
                جاري تحميل قائمة الموظفين... ⏳
              </div>
            ) : (
              <select
                value={selectedUsername}
                onChange={(e) => setSelectedUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold text-slate-800 focus:outline-indigo-600 transition-all cursor-pointer"
              >
                {users.map(u => (
                  <option key={u.id} value={u.username}>
                    {u.fullName} ({u.role === 'ADMIN' ? 'مدير عام 👑' : 'كاشير 🛒'}) - @{u.username}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              كلمة المرور *
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold text-slate-800 focus:outline-indigo-600 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || loadingUsers}
            className="w-full py-4 rounded-2xl font-black text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {loading ? 'جاري التحقق...' : 'دخول المنظومة 🔐'}
          </button>
        </form>

        <div className="pt-2 text-center">
          {/* <p className="text-[11px] text-slate-400">
            كلمة المرور الافتراضية للمدير والكاشير: <span className="font-mono font-bold text-slate-600">123456</span>
          </p> */}
        </div>
      </div>
    </div>
  );
}
