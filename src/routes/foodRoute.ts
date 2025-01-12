import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Fetch all menu items
router.get("/", async (req, res) => {
  try {
    const menus = await prisma.menu.findMany();
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

// Fetch a single menu item by ID
router.get("/:id", async (req:any, res:any) => {
  const { id } = req.params;
  try {
    const menu = await prisma.menu.findUnique({ where: { id } });
    if (!menu) return res.status(404).json({ error: "Menu item not found" });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch menu item" });
  }
});














export default router;
