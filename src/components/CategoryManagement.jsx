import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const ICON_OPTIONS = ['📚', '📄', '🎁', '✏️', '🖨️', '✂️', '💼', '🎈', '💍', '🧸', '📐', '🎨', '🎮', '💡', '🏷️'];

export default function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        icon: '📚',
        bgStyle: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        displayOrder: 10
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.code) {
            alert("يرجى إدخال اسم وقسم التصنيف!");
            return;
        }

        setSaving(true);
        try {
            await api.post('/categories', formData);
            alert("🎉 تم إضافة القسم الجديد بنجاح!");
            setFormData({
                code: '',
                name: '',
                icon: '📚',
                bgStyle: 'bg-indigo-50 text-indigo-600 border-indigo-100',
                displayOrder: categories.length + 1
            });
            fetchCategories();
        } catch (err) {
            alert("❌ خطأ: " + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`هل أنت متأكد من حذف قسم "${name}"؟`)) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
        } catch (err) {
            alert("تعذر حذف التصنيف.");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" dir="rtl">
            {/* نموذج إضافة قسم جديد */}
            <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 mb-4">
                    ➕ إضافة قسم جديد لشاشة الكاشير
                </h3>

                <form onSubmit={handleCreate} className="space-y-4 text-xs font-bold">
                    <div>
                        <label className="block text-slate-600 mb-1">اسم القسم (بالعربية) *</label>
                        <input
                            type="text"
                            placeholder="مثال: روايات وكتب، أدوات هندسية"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-indigo-600"
                        />
                    </div>

                    <div>
                        <label className="block text-slate-600 mb-1">كود القسم بالإنجليزية (Code) *</label>
                        <input
                            type="text"
                            placeholder="مثال: NOVELS, DRAWING"
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-indigo-600 font-mono"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">يُستخدم لربط السلع بهذا القسم في المخزن.</p>
                    </div>

                    <div>
                        <label className="block text-slate-600 mb-1">اختر أيقونة القسم</label>
                        <div className="flex gap-2 flex-wrap bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            {ICON_OPTIONS.map(ic => (
                                <button
                                    type="button"
                                    key={ic}
                                    onClick={() => setFormData({ ...formData, icon: ic })}
                                    className={`w-9 h-9 text-lg rounded-lg transition-all ${formData.icon === ic ? 'bg-indigo-600 text-white scale-110 shadow-sm' : 'hover:bg-slate-200'
                                        }`}
                                >
                                    {ic}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-3.5 rounded-xl font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/10 active:scale-95 transition-all"
                    >
                        {saving ? 'جاري الإضافة...' : '➕ حفظ القسم وإظهاره فوراً في الكاشير'}
                    </button>
                </form>
            </div>

            {/* قائمة الأقسام الحالية */}
            <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                    <h3 className="text-base font-black text-slate-800">📁 الأقسام والتصنيفات الحالية في الكاشير</h3>
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-bold">
                        {categories.length} أقسام مسجلة
                    </span>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-slate-400 font-bold text-xs">جاري تحميل الأقسام...</div>
                ) : (
                    <div className="space-y-2.5">
                        {categories.map(c => (
                            <div key={c.id} className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl w-10 h-10 rounded-xl bg-white flex items-center justify-center border shadow-xs">
                                        {c.icon}
                                    </span>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-sm">{c.name}</h4>
                                        <span className="text-[10px] text-slate-400 font-mono">الكود: {c.code}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(c.id, c.name)}
                                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all font-bold text-[11px]"
                                >
                                    حذف 🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}