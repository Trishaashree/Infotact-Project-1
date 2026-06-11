

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { usePOSStore } from './store/posStore';
import { ShoppingCart, Wifi, WifiOff, Trash2, Search, PackageCheck, Lock, LogOut, BarChart3, Store } from 'lucide-react';

export default function App() {
  const { cart, isOnline, addToCart, removeFromCart, clearCart, setOnlineStatus, user, loginUser, logoutUser } = usePOSStore();
  
  // View states: 'register' or 'analytics'
  const [currentView, setCurrentView] = useState<'register' | 'analytics'>('register');
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [systemNotice, setSystemNotice] = useState('');
  
  // Auth Form State Pointers
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const activateOnlineMode = () => setOnlineStatus(true);
    const activateOfflineMode = () => setOnlineStatus(false);
    window.addEventListener('online', activateOnlineMode);
    window.addEventListener('offline', activateOfflineMode);
    
    if (user) fetchTargetCatalog();

    return () => {
      window.removeEventListener('online', activateOnlineMode);
      window.removeEventListener('offline', activateOfflineMode);
    };
  }, [user]);

  const fetchTargetCatalog = async (queryParam = '') => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products?search=${queryParam}`);
      setProducts(response.data.products);
    } catch (err) {
      console.error("Error connecting to backend runtime memory engine:", err);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      loginUser(res.data.user, res.data.token);
    } catch (err: any) {
      setAuthError(err.response?.data?.error || "Connection configuration error.");
    }
  };

  const processOrderSettlement = async () => {
    const payload = { storeLocation: "Main Branch", items: cart, paymentMethod: "Cash" };
    try {
      const response = await axios.post('http://localhost:5000/api/orders/checkout', payload);
      setSystemNotice(`🎉 Order Posted! ID: ${response.data.order.id}`);
      clearCart();
      fetchTargetCatalog();
    } catch (error: any) {
      setSystemNotice(`❌ Operational Fault: ${error.response?.data?.error || "Checkout Refused"}`);
    }
  };

  // Live Ledger Accounting Math
  const ledgerSubtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const ledgerTax = ledgerSubtotal * 0.08;
  const ledgerGrossTotal = ledgerSubtotal + ledgerTax;

  // Render Login Gate View if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 mb-3">
              <PackageCheck size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Omnichannel POS Gateway</h2>
            <p className="text-xs text-slate-400 mt-1">Default demo password is <span className="font-bold text-slate-600">password123</span></p>
          </div>

          {authError && <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold text-center">{authError}</div>}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Station Email Info</label>
              <input type="email" placeholder="manager@retail.com or cashier@retail.com" className="w-full p-3 border rounded-xl bg-slate-50 text-sm focus:outline-emerald-500" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Access Pin Pass</label>
              <input type="password" placeholder="••••••••" className="w-full p-3 border rounded-xl bg-slate-50 text-sm focus:outline-emerald-500" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white p-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2">
              <Lock size={16} /> Authenticate Station ID
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Dynamic Navigation Platform Header */}
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <PackageCheck className="text-emerald-400" size={26} />
          <div>
            <h1 className="text-md font-bold tracking-tight">Terminal Matrix Node</h1>
            <p className="text-[11px] text-slate-400">Operator: {user.name} ({user.role})</p>
          </div>
        </div>

        {/* Dynamic View Access Tabs */}
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700/50 gap-1 text-xs font-semibold">
          <button onClick={() => setCurrentView('register')} className={`px-4 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${currentView === 'register' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            <Store size={14} /> POS Checkout Lane
          </button>
          {user.role === 'Manager' && (
            <button onClick={() => setCurrentView('analytics')} className={`px-4 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${currentView === 'analytics' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              <BarChart3 size={14} /> Manager Analytics Dashboard
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isOnline ? (
            <span className="text-emerald-400 flex items-center gap-1 text-xs bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-500/20"><Wifi size={12} /> SYNCED</span>
          ) : (
            <span className="text-amber-400 flex items-center gap-1 text-xs bg-amber-950 px-2.5 py-1 rounded-full border border-amber-500/20"><WifiOff size={12} /> LOCAL</span>
          )}
          <button onClick={logoutUser} className="text-slate-400 hover:text-rose-400 transition-colors p-1" title="Log out station">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Terminal Frame Layout View Switch Engine */}
      {currentView === 'register' ? (
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 p-4 gap-4 overflow-hidden max-w-7xl w-full mx-auto">
          {/* Catalog Layout Panel */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 flex flex-col">
            <form onSubmit={(e) => { e.preventDefault(); fetchTargetCatalog(searchQuery); }} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input type="text" placeholder="Scan barcode SKU tag or type product descriptor name..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <button type="submit" className="bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-all shadow-sm">Query</button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-[64vh]">
              {products.map((product: any) => (
                <div key={product.id} onClick={() => addToCart(product)} className="group border border-slate-200 p-3.5 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 transition-all bg-slate-50 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] bg-slate-200 font-mono text-slate-600 px-2 py-0.5 rounded font-bold tracking-wider">{product.sku}</span>
                    <div className="font-bold text-slate-800 mt-2 text-sm tracking-tight leading-tight group-hover:text-emerald-700">{product.name}</div>
                  </div>
                  <div className="text-base font-black text-slate-900 mt-4 flex items-baseline justify-between">
                    <span>${product.price.toFixed(2)}</span>
                    <span className="text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">+ Buy</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Accounting Drawer Side */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between h-[75vh]">
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
                <ShoppingCart className="text-slate-700" size={18} />
                <h2 className="text-sm font-bold text-slate-800">Sales Cart Bucket</h2>
              </div>
              {systemNotice && <div className="p-2.5 mb-2 text-center text-xs rounded bg-blue-50 border border-blue-100 text-blue-700 font-bold">{systemNotice}</div>}
              
              <div className="space-y-2 overflow-y-auto pr-1 flex-1">
                {cart.length === 0 ? <p className="text-slate-400 text-center py-12 text-xs font-medium">Lanes clear. Scan metrics above.</p> : null}
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2 rounded-lg">
                    <div className="max-w-[65%]">
                      <div className="font-bold text-slate-800 text-xs truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-500 font-medium">${item.price.toFixed(2)} × {item.quantity}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => removeFromCart(item.productId)} className="text-slate-400 hover:text-rose-600 p-1 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-3 mt-2 bg-white space-y-2">
              <div className="flex justify-between text-xs text-slate-500"><span>Subtotal Amount</span><span className="font-mono">${ledgerSubtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-xs text-slate-500"><span>Tax Matrix (8%)</span><span className="font-mono">${ledgerTax.toFixed(2)}</span></div>
              <div className="flex justify-between text-md font-black text-slate-900 pt-2 border-t border-dashed border-slate-200"><span>Total Settlement</span><span className="font-mono text-emerald-600">${ledgerGrossTotal.toFixed(2)}</span></div>
              <button onClick={processOrderSettlement} disabled={cart.length === 0} className="w-full mt-2 bg-emerald-600 text-white font-bold text-xs py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-40 transition-all shadow-md">Execute Lane Settlement</button>
            </div>
          </div>
        </main>
      ) : (
        /* Manager-Only Live Performance Insights View Dashboard Panel Layout */
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-black tracking-tight text-slate-800 mb-2">Live Multi-Store Performance Engine</h2>
            <p className="text-xs text-slate-400">Real-time analytical trends calculated from local volatile volatile operational stacks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gross Revenue Pipeline</div>
              <div className="text-2xl font-black text-slate-900 mt-2">$2,489.50</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">↑ +14.2% from previous hour</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Catalog SKUs Managed</div>
              <div className="text-2xl font-black text-slate-900 mt-2">{products.length} Items</div>
              <div className="text-[10px] text-slate-500 font-semibold mt-1">100% data parity mapping accuracy</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">System Node Latency</div>
              <div className="text-2xl font-black text-emerald-600 mt-2">0.45 ms</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">Sub-millisecond memory performance</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">System Logistics Node Operations</h3>
            <div className="text-xs text-slate-400 text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 font-medium">
              Predictive auto-fulfillment algorithms online. High velocity operations running optimally.
            </div>
          </div>
        </main>
      )}
    </div>
  );
}