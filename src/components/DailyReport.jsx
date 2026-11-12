import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export default function DailyReport() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport(selectedDate);
    }, [selectedDate]);

    const fetchReport = async (date) => {
        setLoading(true);
        try {
            const response = await api.get(`/reports/daily?date=${date}`);
            setReport(response.data);
        } catch (err) {
            console.error(err);
            alert("تعذر جلب التقرير المالي لليوم المحدد.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* رأس الصفحة وتحديد التاريخ */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-lg font-black text-slate-800">📊 تقرير الأرباح والمبيعات اليومي</h2>
                    <p className="text-xs text-slate-400 mt-0.5">متابعة دقيقة لحركة الإيرادات وتكلفة البضاعة وصافي الدخل</p>
                </div>

                <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-600">اختر التاريخ:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-400 text-xs font-bold">جاري احتساب العمليات المالية... ⏳</div>
            ) : report ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* إجمالي المبيعات */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                        <span className="text-xs font-bold text-slate-400">إجمالي المبيعات (الدخل)</span>
                        <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-900">{report.totalRevenue}</span>
                            <span className="text-xs text-slate-400">ج.م</span>
                        </div>
                        <div className="mt-3 text-[11px] text-slate-400">من إجمالي {report.totalOrders} فاتورة</div>
                    </div>

                    {/* إجمالي التكلفة */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                        <span className="text-xs font-bold text-slate-400">تكلفة البضاعة المباعة</span>
                        <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-2xl font-black text-rose-500">{report.totalCost}</span>
                            <span className="text-xs text-slate-400">ج.م</span>
                        </div>
                        <div className="mt-3 text-[11px] text-slate-400">سعر شراء البضائع الخارجة</div>
                    </div>

                    {/* صافي الأرباح */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                        <span className="text-xs font-bold text-slate-400">صافي الربح الفعلي</span>
                        <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-2xl font-black text-emerald-600">{report.netProfit}</span>
                            <span className="text-xs text-slate-400">ج.م</span>
                        </div>
                        <div className="mt-3 text-[11px] text-emerald-600 font-bold">
                            هامش الربح: {report.profitMargin?.toFixed(1)}%
                        </div>
                    </div>

                    {/* عدد العمليات */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                        <span className="text-xs font-bold text-slate-400">حركة المبيعات</span>
                        <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-2xl font-black text-indigo-600">{report.totalOrders}</span>
                            <span className="text-xs text-slate-400">طلب</span>
                        </div>
                        <div className="mt-3 text-[11px] text-slate-400">متوسط الفاتورة: {report.totalOrders > 0 ? (report.totalRevenue / report.totalOrders).toFixed(1) : 0} ج.م</div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
