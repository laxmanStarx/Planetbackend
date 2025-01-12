"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Add item to cart
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, menuId, quantity } = req.body;
    if (!userId || !menuId || !quantity) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    try {
        // Check if an active order exists for the user
        let order = yield prisma.order.findFirst({
            where: {
                userId,
                status: "Pending",
            },
        });
        // If no active order, create a new one
        if (!order) {
            order = yield prisma.order.create({
                data: {
                    userId,
                    totalPrice: 0,
                },
            });
        }
        // Check if the menu item is already in the order
        const existingOrderItem = yield prisma.orderItem.findFirst({
            where: {
                orderId: order.id,
                menuId,
            },
        });
        if (existingOrderItem) {
            // Update quantity if item already exists
            yield prisma.orderItem.update({
                where: { id: existingOrderItem.id },
                data: { quantity: existingOrderItem.quantity + quantity },
            });
        }
        else {
            // Add new menu item to the order
            yield prisma.orderItem.create({
                data: {
                    orderId: order.id,
                    menuId,
                    quantity,
                },
            });
        }
        // Recalculate total price
        const orderItems = yield prisma.orderItem.findMany({
            where: { orderId: order.id },
            include: { menu: true },
        });
        const totalPrice = orderItems.reduce((sum, item) => sum + item.menu.price * item.quantity, 0);
        yield prisma.order.update({
            where: { id: order.id },
            data: { totalPrice },
        });
        res.status(200).json({ message: "Item added to cart successfully" });
    }
    catch (error) {
        console.error("Error adding item to cart:", error);
        res.status(500).json({ error: "Failed to add item to cart" });
    }
}));
// Get cart items for a user
router.get("/cart", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const order = yield prisma.order.findFirst({
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
    }
    catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ error: "Failed to fetch cart" });
    }
}));
// Checkout: Mark order as completed
router.post("/checkout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.body;
    try {
        const order = yield prisma.order.update({
            where: { id: orderId },
            data: { status: "Completed" },
        });
        res.status(200).json({ message: "Order completed successfully", order });
    }
    catch (error) {
        console.error("Error completing order:", error);
        res.status(500).json({ error: "Failed to complete order" });
    }
}));
exports.default = router;
