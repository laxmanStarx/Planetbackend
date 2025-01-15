"use strict";
// import express from "express";
// import Stripe from "stripe";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY! );
// router.post("/create-checkout-session", async (req, res) => {
//   const { items } = req.body;
//   try {
//     const session = await stripe.checkout.sessions.create({
//         payment_method_types: ["card"],
//         line_items: [
//           {
//             price_data: {
//               currency: "usd",
//               product_data: {
//                 name: "Your Food Order",
//               },
//               unit_amount: 5000, // 50 USD in cents
//             },
//             quantity: 1,
//           },
//         ],
//         mode: "payment",
//         success_url: "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
//         cancel_url: "http://localhost:5173/cancel",
//         // metadata: {
//         //   userId: userId, // Include userId
//         //   orderId: orderId, // Include orderId
//         // },
//       });
//     res.json({ url: session.url });
//   } catch (error) {
//     console.error("Error creating checkout session", error);
//     res.status(500).send("Internal Server Error");
//   }
// });
// export default router;
const express_1 = __importDefault(require("express"));
const stripe_1 = __importDefault(require("stripe"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const createOrderAndPaymentSession = (userId, orderItems) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId || !orderItems.length) {
        throw new Error("User ID and order items are required.");
    }
    // Calculate total price
    const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    // Create Order and OrderItems in the database
    const order = yield prisma.order.create({
        data: {
            userId,
            totalPrice,
            status: "Pending", // Set the initial order status
            orderItems: {
                create: orderItems.map((item) => ({
                    menuId: item.menuId, // Make sure menuId exists in the data
                    quantity: item.quantity, // Ensure quantity is a valid number
                })),
            },
        },
        include: { orderItems: true },
    });
    return order; // Return the order object to use later (like creating a Stripe session)
});
// Create Checkout Session
router.post("/create-checkout-session", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, items } = req.body;
    if (!userId || !items || !items.length) {
        return res.status(400).json({ error: "User ID and items are required." });
    }
    try {
        // First, create the order in the database
        const order = yield createOrderAndPaymentSession(userId, items);
        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        // Create Stripe checkout session
        const session = yield stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: items.map((item) => ({
                price_data: {
                    currency: "usd",
                    product_data: { name: item.name },
                    unit_amount: item.price * 100, // Convert to cents
                },
                quantity: item.quantity,
            })),
            mode: "payment",
            success_url: "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url: "http://localhost:5173/cancel",
            client_reference_id: userId, // Reference userId
            metadata: { userId: userId, orderId: order.id }, // Add userId and orderId as metadata
        });
        res.json({ url: session.url, orderId: order.id });
    }
    catch (error) {
        console.error("Error creating checkout session", error);
        res.status(500).send("Internal Server Error");
    }
}));
router.post("/confirm-payment", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { sessionId } = req.body;
    if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required." });
    }
    try {
        // Retrieve session details from Stripe
        const session = yield stripe.checkout.sessions.retrieve(sessionId);
        const { client_reference_id, payment_intent, metadata, amount_total, currency } = session;
        if (!client_reference_id || !payment_intent) {
            return res.status(400).json({ error: "Invalid session details." });
        }
        // Safely handle metadata, providing a fallback if it's null
        const userId = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.userId) !== null && _a !== void 0 ? _a : "Unknown User"; // Fallback if metadata is null
        // Save payment details in the database
        const payment = yield prisma.payment.create({
            data: {
                userId: userId, // Use the safely extracted userId
                orderId: client_reference_id, // Order ID from the session
                stripePaymentId: payment_intent, // Payment Intent ID from Stripe
                amount: amount_total / 100, // Convert from cents
                currency: currency,
                status: "Completed", // Payment status
            },
        });
        // Update the order status to "Completed"
        yield prisma.order.update({
            where: { id: client_reference_id },
            data: { status: "Completed" },
        });
        res.status(200).json({ success: true, payment });
    }
    catch (error) {
        console.error("Error confirming payment", error);
        res.status(500).json({ error: "Failed to confirm payment." });
    }
}));
exports.default = router;
