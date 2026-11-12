import React, { useState, useEffect } from 'react';

export default function CopyingCounterModal({ isOpen, onClose, onAddToCart }) {
    const [pagesCount, setPagesCount] = useState(1);
    const [copiesCount, setCopiesCount] = useState(1);
    const [isColor, setIsColor] = useState(false);
    const [isDoubleSided, setIsDoubleSided] = useState(false);
    const [customPricePerPage, setCustomPricePerPage] = useState('1.50'); // 👈 سعر الورقة القابل للتعديل اليدوي
    const [paperProduct, setPaperProduct] = useState(null);

    // تحديث السعر الافتراضي عند تغيير خيارات الطباعة (ألوان / وجهين) مع إمكانية تعديله
    useEffect(() => {
        let base = isColor ? 5.00 : 1.50;
        if (isDoubleSided) base = base * 1.5;
        setCustomPricePerPage(base.toFixed(2));
    }, [isColor, isDoubleSided]);

    if (!isOpen) return null;

    const totalSheets = pagesCount * copiesCount;
    const unitPrice = parseFloat(customPricePerPage) || 0;
    const totalPrice = (totalSheets * unitPrice).toFixed(2);

    const handleAdd = () => {
        if (totalSheets <= 0 || unitPrice <= 0) {
            alert("يرجى إدخال عدد أوراق وسعر صحيح!");
            return;
        }

        const serviceItem = {
            id: Date.now(), // معرف مؤقت للواجهة
            name: `خدمة تصوير (${totalSheets} ورقة - ${isColor ? 'ألوان' : 'أبيض وأسود'}${isDoubleSided ? ' - وجهين' : ''})`,
            category: 'COPYING',
            price: unitPrice,
            quantity: totalSheets,
            isService: true
        };

        onAddToCart(serviceItem);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" dir="rtl">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🖨️</span>
                        <div>
                            <h3 className="text-base font-black text-slate-800">حاسبة تصوير وطباعة المستندات</h3>
                            <p className="text-[11px] text-slate-400">تحديد عدد الأوراق وسعر الورقة بحرية</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
                </div>

                <div className="space-y-4 text-xs font-bold text-slate-700">
                    {/* عدد الصفحات وعدد النسخ */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-slate-600 mb-1">عدد صفحات المستند:</label>
                            <input
                                type="number"
                                min="1"
                                value={pagesCount}
                                onChange={e => setPagesCount(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-indigo-600"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-600 mb-1">عدد النسخ المطلوبة:</label>
                            <input
                                type="number"
                                min="1"
                                value={copiesCount}
                                onChange={e => setCopiesCount(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-indigo-600"
                            />
                        </div>
                    </div>

                    {/* نوع الطباعة والوجه */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-slate-600 mb-1">نوع الطباعة:</label>
                            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setIsColor(false)}
                                    className={`flex-1 py-1.5 rounded-lg transition-all ${!isColor ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                                >
                                    أسود / أبيض
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsColor(true)}
                                    className={`flex-1 py-1.5 rounded-lg transition-all ${isColor ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                                >
                                    ألوان 🎨
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-600 mb-1">نوع الورقة:</label>
                            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setIsDoubleSided(false)}
                                    className={`flex-1 py-1.5 rounded-lg transition-all ${!isDoubleSided ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                                >
                                    وجه واحد
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsDoubleSided(true)}
                                    className={`flex-1 py-1.5 rounded-lg transition-all ${isDoubleSided ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                                >
                                    وجهين
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 👈 تحديد سعر الورقة بحرية من قبل الكاشير */}
                    <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3.5 space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-indigo-900 font-extrabold text-xs">سعر الورقة (ج.م):</label>
                            <span className="text-[10px] text-indigo-600 font-semibold">يمكنك تعديله يدوياً لأي رقم</span>
                        </div>
                        <input
                            type="number"
                            step="0.25"
                            min="0.10"
                            value={customPricePerPage}
                            onChange={e => setCustomPricePerPage(e.target.value)}
                            className="w-full bg-white border border-indigo-200 text-indigo-900 font-black text-sm rounded-xl p-2.5 focus:outline-indigo-600 shadow-sm"
                            placeholder="مثلاً: 1.50 أو 2.00"
                        />
                    </div>

                    {/* ملخص الحساب */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                        <div className="flex justify-between text-slate-500 text-xs">
                            <span>إجمالي عدد الأوراق:</span>
                            <span className="font-bold text-slate-800">{totalSheets} ورقة</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-xs">
                            <span>سعر الورقة المحتسب:</span>
                            <span className="font-bold text-slate-800">{unitPrice.toFixed(2)} ج.م</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-sm">
                            <span className="font-black text-slate-800">الإجمالي المستحق:</span>
                            <span className="text-xl font-black text-indigo-600">{totalPrice} <span className="text-xs">ج.م</span></span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl transition-all shadow-md shadow-indigo-600/20 text-xs"
                    >
                        📥 إدراج خدمة التصوير في الفاتورة
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-bold text-xs"
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
}