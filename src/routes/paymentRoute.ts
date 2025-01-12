
// import { Router } from "express";
// import Stripe from "stripe";


// const stripe = new Stripe(STRIPE_SECRET_KEY);

// const router = Router();

// router.post("/create-payment-intent", async (req:any, res:any) => {
//   const { totalAmount, currency } = req.body;

//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Math.round(totalAmount * 100), // Stripe expects amounts in cents
//       currency: currency || "inr", // Default to INR
//       payment_method_types: ["card"],
//     });

//     res.status(200).json({ clientSecret: paymentIntent.client_secret });
//   } catch (error) {
//     console.error("Error creating payment intent:", error);
//     // res.status(500).json({ error: error.message });
//   }
// });

// export default router;
