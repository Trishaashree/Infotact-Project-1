import { create } from 'zustand';

interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface PosState {
  cart: CartItem[];
  taxRate: number; // e.g., 0.08 for 8%
  isOffline: boolean;
  addToCart: (item: CartItem) => void;
  updateQuantity: (variantId: string, qty: number) => void;
  clearCart: () => void;
  setOfflineStatus: (status: boolean) => void;
  setTaxRate: (rate: number) => void;
  getCalculatedTotals: () => { subtotal: number; taxTotal: number; grandTotal: number };
}

export const usePosStore = create<PosState>((set, get) => ({
  cart: [],
  taxRate: 0.08, // Dynamic state defaulting to 8% regional configuration
  isOffline: !navigator.onLine,

  addToCart: (item) => set((state) => {
    const existingIndex = state.cart.findIndex((i) => i.variantId === item.variantId);
    if (existingIndex > -1) {
      const updatedCart = [...state.cart];
      updatedCart[existingIndex].quantity += 1;
      return { cart: updatedCart };
    }
    return { cart: [...state.cart, item] };
  }),

  updateQuantity: (variantId, qty) => set((state) => ({
    cart: state.cart.map((item) => item.variantId === variantId ? { ...item, quantity: Math.max(1, qty) } : item)
  })),

  clearCart: () => set({ cart: [] }),
  setOfflineStatus: (status) => set({ isOffline: status }),
  setTaxRate: (rate) => set({ taxRate: rate }),

  getCalculatedTotals: () => {
    const { cart, taxRate } = get();
    const subtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    const taxTotal = subtotal * taxRate;
    const grandTotal = subtotal + taxTotal;
    return { subtotal, taxTotal, grandTotal };
  }
}));

// Auto-wire physical network listeners to handle connectivity states gracefully
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => usePosStore.getState().setOfflineStatus(false));
  window.addEventListener('offline', () => usePosStore.getState().setOfflineStatus(true));
}