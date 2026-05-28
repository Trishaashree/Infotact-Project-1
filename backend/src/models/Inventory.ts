import { Schema, model } from 'mongoose';
import { IStore, IProduct, IInventoryLedger } from '../interfaces/models.interface';

export const StoreSchema = new Schema<IStore>({
  name: { type: String, required: true },
  locationCode: { type: String, required: true, unique: true, index: true },
  taxRate: { type: Number, required: true, default: 0.0 }
}, { timestamps: true });

export const ProductSchema = new Schema<IProduct>({
  sku: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  variants: [{
    variantId: { type: String, required: true }, // SKU-size-color
    size: String,
    color: String,
    price: { type: Number, required: true }
  }],
  category: { type: String, required: true, index: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

ProductSchema.index({ name: 'text', category: 'text', sku: 'text' });

export const InventoryLedgerSchema = new Schema<IInventoryLedger>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  variantId: { type: String, required: true },
  quantityDelta: { type: Number, required: true }, // Positive for stock-in, negative for sales
  transactionType: { type: String, enum: ['Sale', 'Return', 'Transfer', 'Audit'], required: true },
  referenceId: { type: Schema.Types.ObjectId, required: true } // Points to Order ID or Transfer ID
}, { timestamps: true });

// Compound index to evaluate real-time stock levels efficiently across nodes
InventoryLedgerSchema.index({ storeId: 1, productId: 1, variantId: 1 });

export const StoreModel = model<IStore>('Store', StoreSchema);
export const ProductModel = model<IProduct>('Product', ProductSchema);
export const InventoryLedgerModel = model<IInventoryLedger>('InventoryLedger', InventoryLedgerSchema);