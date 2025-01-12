import { Router, Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();




router.get("/restaurants", async (req, res) => {
    try {
      const restaurants = await prisma.restaurant.findMany({
        include: { menuItems: true }, // Include menu items if needed
      });
      res.status(200).json(restaurants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch restaurants" });
    }
  });






  router.get("/menu/:restaurantId", async (req, res) => {
    const { restaurantId } = req.params;
    try {
      const menuItems = await prisma.menu.findMany({
        where: { restaurantId },
      });
      res.status(200).json(menuItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch menu items" });
    }
  });

  export default router

  