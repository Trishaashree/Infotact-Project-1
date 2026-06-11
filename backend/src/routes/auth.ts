import { Router, Request, Response } from 'express';
import { UsersTable } from '../database';

const router = Router();

router.post('/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;

  // Simple, direct credential matching logic (No external database query needed)
  const user = UsersTable.find(u => u.email === email.trim().toLowerCase());

  // Using a simple demo password rule for clean verification
  if (!user || password !== "password123") {
    res.status(401).json({ error: "Invalid email credentials or incorrect password." });
    return;
  }

  // Generate a mock stateless token token structure for client-side storage tracking
  const sessionToken = `mock-jwt-token-for-${user.id}-${Date.now()}`;

  res.json({
    message: "Authorization granted.",
    token: sessionToken,
    user: { name: user.name, role: user.role, email: user.email }
  });
});

export default router;