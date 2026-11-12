import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export default function AnalyticsDashboard() {
    const [topSellers, setTopSellers] = useState([]);
    const [hourly, setHourly] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const [resTop, resHour] = await Promise.all([
                api.get('/analytics/top-sellers'),
                api.get('/analytics/hourly')
            ]);
            setTopSellers(resTop.data);
            setHourly(resHour.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const maxHourlyRevenue = Math.max(...hourly.map(h => parseFloat(h.totalAmount || 0)), 100);

    if (loading) return <div className="text-center py-20 text-slate-400 font-bold text-xs">جاري تجهيز الرسوم البيانية... ⏳</div>;

    return (
        <div className="space-y-8" dir="rtl">
            {/* هيدر التحليلات */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-black text-slate-800">📈 مؤشرات الأداء والرسوم البيانية البصرية</h2>
                    <p className="text-xs text-slate-400 mt-0.5">تحليل الأصناف الأكثر طلباً ومخطط أوقات ذروة المبيعات</p>
                </div>
                <button onClick={fetchAnalytics} className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
                    🔄 تحديث فوري
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* رسم الأصناف الأكثر مبيعاً */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <span className="text-xl">🏆</span>
                        <h3 className="text-sm font-black text-slate-800">السلع الأكثر مبيعاً (Top 6 Sellers)</h3>
                    </div>

                    <div className="space-y-4">
                        {topSellers.map((item, idx) => {
                            const maxQty = topSellers[0]?.quantity || 1;
                            const percent = Math.round((item.quantity / maxQty) * 100);

                            return (
                                <div key={idx} className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-bold text-slate-700">
                                        <span>{item.name}</span>
                                        <span className="text-indigo-600">{item.quantity} مبيعة ({item.totalRevenue} ج.م)</span>
                                    </div>
                                    {/* شريط بياني نسبي ناعم */}
                                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* مخطط ساعات الذروة اليومية */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <span className="text-xl">⏰</span>
                        <h3 className="text-sm font-black text-slate-800">أوقات الذروة والمبيعات بالساعات اليوم</h3>
                    </div>

                    {/* الرسم البياني بالأعمدة */}
                    <div className="flex items-end justify-between h-56 pt-8 px-2 gap-2 border-b border-slate-100">
                        {hourly.filter(h => h.hour >= 9 && h.hour <= 22).map((h, i) => {
                            const heightPercent = Math.round((parseFloat(h.totalAmount) / maxHourlyRevenue) * 100);

                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                                    {/* تلميح عند التمرير */}
                                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[9px] px-2 py-1 rounded-lg transition-all pointer-events-none whitespace-nowrap z-10">
                                        {h.totalAmount} ج.م ({h.ordersCount} طلب)
                                    </div>

                                    <div
                                        className="w-full bg-indigo-100 group-hover:bg-indigo-600 rounded-t-lg transition-all"
                                        style={{ height: `${Math.max(8, heightPercent)}%` }}
                                    />
                                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-800 font-bold">
                                        {h.hour}:00
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-[11px] text-slate-400 text-center">يمثل كل عمود حجم الإيرادات في تلك الساعة لمساعدتك في تنظيم أوقات العمل والورديات.</p>
                </div>
            </div>
        </div>
    );
}