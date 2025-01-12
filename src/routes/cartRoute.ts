import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Add item to cart
router.post("/", async (req:any, res:any) => {
  const { userId, menuId, quantity } = req.body;

  if (!userId || !menuId || !quantity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Check if an active order exists for the user
    let order = await prisma.order.findFirst({
      where: {
        userId,
        status: "Pending",
      },
    });

    // If no active order, create a new one
    if (!order) {
      order = await prisma.order.create({
        data: {
          userId,
          totalPrice: 0,
        },
      });
    }

    // Check if the menu item is already in the order
    const existingOrderItem = await prisma.orderItem.findFirst({
      where: {
        orderId: order.id,
        menuId,
      },
    });

    if (existingOrderItem) {
      // Update quantity if item already exists
      await prisma.orderItem.update({
        where: { id: existingOrderItem.id },
        data: { quantity: existingOrderItem.quantity + quantity },
      });
    } else {
      // Add new menu item to the order
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          menuId,
          quantity,
        },
      });
    }

    // Recalculate total price
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
      include: { menu: true },
    });

    const totalPrice = orderItems.reduce(
      (sum, item) => sum + item.menu.price * item.quantity,
      0
    );

    await prisma.order.update({
      where: { id: order.id },
      data: { totalPrice },
    });

    res.status(200).json({ message: "Item added to cart successfully" });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
});

// Get cart items for a user
router.get("/cart", async (req:any, res:any) => {
  const { userId } = req.params;

  try {
    const order = await prisma.order.findFirst({
      where: { userId, status: "Pending" },
      include: {
        orderItems: {
          include: {
            menu: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Cart not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// Checkout: Mark order as completed
router.post("/checkout", async (req, res) => {
  const { orderId } = req.body;

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: "Completed" },
    });

    res.status(200).json({ message: "Order completed successfully", order });
  } catch (error) {
    console.error("Error completing order:", error);
    res.status(500).json({ error: "Failed to complete order" });
  }
});

export default router;
