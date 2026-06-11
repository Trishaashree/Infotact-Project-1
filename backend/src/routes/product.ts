import { Router, Request, Response } from 'express';
import { ProductsTable } from '../database';

const router = Router();

// GET Catalog with Simulated Full-Text Search
router.get('/', (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string || '').trim().toLowerCase();

    if (!search) {
      res.json({ products: ProductsTable, source: 'in-memory-ram' });
      return;
    }

    // Fallback filter engine matching against text names and numerical SKUs
    const filtered = ProductsTable.filter(p => 
      p.name.toLowerCase().includes(search) || 
      p.sku.includes(search)
    );

    res.json({ products: filtered, source: 'in-memory-search' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST Create dynamic inventory item updates
router.post('/', (req: Request, res: Response) => {
  try {
    const { sku, name, price } = req.body;
    if (!sku || !name || !price) {
      res.status(400).json({ error: "Missing required fields: sku, name, price" });
      return;
    }

    const newProduct = {
      id: `prod_${Date.now()}`,
      sku,
      name,
      price: Number(price)
    };

    ProductsTable.push(newProduct);
    res.status(201).json(newProduct);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;