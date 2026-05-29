import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { OrderModel } from '../models/Order';
import { InventoryLedgerModel, ProductModel } from '../models/Inventory';

export const processCheckout = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { storeId, items, paymentMethod, totalAmount, taxTotal } = req.body;
    const cashierId = req.user?.id;

    // 1. Create Order Blueprint within transaction scope
    const newOrder = new OrderModel({
      storeId,
      cashierId,
      items,
      totalAmount,
      taxTotal,
      paymentMethod
    });

    await newOrder.save({ session });

    for (const item of items) {
      // 2. Perform Real-time aggregate ledger math check for absolute isolation levels
      const aggregateResult = await InventoryLedgerModel.aggregate([
        { $match: { storeId: new mongoose.Types.ObjectId(storeId), variantId: item.variantId } },
        { $group: { _id: '$variantId', totalStock: { $sum: '$quantityDelta' } } }
      ]).session(session);

      const currentStock = aggregateResult.length > 0 ? aggregateResult[0].totalStock : 0;

      if (currentStock < item.quantity) {
        throw new Error(`Transaction Aborted: Insufficient stock for variant ID ${item.variantId}. Available: ${currentStock}`);
      }

      // 3. Atomically decrement stock by executing a negative tracking configuration delta ledger
      const ledgerEntry = new InventoryLedgerModel({
        productId: item.productId,
        storeId,
        variantId: item.variantId,
        quantityDelta: -item.quantity,
        transactionType: 'Sale',
        referenceId: newOrder._id
      });

      await ledgerEntry.save({ session });
    }

    // Commit changes across the document spaces safely
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, orderId: newOrder._id });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(409).json({ error: error.message });
  }
};