import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axiosInstance';
import CopyingCounterModal from './CopyingCounterModal';

export default function CashierRegister() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // 👈 تصنيفات ديناميكية من الـ DB
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastOrder, setLastOrder] = useState(null);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const categoryScrollRef = useRef(null);

  // استرجاع بيانات المستخدم المسجل حالياً من الجلسة
  const currentUser = JSON.parse(sessionStorage.getItem('am_user') || '{}');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchCustomers();
  }, []);

  // ✅ جلب التصنيفات ديناميكياً من قاعدة البيانات
  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      // إضافة خيار "الكل" في بداية القائمة دائماً
      const allCategory = { id: 'ALL', code: 'ALL', name: 'الكل', icon: '✨', bg_style: 'bg-indigo-50 text-indigo-600 border-indigo-100' };
      setCategories([allCategory, ...res.data]);
    } catch (err) {
      console.error("فشل جلب التصنيفات:", err);
      // تصنيفات احتياطية في حال تعثر الاتصال
      setCategories([{ id: 'ALL', code: 'ALL', name: 'الكل', icon: '✨' }]);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // أزرار التمرير لليمين واليسار لشريط التصنيفات
  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stockQuantity && !product.isService) {
        alert("🚨 تجاوزت الكمية المتاحة في المخزن لهذا الصنف!");
        return;
      }
      setCart(cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, delta) => {
    const item = cart.find(i => i.id === id);
    const product = products.find(p => p.id === id);
    if (!item) return;

    if (product && !item.isService && item.quantity + delta > product.stockQuantity) return;
    if (item.quantity + delta <= 0) {
      setCart(cart.filter(i => i.id !== id));
    } else {
      setCart(cart.map(i => i.id === id ? { ...i, quantity: i.quantity + delta } : i));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  const handleCheckout = async (paymentType = 'CASH') => {
    if (cart.length === 0) return;

    const payload = {
      items: cart.map(i => ({ 
        productId: i.isService ? 1 : i.id,
        quantity: i.quantity 
      })),
      paymentType: paymentType,
      customerId: selectedCustomerId ? parseInt(selectedCustomerId) : null,
      userId: currentUser.id || 1,
      cashierName: currentUser.fullName || 'كاشير الفرع'
    };

    try {
      const res = await api.post('/orders', payload);
      const selectedCustomerObj = customers.find(c => c.id === parseInt(selectedCustomerId));

      setLastOrder({
        ...res.data,
        itemsList: [...cart],
        paymentType,
        customerName: selectedCustomerObj ? selectedCustomerObj.name : 'عميل نقدي (كاش)',
        cashierName: currentUser.fullName || 'كاشير الفرع',
        total: calculateTotal()
      });
      setCart([]);
      fetchProducts();
    } catch (err) {
      alert("❌ تعذر حفظ الفاتورة: " + (err.response?.data?.message || err.response?.data || err.message));
    }
  };

  // ✅ الفلترة بالاسم والقسم فقط (بدون أي باركود)
  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'ALL' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" dir="rtl">

      {/* أنماط طباعة ورقة A4 الرسمية */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          body * {
            visibility: hidden;
          }
          #printable-invoice-a4, #printable-invoice-a4 * {
            visibility: visible;
          }
          #printable-invoice-a4 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* القسم الأيمن: المنتجات وشريط التصنيفات */}
      <div className="lg:col-span-8 space-y-5 no-print">
        {/* شريط البحث المباشر بالاسم وزر حاسبة التصوير */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input 
              type="text"
              placeholder="ابحث باسم السلعة أو الكتاب مباشرة..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-800 rounded-2xl py-3.5 pr-11 pl-4 text-xs font-bold focus:outline-indigo-600 shadow-sm"
            />
            <span className="absolute right-4 top-3.5 text-slate-400">🔍</span>
          </div>

          <button 
            onClick={() => setIsCopyModalOpen(true)}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-5 py-3.5 rounded-2xl text-xs font-black shadow-md flex items-center gap-2 whitespace-nowrap active:scale-95 transition-all"
          >
            <span>🖨️</span>
            <span>حاسبة التصوير والطباعة</span>
          </button>
        </div>

        {/* شريط التصنيفات الديناميكية المتصل بقاعدة البيانات */}
        <div className="relative flex items-center gap-2">
          <button 
            onClick={() => scrollCategories('right')}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 shrink-0 transition-all font-bold text-lg"
            title="تمرير لليمين"
          >
            ‹
          </button>

          <div 
            ref={categoryScrollRef}
            className="flex gap-2.5 overflow-x-auto py-2 scroll-smooth scrollbar-none snap-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map(cat => {
              const categoryKey = cat.code || cat.id;
              const isSelected = activeCategory === categoryKey;

              return (
                <button
                  key={cat.id || cat.code}
                  onClick={() => setActiveCategory(categoryKey)}
                  className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border snap-start ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm scale-[1.02]'
                      : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.icon || '📁'}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          <button 
            onClick={() => scrollCategories('left')}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 shrink-0 transition-all font-bold text-lg"
            title="تمرير لليسار"
          >
            ›
          </button>
        </div>

        {/* شبكة عرض السلع */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-bold">جاري تحميل السلع... ⏳</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center text-slate-400 shadow-sm">
            <span className="text-3xl block mb-2">📦</span>
            <p className="text-xs font-bold">لا توجد منتجات مسجلة في هذا القسم حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(p => (
              <div 
                key={p.id}
                onClick={() => p.stockQuantity > 0 && addToCart(p)}
                className={`group bg-white border border-slate-100 hover:border-indigo-200 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md cursor-pointer ${
                  p.stockQuantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
                      {p.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.stockQuantity <= 5 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {p.stockQuantity} متبقي
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{p.name}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{p.description || 'لا يوجد وصف إضافي'}</p>
                </div>

                <div className="pt-3 border-t border-slate-50 flex justify-between items-center mt-4">
                  <span className="text-base font-black text-slate-900">{p.price?.toFixed(2)} <span className="text-xs font-normal">ج.م</span></span>
                  <span className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-600 flex items-center justify-center font-bold text-sm transition-all">
                    +
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* القسم الأيسر: سلة الفاتورة والدفع */}
      <div className="lg:col-span-4 sticky top-28 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 no-print">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧾</span>
            <h3 className="text-sm font-bold text-slate-800">الفاتورة الحالية</h3>
          </div>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="text-xs text-rose-500 font-bold hover:underline">إفراغ السلة</button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs font-bold">
            🛒 السلة فارغة. انقر على المنتجات أو أضف خدمة تصوير للبدء.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {cart.map(item => (
              <div key={item.id} className="bg-slate-50 p-3 rounded-2xl flex justify-between items-center gap-2 border border-slate-100">
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-slate-800 truncate">{item.name}</h5>
                  <span className="text-[11px] text-indigo-600 font-bold">{item.price?.toFixed(2)} ج.م × {item.quantity}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1">
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-5 h-5 rounded-lg bg-slate-50 hover:bg-indigo-600 hover:text-white text-xs font-bold transition-all">+</button>
                  <span className="w-4 text-center text-xs font-black">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-5 h-5 rounded-lg bg-slate-50 hover:bg-rose-600 hover:text-white text-xs font-bold transition-all">-</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* خيار البيع الآجل (شكك) */}
        {customers.length > 0 && (
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">تسجيل الفاتورة باسم عميل (آجل / شكك):</label>
            <select
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-indigo-600 cursor-pointer"
            >
              <option value="">-- عميل نقدي (كاش) --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} (مديونية: {c.balance} ج.م)</option>
              ))}
            </select>
          </div>
        )}

        <div className="border-t border-slate-100 pt-4 space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-slate-400 font-bold">المجموع الإجمالي:</span>
            <span className="text-3xl font-black text-slate-900">{calculateTotal()} <span className="text-xs font-normal">ج.م</span></span>
          </div>

          <div className="flex gap-2">
            <button 
              disabled={cart.length === 0}
              onClick={() => handleCheckout('CASH')}
              className={`flex-1 py-3.5 rounded-2xl font-bold text-xs text-white transition-all shadow-sm ${
                cart.length === 0 ? 'bg-slate-200 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
              }`}
            >
              💵 دفع كاش فوري (A4)
            </button>

            {selectedCustomerId && (
              <button 
                disabled={cart.length === 0}
                onClick={() => handleCheckout('CREDIT')}
                className="py-3.5 px-4 rounded-2xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
              >
                👥 بيع آجل
              </button>
            )}
          </div>
        </div>
      </div>

      {/* نافذة الفاتورة الرسمية بقياس A4 الكامل */}
      {lastOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-3xl w-full shadow-2xl space-y-6 my-auto">

            {/* أزرار التحكم العلوية (مخفية في الطباعة) */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 no-print">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📄</span>
                <span className="text-sm font-black text-slate-800">معاينة الفاتورة قبل الطباعة (مقاس A4)</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
                >
                  <span>🖨️</span>
                  <span>طباعة الفاتورة A4 الآن</span>
                </button>
                <button
                  onClick={() => setLastOrder(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                >
                  إغلاق
                </button>
              </div>
            </div>

            {/* ورقة الفاتورة A4 الرسمية */}
            <div id="printable-invoice-a4" className="bg-white p-4 sm:p-6 text-slate-800 font-sans text-right" dir="rtl">

              {/* ترويسة الفاتورة الرسمية */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-5 mb-6">
                <div>
                  <h1 className="text-3xl font-black text-indigo-700 tracking-tight">AM Library</h1>
                  <p className="text-xs font-bold text-slate-600 mt-1">للأدوات المكتبية والمدرسية وتصوير المستندات</p>
                  <p className="text-xs text-slate-500 mt-0.5">شارع الجامعة الرئيسي، القاهرة | هاتف: 01000000000</p>
                </div>
                <div className="text-left">
                  <span className="inline-block bg-slate-900 text-white text-xs font-black px-3 py-1 rounded-md mb-2">
                    فاتورة مبيعات ضريبية
                  </span>
                  <p className="text-sm font-mono font-bold text-slate-900">رقم: #{lastOrder.id || 'INV-001'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    التاريخ: {new Date(lastOrder.orderDate || Date.now()).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* بيانات العميل والكاشير */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block mb-1">بيانات العميل:</span>
                  <p className="text-sm font-black text-slate-900">{lastOrder.customerName || 'عميل نقدي'}</p>
                  <p className="text-slate-500 mt-0.5">طريقة الدفع: <span className="font-bold text-indigo-700">{lastOrder.paymentType === 'CREDIT' ? 'آجل (حساب شكك)' : 'نقدي (كاش)'}</span></p>
                </div>
                <div className="text-left">
                  <span className="text-slate-400 font-bold block mb-1">مسؤول العملية:</span>
                  <p className="text-sm font-black text-slate-900">{lastOrder.cashierName || 'كاشير الفرع'}</p>
                  <p className="text-slate-500 mt-0.5">حالة الفاتورة: <span className="font-bold text-emerald-600">مكتملة ومسجلة ✅</span></p>
                </div>
              </div>

              {/* جدول الأصناف الرسمي والمنسق لـ A4 */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-12 text-center">م</th>
                      <th className="p-3">وصف الصنف / الخدمة</th>
                      <th className="p-3 w-24 text-center">الكمية</th>
                      <th className="p-3 w-28 text-left">سعر الوحدة</th>
                      <th className="p-3 w-32 text-left">الإجمالي الفرعي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                    {lastOrder.itemsList?.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900">{it.name}</td>
                        <td className="p-3 text-center font-black">{it.quantity}</td>
                        <td className="p-3 text-left font-mono">{it.price?.toFixed(2)} ج.م</td>
                        <td className="p-3 text-left font-black font-mono text-indigo-900">
                          {(it.price * it.quantity).toFixed(2)} ج.م
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* خلاصة الحساب المالي */}
              <div className="flex justify-between items-end border-t border-slate-200 pt-4 mb-8">
                <div className="text-xs text-slate-500 space-y-1">
                  <p className="font-bold text-slate-700">شروط الاسترجاع والاستبدال:</p>
                  <p>• تسترجع البضائع خلال 14 يوماً من تاريخ الفاتورة بالحالة الأصلية.</p>
                  <p>• خدمات التصوير والطباعة لا تخضع للاسترجاع بعد تنفيذها.</p>
                  <p className="font-black text-indigo-600 mt-2">شكراً لتعاملكم مع مكتبة AM Library! ✨</p>
                </div>

                <div className="w-64 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-600">
                    <span>المجموع الفرعي:</span>
                    <span>{lastOrder.total} ج.م</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-600">
                    <span>الضريبة المضافة:</span>
                    <span>0.00 ج.م</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t-2 border-slate-800 text-sm font-black text-slate-900">
                    <span>الإجمالي النهائي:</span>
                    <span className="text-xl text-indigo-700 font-black">{lastOrder.total} ج.م</span>
                  </div>
                </div>
              </div>

              <div className="text-center border-t border-dashed border-slate-200 pt-3 text-[10px] text-slate-400">
                تم استخراج هذه الفاتورة آلياً بواسطة نظام AM Library POS Suite
              </div>

            </div>
          </div>
        </div>
      )}

      {/* نافذة حاسبة التصوير والطباعة */}
      <CopyingCounterModal 
        isOpen={isCopyModalOpen} 
        onClose={() => setIsCopyModalOpen(false)}
        onAddToCart={item => setCart([...cart, item])}
      />
    </div>
  );
}
