import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export default function AdminDashboard() {
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        costPrice: '',
        price: '',
        stockQuantity: '',
        barcode: ''
    });
    const [saving, setSaving] = useState(false);

    // جلب التصنيفات المسجلة في قاعدة البيانات عند فتح الشاشة
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
            if (res.data.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    category: prev.category || res.data[0].code
                }));
            }
        } catch (err) {
            console.error("فشل جلب الأقسام:", err);
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price || !formData.costPrice || !formData.stockQuantity || !formData.category) {
            alert("🚨 يرجى ملء الحقول الإلزامية (اسم السلعة، القسم، سعر الشراء، سعر البيع، والكمية)!");
            return;
        }

        if (parseFloat(formData.price) < parseFloat(formData.costPrice)) {
            if (!confirm("⚠️ تنبيه: سعر البيع أقل من سعر التكلفة! هل تريد المتابعة بالخسارة؟")) return;
        }

        setSaving(true);
        try {
            await api.post('/products', formData);
            alert("✅ تم حفظ الصنف بنجاح وإدراجه تحت القسم المحدد!");
            setFormData({
                name: '',
                category: categories.length > 0 ? categories[0].code : '',
                description: '',
                costPrice: '',
                price: '',
                stockQuantity: '',
                barcode: ''
            });
        } catch (err) {
            alert("❌ حدث خطأ أثناء الحفظ: " + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const expectedProfit = (formData.price && formData.costPrice)
        ? (parseFloat(formData.price) - parseFloat(formData.costPrice)).toFixed(2)
        : '0.00';

    const selectedCatObj = categories.find(c => c.code === formData.category);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" dir="rtl">
            {/* استمارة إدخال المنتج */}
            <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                    <div>
                        <h2 className="text-lg font-black text-slate-800">📦 إضافة صنف جديد للمخزون</h2>
                        <p className="text-xs text-slate-400 mt-1">سجل تفاصيل السلعة وأسعار الشراء والبيع لحساب الأرباح</p>
                    </div>
                    <button
                        type="button"
                        onClick={fetchCategories}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-xl font-bold transition-all"
                        title="تحديث قائمة الأقسام في حال تم إضافة قسم جديد"
                    >
                        🔄 تحديث الأقسام
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">اسم السلعة *</label>
                            <input
                                type="text"
                                placeholder="مثال: كشكول سلك ديزني"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">القسم / التصنيف *</label>
                            {loadingCategories ? (
                                <div className="text-xs text-slate-400 p-3 bg-slate-50 rounded-xl">جاري تحميل الأقسام...</div>
                            ) : (
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:outline-none"
                                >
                                    {categories.map(c => (
                                        <option key={c.id || c.code} value={c.code}>
                                            {c.icon} {c.name} ({c.code})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">الوصف والتفاصيل</label>
                        <textarea
                            placeholder="المواصفات، اللون، الحجم..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:outline-none h-20 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-rose-600 mb-1.5">سعر التكلفة *</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.costPrice}
                                onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                                className="w-full bg-rose-50/50 border border-rose-200 text-slate-800 rounded-xl p-3 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:outline-none font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-emerald-600 mb-1.5">سعر البيع *</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                className="w-full bg-emerald-50/50 border border-emerald-200 text-slate-800 rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">الكمية *</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={formData.stockQuantity}
                                onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">الباركود</label>
                            <input
                                type="text"
                                placeholder="اختياري"
                                value={formData.barcode}
                                onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:outline-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-md shadow-indigo-600/10 text-xs tracking-wider"
                    >
                        {saving ? 'جاري الحفظ...' : '➕ حفظ الصنف وتأكيده في قاعدة البيانات'}
                    </button>
                </form>
            </div>

            {/* بطاقة المعاينة الحية */}
            <div className="lg:col-span-5 sticky top-28 space-y-4">
                <div className="text-xs font-bold text-slate-400">معاينة بطاقة المنتج قبل الإرسال:</div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500">
                            {formData.barcode || 'الباركود'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                            {formData.stockQuantity || '0'} متوفر
                        </span>
                    </div>

                    <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600">
                            {selectedCatObj ? `${selectedCatObj.icon} ${selectedCatObj.name}` : formData.category}
                        </span>
                        <h3 className="font-bold text-slate-800 text-base mt-2">
                            {formData.name || 'اسم السلعة يظهر هنا'}
                        </h3>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100 text-xs">
                        <div className="flex justify-between text-slate-500">
                            <span>سعر التكلفة:</span>
                            <span className="font-bold text-rose-500">{formData.costPrice || '0.00'} ج.م</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>سعر البيع:</span>
                            <span className="font-bold text-slate-800">{formData.price || '0.00'} ج.م</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-200/60 font-black text-emerald-600 text-sm">
                            <span>صافي الربح للقطعة:</span>
                            <span>+{expectedProfit} ج.م</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}