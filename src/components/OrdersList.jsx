import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export default function OrdersList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
        } catch (error) {
            console.error(error);
            alert("❌ تعذر تحميل قائمة الفواتير.");
        } finally {
            setLoading(false);
        }
    };

    const handleReturnOrder = async (orderId) => {
        if (!window.confirm(`هل أنت متأكد من استرجاع الفاتورة رقم #${orderId}؟ سيتم إعادة الكميات للمخزن وخصم القيمة من الأرباح.`)) {
            return;
        }

        try {
            await api.post(`/orders/${orderId}/return`);
            alert("✅ تم استرجاع الفاتورة بنجاح وإعادة البضاعة للمخزن!");
            fetchOrders();
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder(null);
            }
        } catch (error) {
            alert("❌ فشلت عملية الاسترجاع: " + (error.response?.data || error.message));
        }
    };

    const filteredOrders = orders.filter(order =>
        order.id.toString().includes(searchQuery) ||
        (order.cashierName && order.cashierName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return <div className="text-center py-20 text-slate-400 font-bold text-xs">جاري تحميل السجل... ⏳</div>;
    }

    return (
        <div className="space-y-6" dir="rtl">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-lg font-black text-slate-800">📋 سجل الفواتير والمبيعات</h2>
                    <p className="text-xs text-slate-400 mt-0.5">مراجعة الفواتير السابقة، معرفة الكاشير المنفذ، واسترجاع السلع</p>
                </div>

                <div className="relative w-full md:w-80">
                    <input
                        type="text"
                        placeholder="ابحث برقم الفاتورة أو اسم الكاشير..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl py-2.5 pr-10 pl-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                    />
                    <span className="absolute right-3.5 top-3 text-slate-400 text-sm">🔍</span>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold border-b border-slate-100">
                                <th className="p-4">رقم الفاتورة</th>
                                <th className="p-4">التاريخ والوقت</th>
                                <th className="p-4">مسؤول البيع (الكاشير)</th>
                                <th className="p-4">الحالة</th>
                                <th className="p-4">عدد السلع</th>
                                <th className="p-4">المبلغ الإجمالي</th>
                                <th className="p-4 text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                            {filteredOrders.map((order) => {
                                const isReturned = order.status === 'RETURNED';

                                return (
                                    <tr key={order.id} className={`hover:bg-slate-50/50 transition-colors ${isReturned ? 'bg-rose-50/30' : ''}`}>
                                        <td className="p-4 font-bold text-indigo-600 font-mono">#{order.id}</td>
                                        <td className="p-4 text-slate-500">{formatDate(order.orderDate)}</td>
                                        <td className="p-4 font-black text-slate-800">
                                            <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-[11px]">
                                                👤 {order.cashierName || 'كاشير عام'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {isReturned ? (
                                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                                                    مرتجعة ↩️
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                    مكتملة ✅
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 font-bold">
                                            {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} قطع
                                        </td>
                                        <td className={`p-4 font-black ${isReturned ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                            {order.totalAmount?.toFixed(2)} ج.م
                                        </td>
                                        <td className="p-4 text-center flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                                            >
                                                👁️ التفاصيل
                                            </button>

                                            {!isReturned && (
                                                <button
                                                    onClick={() => handleReturnOrder(order.id)}
                                                    className="bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                                                >
                                                    🔄 مرتجع
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* مودال تفاصيل الفاتورة */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-right">
                        <div className="text-center space-y-1">
                            <span className="text-2xl">🧾</span>
                            <h3 className="text-md font-bold text-slate-800">بيانات الفاتورة #{selectedOrder.id}</h3>
                            <p className="text-xs text-slate-400">{formatDate(selectedOrder.orderDate)}</p>
                            <p className="text-xs font-black text-indigo-600">👤 تم الإنشاء بواسطة: {selectedOrder.cashierName || 'كاشير عام'}</p>
                            {selectedOrder.status === 'RETURNED' && (
                                <div className="inline-block bg-rose-100 text-rose-700 text-[10px] font-black px-3 py-0.5 rounded-full mt-1">
                                    تم استرجاع هذه الفاتورة بالكامل
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs space-y-2">
                            <div className="flex justify-between text-slate-400 border-b border-slate-200/60 pb-2 font-bold">
                                <span>الصنف</span>
                                <span>الكمية × السعر</span>
                            </div>
                            {selectedOrder.items?.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-slate-600 font-medium py-1">
                                    <span className="truncate max-w-[170px]">{item.product?.name || "منتج"}</span>
                                    <span>{item.quantity} × {item.unitPrice?.toFixed(2)} ج.م</span>
                                </div>
                            ))}
                            <div className="flex justify-between pt-2 border-t border-slate-200/60 font-black text-indigo-600 text-sm">
                                <span>الإجمالي:</span>
                                <span>{selectedOrder.totalAmount?.toFixed(2)} ج.م</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {selectedOrder.status !== 'RETURNED' && (
                                <button
                                    onClick={() => handleReturnOrder(selectedOrder.id)}
                                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all"
                                >
                                    🔄 تنفيذ مرتجع
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
