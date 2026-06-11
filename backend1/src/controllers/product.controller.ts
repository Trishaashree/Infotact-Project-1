import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ProductModel } from '../models/Inventory';
import { redisClient } from '../config/redis';

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = '10', nextCursor, search } = req.query;
    const parsedLimit = parseInt(limit as string, 10);
    
    // Serve from cache if searching for first page without text queries
    if (!nextCursor && !search) {
      const cachedData = await redisClient.get('catalog:page_1');
      if (cachedData) {
        res.status(200).json(JSON.parse(cachedData));
        return;
      }
    }

    let query: any = {};
    if (nextCursor) {
      query._id = { $gt: nextCursor };
    }
    if (search) {
      query.$text = { $search: search as string };
    }

    const products = await ProductModel.find(query)
      .sort({ _id: 1 })
      .limit(parsedLimit + 1);

    const hasNextPage = products.length > parsedLimit;
    if (hasNextPage) products.pop();
    const cursor = hasNextPage ? products[products.length - 1]._id : null;

    const responsePayload = { products, nextCursor: cursor };

    if (!nextCursor && !search) {
      await redisClient.setEx('catalog:page_1', 300, JSON.stringify(responsePayload)); // Cache for 5 mins
    }

    res.status(200).json(responsePayload);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const newProduct = new ProductModel(req.body);
    await newProduct.save();
    await redisClient.del('catalog:page_1'); // Invalidate stale cache window
    res.status(201).json(newProduct);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};