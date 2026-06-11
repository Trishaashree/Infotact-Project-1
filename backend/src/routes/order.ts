import { Router, Request, Response } from 'express';
import { ProductsTable, InventoryTable, OrdersTable } from '../database';

const router = Router();

router.post('/checkout', (req: Request, res: Response): void => {
  try {
    const { storeLocation, items, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ error: "Cart is empty. Checkout execution aborted." });
      return;
    }

    let calculatedSubtotal = 0;
    const itemsToVerify: any[] = [];

    // PHASE 1: Isolation & Consistency Check (Dry Run verification)
    for (const cartItem of items) {
      const targetProduct = ProductsTable.find(p => p.id === cartItem.productId);
      if (!targetProduct) {
        res.status(404).json({ error: `Product structural mismatch: ID ${cartItem.productId} not found.` });
        return;
      }

      const targetInventory = InventoryTable.find(
        inv => inv.productId === cartItem.productId && inv.storeLocation === storeLocation
      );

      if (!targetInventory || targetInventory.quantity < cartItem.quantity) {
        res.status(400).json({ 
          error: `Stockout Conflict: Insufficient stock for [${targetProduct.name}]. Available: ${targetInventory?.quantity || 0}, Requested: ${cartItem.quantity}` 
        });
        return; // Complete atomic abort. No updates are written to memory rows.
      }

      itemsToVerify.push({
        product: targetProduct,
        inventory: targetInventory,
        quantity: cartItem.quantity
      });
    }

    // PHASE 2: Mutation Execution (Safely mutate records after absolute verification passes)
    const finalizedOrderItems = itemsToVerify.map(record => {
      // Direct variable mutation (Simulating ultra low-latency ACID operations)
      record.inventory.quantity -= record.quantity;

      const itemTotal = record.product.price * record.quantity;
      calculatedSubtotal += itemTotal;

      return {
        productId: record.product.id,
        sku: record.product.sku,
        quantity: record.quantity,
        unitPrice: record.product.price,
        totalPrice: itemTotal
      };
    });

    const standardTaxRate = 0.08; // 8% local transactional tax calculation
    const computedTax = calculatedSubtotal * standardTaxRate;
    const absoluteFinalTotal = calculatedSubtotal + computedTax;

    const confirmedOrder = {
      id: `ord_${Date.now()}`,
      storeLocation,
      items: finalizedOrderItems,
      subtotal: calculatedSubtotal,
      tax: computedTax,
      finalTotal: absoluteFinalTotal,
      paymentMethod: paymentMethod || "Cash",
      createdAt: new Date()
    };

    OrdersTable.push(confirmedOrder);
    res.status(201).json({ 
      message: "Settlement confirmed cleanly inside atomic state pipeline matrices.", 
      order: confirmedOrder 
    });

  } catch (error: any) {
    res.status(500).json({ error: "Internal POS operational transaction tracking fault." });
  }
});

export default router;