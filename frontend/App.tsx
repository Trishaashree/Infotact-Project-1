import React, { useState, useEffect, useRef } from 'react';
import { usePosStore } from '../store/usePosStore';

export const PosTerminal: React.FC = () => {
  const { cart, addToCart, updateQuantity, getCalculatedTotals, clearCart, isOffline } = usePosStore();
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global hotkey integration to refocus the lookup system instantly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSimulatedBarcodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    // Mock mapping layer simulating scanning logic
    const mockScannedProduct = {
      productId: 'prod_67890',
      variantId: `${searchQuery}-M-BLK`,
      name: `Premium Product Variant (${searchQuery})`,
      quantity: 1,
      unitPrice: 49.99
    };
    
    addToCart(mockScannedProduct);
    setSearchQuery('');
  };

  const { subtotal, taxTotal, grandTotal } = getCalculatedTotals();

  const handleCheckoutSubmit = async () => {
    if (isOffline) {
      alert('⚠️ Terminal is currently offline! Cache stores transactions down locally to indexDB ledger logs until hardware synchronization is restored.');
      return;
    }
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
          storeId: '65f1234567890abcdef12345', // Active Context Storage ID
          items: cart,
          paymentMethod: 'Credit',
          totalAmount: grandTotal,
          taxTotal: taxTotal
        })
      });

      if (!response.ok) throw new Error(await response.text());
      
      alert('🎉 Checkout processed successfully! Cloud Nodes Sync Completed.');
      clearCart();
    } catch (err: any) {
      alert('Checkout Failed: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      {/* Header Bar Area */}
      <header className="flex justify-between items-center border-b border-gray-800 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">OmniPOS Terminal</h1>
          <p className="text-xs text-gray-400">Node ID: US-EAST-TERMINAL-01</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isOffline ? 'bg-red-900 text-red-200 animate-pulse' : 'bg-green-900 text-green-200'}`}>
            {isOffline ? 'OFFLINE MODE' : 'CLOUD CONNECTED'}
          </span>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">[F2] Search Hotkey</span>
        </div>
      </header>

      {/* Grid Interface Workspace split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Scan Entry Panel Left */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSimulatedBarcodeSearch} className="bg-gray-800 p-4 rounded-xl shadow-md border border-gray-700">
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">Simulate Barcode / SKU Scan</label>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Scan item or type mock SKU code here..."
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </form>

          {/* Current Running Checkout Session Space */}
          <div className="bg-gray-800 rounded-xl shadow-md border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700 bg-gray-850">
              <h2 className="text-lg font-semibold text-white">Active Order Cart Basket</h2>
            </div>
            {cart.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                Cart is completely empty. Scan item peripherals or execute queries to add inventory.
              </div>
            ) : (
              <div className="divide-y divide-gray-700 overflow-y-auto max-h-96">
                {cart.map((item) => (
                  <div key={item.variantId} className="p-4 flex justify-between items-center hover:bg-gray-750 transition">
                    <div>
                      <h4 className="font-medium text-white">{item.name}</h4>
                      <p className="text-xs font-mono text-gray-400">{item.variantId} @ ${item.unitPrice.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.variantId, parseInt(e.target.value, 10) || 1)}
                        className="w-16 bg-gray-900 border border-gray-600 text-center rounded py-1 text-white"
                      />
                      <span className="font-mono font-semibold text-white min-w-[70px] text-right">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ledger Order Calculation / Settlement Breakdown Panel Right */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700 flex flex-col justify-between h-fit">
          <div>
            <h3 className="text-lg font-semibold border-b border-gray-700 pb-3 mb-4 text-white">Execution Checkout Totals</h3>
            <div className="space-y-3 font-mono">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal Value:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Regional Applied Tax (8%):</span>
                <span>${taxTotal.toFixed(2)}</span>
              </div>
              <hr className="border-gray-700 my-2" />
              <div className="flex justify-between text-xl font-bold text-indigo-400">
                <span>Grand Settlement:</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckoutSubmit}
            disabled={cart.length === 0}
            className={`w-full mt-8 py-4 rounded-xl font-bold tracking-wide uppercase transition shadow-lg ${
              cart.length === 0 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            Finalize Atomic Settlement
          </button>
        </div>
      </div>
    </div>
  );
};
this is dummy 