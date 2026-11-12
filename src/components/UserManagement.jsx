import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // استمارة إضافة موظف جديد
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    role: 'CASHIER'
  });
  const [saving, setSaving] = useState(false);

  // استمارة تعديل موظف
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    role: 'CASHIER',
    password: ''
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 1. إضافة موظف جديد
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.fullName || !formData.password) {
      alert('يرجى ملء كافة الحقول!');
      return;
    }

    setSaving(true);
    try {
      await api.post('/auth/register', formData);
      alert('✅ تم إضافة الموظف بنجاح!');
      setFormData({ username: '', fullName: '', password: '', role: 'CASHIER' });
      fetchUsers();
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  // 2. فتح نافذة التعديل
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName,
      role: user.role,
      password: '' // تترك فارغة إلا إذا أراد المدير تغييرها
    });
  };

  // 3. حفظ تعديل بيانات الموظف
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.put(`/auth/users/${editingUser.id}`, editForm);
      alert('✅ تم تحديث بيانات الموظف بنجاح!');
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  // 4. حذف موظف
  const handleDeleteUser = async (user) => {
    if (user.username === 'admin') {
      alert('⛔ تنبيه: لا يمكن حذف حساب المدير الرئيسي للنظام!');
      return;
    }

    if (!window.confirm(`هل أنت متأكد من مسح حساب الموظف "${user.fullName}" (@${user.username}) نهائياً؟`)) {
      return;
    }

    try {
      const res = await api.delete(`/auth/users/${user.id}`);
      alert(res.data?.message || '✅ تم مسح حساب الموظف بنجاح!');
      fetchUsers();
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" dir="rtl">
      {/* القسم الأيمن: استمارة إضافة موظف جديد */}
      <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
          <span>➕</span>
          <span>إضافة موظف / كاشير جديد</span>
        </h3>

        <form onSubmit={handleCreateUser} className="space-y-4 text-xs font-bold text-slate-700">
          <div>
            <label className="block text-slate-600 mb-1">الاسم بالكامل *</label>
            <input
              type="text"
              placeholder="مثال: أحمد عبد الله"
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-indigo-600"
              required
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1">اسم المستخدم للدخول (Username) *</label>
            <input
              type="text"
              placeholder="مثال: ahmed_pos"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-indigo-600 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1">كلمة المرور *</label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-indigo-600"
              required
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1">صلاحية النظام *</label>
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-indigo-600 cursor-pointer"
            >
              <option value="CASHIER">كاشير 🛒 (شاشة الكاشير والمبيعات فقط)</option>
              <option value="ADMIN">مدير عام 👑 (كامل الصلاحيات والتقارير والمخازن)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-xl font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/10 active:scale-95 transition-all"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ الموظف في النظام'}
          </button>
        </form>
      </div>

      {/* القسم الأيسر: قائمة الموظفين مع أزرار التعديل والحذف */}
      <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
            <span>👥</span>
            <span>قائمة الموظفين والمستخدمين المسجلين</span>
          </h3>
          <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-xl">
            {users.length} مستخدمين
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400 font-bold text-xs">جاري تحميل بيانات الموظفين... ⏳</div>
        ) : (
          <div className="space-y-3">
            {users.map(u => (
              <div 
                key={u.id} 
                className="flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-2xl bg-slate-50 border border-slate-100 gap-3 hover:border-slate-200 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-slate-900 text-sm">{u.fullName}</h4>
                    <span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                      u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {u.role === 'ADMIN' ? 'مدير 👑' : 'كاشير 🛒'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono mt-0.5 block">اسم الدخول: @{u.username}</span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {/* زر التعديل */}
                  <button
                    onClick={() => openEditModal(u)}
                    className="bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border border-indigo-100 flex items-center gap-1"
                  >
                    <span>✏️</span>
                    <span>تعديل</span>
                  </button>

                  {/* زر الحذف */}
                  {u.username !== 'admin' && (
                    <button
                      onClick={() => handleDeleteUser(u)}
                      className="bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border border-rose-100 flex items-center gap-1"
                    >
                      <span>🗑️</span>
                      <span>مسح</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* نافذة تعديل بيانات الموظف (Modal) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">✏️</span>
                <h3 className="text-sm font-black text-slate-800">
                  تعديل بيانات: {editingUser.fullName} (@{editingUser.username})
                </h3>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs font-bold text-slate-700">
              <div>
                <label className="block text-slate-600 mb-1">الاسم بالكامل *</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">الصلاحية *</label>
                <select
                  value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                  disabled={editingUser.username === 'admin'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-indigo-600"
                >
                  <option value="CASHIER">كاشير 🛒 (شاشة الكاشير والمبيعات فقط)</option>
                  <option value="ADMIN">مدير عام 👑 (كامل الصلاحيات والتقارير والمخازن)</option>
                </select>
                {editingUser.username === 'admin' && (
                  <p className="text-[10px] text-slate-400 mt-1">لا يمكن تغيير صلاحية الحساب الرئيسي للنظام.</p>
                )}
              </div>

              <div>
                <label className="block text-slate-600 mb-1">
                  كلمة المرور الجديدة (اتركها فارغة إذا لم ترد تغييرها):
                </label>
                <input
                  type="password"
                  placeholder="أدخل كلمة مرور جديدة أو اتركها فارغة"
                  value={editForm.password}
                  onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-indigo-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-black transition-all shadow-sm"
                >
                  {updating ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}