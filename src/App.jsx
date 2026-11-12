import React, { useState, useEffect } from 'react';
import CashierRegister from './components/CashierRegister';
import AdminDashboard from './components/AdminDashboard';
import DailyReport from './components/DailyReport';
import OrdersList from './components/OrdersList';
import InventoryAudit from './components/InventoryAudit';
import DebtBook from './components/DebtBook';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import UserManagement from './components/UserManagement';
import CategoryManagement from './components/CategoryManagement';
import AmLogo from './components/AmLogo';
import Login from './components/Login';
import api from './api/axiosInstance';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('CASHIER');
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. التحقق الحصري من sessionStorage ومسح أي بقايا لـ localStorage القديم
  useEffect(() => {
    // تنظيف أي بيانات قديمة في localStorage لضمان عدم الدخول التلقائي
    localStorage.removeItem('am_user');

    const saved = sessionStorage.getItem('am_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {
        sessionStorage.removeItem('am_user');
      }
    }

    // إجبار المتصفح على مسح الجلسة بمجرد إغلاق الصفحة أو التبويب
    const handleClose = () => {
      sessionStorage.removeItem('am_user');
    };
    window.addEventListener('beforeunload', handleClose);
    return () => window.removeEventListener('beforeunload', handleClose);
  }, []);

  // 2. فحص النواقص تلقائياً كل 15 ثانية للجميع
  useEffect(() => {
    fetchLowStock();
    const interval = setInterval(fetchLowStock, 15000);
    return () => clearInterval(interval);
  }, [currentTab]);

  const fetchLowStock = async () => {
    try {
      const response = await api.get('/products/low-stock');
      setLowStockProducts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('am_user');
    localStorage.removeItem('am_user');
    setCurrentUser(null);
    setCurrentTab('CASHIER');
    setIsMobileMenuOpen(false);
  };

  // إذا لم يكن مسجل دخول، تظهر شاشة الدخول دائماً
  if (!currentUser) {
    return (
      <Login
        onLoginSuccess={(user) => {
          sessionStorage.setItem('am_user', JSON.stringify(user));
          setCurrentUser(user);
        }}
      />
    );
  }

  const isAdmin = currentUser.role === 'ADMIN';

  // التبويبات حسب الصلاحية
  const availableTabs = isAdmin ? [
    { id: 'CASHIER', name: '🛒 الكاشير' },
    { id: 'AUDIT', name: '📦 جرد وتعديل المخزن' },
    { id: 'ADMIN', name: '📥 إضافة صنف' },
    { id: 'CATEGORIES', name: '🏷️ إدارة الأقسام' },
    { id: 'DEBT', name: '👥 دفتر الديون' },
    { id: 'REPORT', name: '📊 الأرباح' },
    { id: 'ANALYTICS', name: '📈 الرسوم البيانية' },
    { id: 'ORDERS_LIST', name: '📋 الفواتير' },
    { id: 'USERS', name: '👤 إدارة الموظفين' },
  ] : [
    { id: 'CASHIER', name: '🛒 شاشة الكاشير والمبيعات' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased" dir="rtl">
      {/* شريط التنقل العلوي المتجاوب بالكامل */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-20">
            {/* الشعار واسم النظام */}
            <div className="flex items-center gap-3">
              <AmLogo />
            </div>

            {/* الأزرار في الشاشات الكبيرة (Desktop) */}
            <div className="hidden lg:flex items-center gap-3">
              {/* زر جرس النواقص */}
              <button
                onClick={() => setShowLowStockModal(true)}
                className={`relative p-2.5 rounded-2xl border transition-all ${lowStockProducts.length > 0
                  ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                title="تنبيهات نواقص المخزن"
              >
                <span className="text-base">🔔</span>
                {lowStockProducts.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow-md">
                    {lowStockProducts.length}
                  </span>
                )}
              </button>

              {/* أزرار التبويبات */}
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/40">
                {availableTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${currentTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>

              {/* معلومات المستخدم وتسجيل الخروج */}
              <div className="flex items-center gap-2 border-r border-slate-200 pr-3 mr-1">
                <div className="text-left">
                  <p className="text-xs font-black text-slate-800 leading-none">{currentUser.fullName}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${isAdmin ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {isAdmin ? 'مدير عام 👑' : 'كاشير 🛒'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-xs font-bold transition-all"
                  title="تسجيل الخروج"
                >
                  🚪 خروج
                </button>
              </div>
            </div>

            {/* أدوات الموبايل والتابلت (Mobile Header Actions) */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setShowLowStockModal(true)}
                className="relative p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600"
              >
                <span>🔔</span>
                {lowStockProducts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {lowStockProducts.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 font-bold transition-all"
                title="القائمة"
              >
                {isMobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </div>

        {/* القائمة المنسدلة الذكية للموبايل والتابلت (Mobile Drawer) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white/95 backdrop-blur-lg px-4 py-4 space-y-3 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <p className="text-xs font-black text-slate-800">{currentUser.fullName}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isAdmin ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {isAdmin ? 'مدير عام 👑' : 'كاشير 🛒'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold"
              >
                🚪 خروج
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {availableTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setCurrentTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-3 rounded-2xl text-right text-xs font-bold transition-all border ${currentTab === tab.id
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                    : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* المحتوى الفعلي للشاشات */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {currentTab === 'CASHIER' && <CashierRegister />}
        {isAdmin && currentTab === 'AUDIT' && <InventoryAudit />}
        {isAdmin && currentTab === 'ADMIN' && <AdminDashboard />}
        {isAdmin && currentTab === 'CATEGORIES' && <CategoryManagement />}
        {isAdmin && currentTab === 'DEBT' && <DebtBook />}
        {isAdmin && currentTab === 'REPORT' && <DailyReport />}
        {isAdmin && currentTab === 'ANALYTICS' && <AnalyticsDashboard />}
        {isAdmin && currentTab === 'ORDERS_LIST' && <OrdersList />}
        {isAdmin && currentTab === 'USERS' && <UserManagement />}
      </main>

      {/* نافذة تنبيه النواقص التفاعلية */}
      {showLowStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <h3 className="text-sm font-black text-slate-800">تنبيه: سلع قاربت على النفاد بالمخزن</h3>
              </div>
              <span className="text-xs font-bold bg-amber-50 text-amber-600 px-2.5 py-1 rounded-xl">
                {lowStockProducts.length} أصناف
              </span>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                المخزون بحالة ممتازة، لا توجد أصناف ناقصة حالياً! ✨
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3 rounded-2xl bg-amber-50/40 border border-amber-100">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{p.name}</h4>
                      <span className="text-[10px] text-slate-400">الباركود: {p.barcode || 'عام'}</span>
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-black text-rose-500">
                        {p.stockQuantity === 0 ? 'نافذ تماماً (0)' : `متبقي ${p.stockQuantity} فقط`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowLowStockModal(false)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
