import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export default function InventoryAudit() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // حالة نافذة التعديل
    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        category: '',
        price: '',
        costPrice: '',
        stockQuantity: '',
        barcode: '',
        description: ''
    });
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories')
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error(err);
            alert("❌ تعذر تحميل بيانات المخزن");
        } finally {
            setLoading(false);
        }
    };

    // فتح نافذة التعديل وتعبئة البيانات
    const openEditModal = (p) => {
        setEditingProduct(p);
        setEditForm({
            name: p.name,
            category: p.category,
            price: p.price,
            costPrice: p.costPrice,
            stockQuantity: p.stockQuantity,
            barcode: p.barcode || '',
            description: p.description || ''
        });
    };

    // إرسال التعديل للـ API
    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            await api.put(`/products/${editingProduct.id}`, editForm);
            alert("✅ تم تعديل بيانات الصنف بنجاح!");
            setEditingProduct(null);
            fetchData(); // تحديث الجدول فوراً
        } catch (err) {
            alert("❌ فشل التعديل: " + (err.response?.data?.message || err.message));
        } finally {
            setUpdating(false);
        }
    };

    // ✅ دالة حذف الصنف مع التأكيد
    const handleDeleteProduct = async (p) => {
        const confirmMessage = `هل أنت متأكد من مسح صنف "${p.name}" نهائياً من النظام؟\n\nتنبيه: لا يمكن التراجع عن هذه الخطوة!`;
        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            const res = await api.delete(`/products/${p.id}`);
            alert(res.data?.message || "✅ تم مسح الصنف بنجاح!");
            fetchData(); // تحديث الجدول فوراً
        } catch (err) {
            alert("❌ " + (err.response?.data?.message || "تعذر مسح الصنف!"));
        }
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode && p.barcode.includes(search))
    );

    return (
        <div className="space-y-6" dir="rtl">
            {/* رأس الصفحة والبحث */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-lg font-black text-slate-800">📦 جرد وتعديل أصناف المخزن</h2>
                    <p className="text-xs text-slate-400 mt-0.5">متابعة الأرصدة، تحديث الأسعار، وحذف السلع غير المطلوبة</p>
                </div>

                <div className="relative w-full md:w-80">
                    <input
                        type="text"
                        placeholder="ابحث بالاسم أو الباركود..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl py-2.5 pr-10 pl-4 text-xs font-bold focus:outline-indigo-600"
                    />
                    <span className="absolute right-3.5 top-2.5 text-slate-400">🔍</span>
                </div>
            </div>

            {/* جدول السلع */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="text-center py-16 text-slate-400 font-bold text-xs">جاري تحميل قائمة الجرد...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 font-bold text-xs">لا توجد سلع مسجلة</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                    <th className="p-4">الباركود</th>
                                    <th className="p-4">اسم الصنف</th>
                                    <th className="p-4">القسم</th>
                                    <th className="p-4">سعر التكلفة</th>
                                    <th className="p-4">سعر البيع</th>
                                    <th className="p-4">الرصيد المتاح</th>
                                    <th className="p-4 text-center">التحكم</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                                {filtered.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="p-4 font-mono text-slate-400">{p.barcode || '---'}</td>
                                        <td className="p-4 font-bold text-slate-900">{p.name}</td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                {p.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-rose-600 font-bold">{p.costPrice?.toFixed(2)} ج.م</td>
                                        <td className="p-4 font-black text-slate-900">{p.price?.toFixed(2)} ج.م</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${p.stockQuantity <= 5 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                {p.stockQuantity} قطعة
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* زر التعديل */}
                                                <button
                                                    onClick={() => openEditModal(p)}
                                                    className="bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border border-indigo-100"
                                                >
                                                    ✏️ تعديل
                                                </button>

                                                {/* زر الحذف */}
                                                <button
                                                    onClick={() => handleDeleteProduct(p)}
                                                    className="bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border border-rose-100"
                                                >
                                                    🗑️ حذف
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* نافذة تعديل بيانات الصنف (Modal) */}
            {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-black text-slate-800">✏️ تعديل بيانات السلعة #{editingProduct.id}</h3>
                            <button
                                onClick={() => setEditingProduct(null)}
                                className="text-slate-400 hover:text-slate-600 text-base font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-bold text-slate-600 mb-1">اسم الصنف *</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-indigo-600"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-600 mb-1">القسم / التصنيف *</label>
                                    <select
                                        value={editForm.category}
                                        onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-indigo-600"
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.code}>{c.icon} {c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-600 mb-1">الباركود</label>
                                    <input
                                        type="text"
                                        value={editForm.barcode}
                                        onChange={e => setEditForm({ ...editForm, barcode: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-indigo-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-bold text-rose-600 mb-1">سعر التكلفة *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editForm.costPrice}
                                        onChange={e => setEditForm({ ...editForm, costPrice: e.target.value })}
                                        className="w-full bg-rose-50/50 border border-rose-200 text-rose-700 rounded-xl p-2.5 font-bold focus:outline-rose-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-emerald-600 mb-1">سعر البيع *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editForm.price}
                                        onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                        className="w-full bg-emerald-50/50 border border-emerald-200 text-emerald-700 rounded-xl p-2.5 font-bold focus:outline-emerald-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-600 mb-1">كمية المخزن *</label>
                                    <input
                                        type="number"
                                        value={editForm.stockQuantity}
                                        onChange={e => setEditForm({ ...editForm, stockQuantity: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-indigo-600"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-600 mb-1">الوصف</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 h-16 resize-none focus:outline-indigo-600"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all shadow-sm"
                                >
                                    {updating ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingProduct(null)}
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
