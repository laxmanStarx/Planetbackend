






import express from "express";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY! );

router.post("/create-checkout-session", async (req, res) => {
  const { items } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Your Food Order",
              },
              unit_amount: 5000, // 50 USD in cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "http://localhost:5173/cancel",
        // metadata: {
        //   userId: userId, // Include userId
        //   orderId: orderId, // Include orderId
        // },
      });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;










// import express from "express";
// import Stripe from "stripe";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();
// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// const createOrderAndPaymentSession = async (userId: string, orderItems: any[]) => {
//   if (!userId || !orderItems.length) {
//     throw new Error("User ID and order items are required.");
//   }

//   // Calculate total price
//   const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

//   // Create Order and OrderItems in the database
//   const order = await prisma.order.create({
//     data: {
//       userId,
//       totalPrice,
//       status: "Pending", // Set the initial order status
//       orderItems: {
//         create: orderItems.map((item: any) => ({
//           menuId: item.menuId,  // Make sure menuId exists in the data
//           quantity: item.quantity,  // Ensure quantity is a valid number
//         })),
//       },
//     },
//     include: { orderItems: true },
//   });

//   return order; // Return the order object to use later (like creating a Stripe session)
// };

// // Create Checkout Session
// router.post("/create-checkout-session", async (req: any, res: any) => {
//   const { userId, items } = req.body;

//   if (!userId || !items || !items.length) {
//     return res.status(400).json({ error: "User ID and items are required." });
//   }

//   try {
//     // First, create the order in the database
//     const order = await createOrderAndPaymentSession(userId, items);

//     // Calculate total amount
//     const totalAmount = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

//     // Create Stripe checkout session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: items.map((item: any) => ({
//         price_data: {
//           currency: "usd",
//           product_data: { name: item.name },
//           unit_amount: item.price * 100, // Convert to cents
//         },
//         quantity: item.quantity,
//       })),
//       mode: "payment",
//       success_url: "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
//       cancel_url: "http://localhost:5173/cancel",
//       client_reference_id: userId, // Reference userId
//       metadata: { userId: userId, orderId: order.id }, // Add userId and orderId as metadata
//     });

//     res.json({ url: session.url, orderId: order.id });
//   } catch (error) {
//     console.error("Error creating checkout session", error);
//     res.status(500).send("Internal Server Error");
//   }
// });











// router.post("/confirm-payment", async (req:any, res:any) => {
//   const { sessionId } = req.body;

//   if (!sessionId) {
//     return res.status(400).json({ error: "Session ID is required." });
//   }

//   try {
//     // Retrieve session details from Stripe
//     const session = await stripe.checkout.sessions.retrieve(sessionId);

//     const { client_reference_id, payment_intent, metadata, amount_total, currency } = session;

//     if (!client_reference_id || !payment_intent) {
//       return res.status(400).json({ error: "Invalid session details." });
//     }

//     // Safely handle metadata, providing a fallback if it's null
//     const userId = metadata?.userId ?? "Unknown User";  // Fallback if metadata is null

//     // Save payment details in the database
//     const payment = await prisma.payment.create({
//       data: {
//         userId: userId, // Use the safely extracted userId
//         orderId: client_reference_id,  // Order ID from the session
//         stripePaymentId: payment_intent as string,  // Payment Intent ID from Stripe
//         amount: amount_total! / 100,  // Convert from cents
//         currency: currency!,
//         status: "Completed",  // Payment status
//       },
//     });

//     // Update the order status to "Completed"
//     await prisma.order.update({
//       where: { id: client_reference_id },
//       data: { status: "Completed" },
//     });

//     res.status(200).json({ success: true, payment });
//   } catch (error) {
//     console.error("Error confirming payment", error);
//     res.status(500).json({ error: "Failed to confirm payment." });
//   }
// });











// export default router;




