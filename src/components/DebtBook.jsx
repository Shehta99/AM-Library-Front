import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export default function DebtBook() {
    const [customers, setCustomers] = useState([]);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', balance: '', notes: '' });

    // حالة نافذة المعاملات المالية (سداد أو زيادة دين)
    const [modalCustomer, setModalCustomer] = useState(null);
    const [actionType, setActionType] = useState('PAYMENT'); // 'PAYMENT' أو 'DEBT_INCREASE'
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await api.get('/customers');
            setCustomers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        if (!newCustomer.name) return alert("يرجى إدخال اسم العميل");

        try {
            await api.post('/customers', {
                ...newCustomer,
                balance: parseFloat(newCustomer.balance) || 0.00
            });
            alert("✅ تم تسجيل العميل بنجاح!");
            setNewCustomer({ name: '', phone: '', balance: '', notes: '' });
            fetchCustomers();
        } catch (err) {
            alert("فشل الحفظ: " + err.message);
        }
    };

    // ✅ تنفيذ المعاملة المالية (سداد دفعة أو زيادة دين على الشخص)
    const handleDebtAdjustment = async () => {
        if (!amount || parseFloat(amount) <= 0) return alert("أدخل مبلغاً صحيحاً أكبر من الصفر");

        try {
            await api.post(`/customers/${modalCustomer.id}/debt-adjust`, {
                amount: parseFloat(amount),
                type: actionType,
                notes: notes || (actionType === 'DEBT_INCREASE' ? "إضافة دين جديد" : "سداد نقدي")
            });
            alert(actionType === 'DEBT_INCREASE' ? "✅ تمت إضافة المبلغ إلى مديونية العميل بنجاح!" : "🎉 تم تسجيل سداد الدفعة بنجاح!");
            setModalCustomer(null);
            setAmount('');
            setNotes('');
            fetchCustomers();
        } catch (err) {
            alert("فشلت العملية: " + (err.response?.data?.message || err.message));
        }
    };

    const totalOutstanding = customers.reduce((sum, c) => sum + parseFloat(c.balance || 0), 0).toFixed(2);

    return (
        <div className="space-y-6" dir="rtl">
            <div className="bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-3xl p-6 shadow-lg flex justify-between items-center">
                <div>
                    <span className="text-xs font-bold opacity-90">إجمالي المديونيات المستحقة للمكتبة (الآجل بالخارج) 👥</span>
                    <div className="text-3xl font-black mt-2">{totalOutstanding} <span className="text-xs font-normal">ج.م</span></div>
                </div>
                <span className="text-4xl opacity-80">📖</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-base font-black text-slate-800">قائمة حسابات العملاء والديون</h3>
                        <p className="text-xs text-slate-400 mt-0.5">زيادة مديونية العميل أو تسجيل دفعات السداد في أي وقت</p>
                    </div>

                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold border-b border-slate-100">
                                <th className="p-4">اسم العميل</th>
                                <th className="p-4">الهاتف</th>
                                <th className="p-4">المبلغ المستحق</th>
                                <th className="p-4 text-center">إجراء المعاملات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                            {customers.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50/50">
                                    <td className="p-4 font-bold text-slate-800">{c.name}</td>
                                    <td className="p-4 text-slate-400 font-mono">{c.phone || '---'}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-xl font-black text-xs ${c.balance > 0 ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                            }`}>
                                            {parseFloat(c.balance).toFixed(2)} ج.م
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => { setModalCustomer(c); setActionType('PAYMENT'); }}
                                                className="bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all border border-emerald-200"
                                            >
                                                💵 سداد دفعة
                                            </button>
                                            <button
                                                onClick={() => { setModalCustomer(c); setActionType('DEBT_INCREASE'); }}
                                                className="bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all border border-rose-200"
                                            >
                                                ➕ زيادة دين
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3">➕ فتح حساب عميل جديد</h3>
                    <form onSubmit={handleAddCustomer} className="space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">اسم العميل أو الجهة *</label>
                            <input
                                type="text"
                                placeholder="مثال: أستاذ أحمد (مدرس فيزياء)"
                                value={newCustomer.name}
                                onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-indigo-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">رقم الهاتف</label>
                            <input
                                type="text"
                                placeholder="010xxxxxxxx"
                                value={newCustomer.phone}
                                onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-indigo-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">رصيد افتتاحي سابق (إن وجد)</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={newCustomer.balance}
                                onChange={e => setNewCustomer({ ...newCustomer, balance: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-indigo-600"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md shadow-indigo-600/10"
                        >
                            حفظ العميل في الدفتر
                        </button>
                    </form>
                </div>
            </div>

            {/* مودال العمليات المالية المشترك (سداد / زيادة دين) */}
            {modalCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
                        <h3 className="text-sm font-black text-slate-800">
                            {actionType === 'DEBT_INCREASE' ? `➕ زيادة دين على: ${modalCustomer.name}` : `💵 سداد دفعة للعميل: ${modalCustomer.name}`}
                        </h3>
                        <p className="text-xs text-slate-400">الرصيد الحالي: {modalCustomer.balance} ج.م</p>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                {actionType === 'DEBT_INCREASE' ? "مبلغ الدين المضاف (ج.م) *" : "المبلغ المسدد (ج.م) *"}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-black focus:outline-none ${actionType === 'DEBT_INCREASE' ? 'text-rose-600 focus:ring-2 focus:ring-rose-500' : 'text-emerald-600 focus:ring-2 focus:ring-emerald-500'
                                    }`}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">ملاحظة / السبب</label>
                            <input
                                type="text"
                                placeholder={actionType === 'DEBT_INCREASE' ? "مثال: تصوير ورق خارجي، سحب أدوات مكتبية" : "كاش / تحويل بنكي / فودافون كاش"}
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-indigo-600"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleDebtAdjustment}
                                className={`flex-1 text-white py-2.5 rounded-xl text-xs font-bold transition-all ${actionType === 'DEBT_INCREASE' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                                    }`}
                            >
                                تأكيد العملية
                            </button>
                            <button
                                onClick={() => setModalCustomer(null)}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl text-xs font-bold transition-all"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}