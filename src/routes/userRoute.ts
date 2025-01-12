// import express, { Request, Response } from 'express';
// import { prismaClient } from '../src/db';
// // import bcrypt from 'bcrypt';

// import { authMiddleware } from '../src/middleware';
// import jwt from 'jsonwebtoken';
// import { JWT_PASSWORD } from '../src/config';
// import { SigninData,SignupData } from '../src/types';

// const router = express.Router();


// // Register a new user (admin can assign roles here)
// router.post("/signup", async(req:any, res:any) => {
//     const body = req.body;
//     const parsedData = SignupData.safeParse(body);

//   if (!parsedData.success){
//     return res.status(411).json({
//         message : "Incorrect credential",
//         errors: parsedData.error.errors
//     });
//   }



//   const userExists = await  prismaClient.user.findFirst({
//     where: {
//         email: parsedData.data.username
//     }
//   })
//   if (userExists){
//     return res.status(403).json({
//         message: "User already exist"
//     })
//   }

//   await prismaClient.user.create({
//     data: {
//         email: parsedData.data.username,
//         //TODO: Don't store text in plain text
//         password: parsedData.data.password,
//         name: parsedData.data.name
//     }
//   })
//   return res.json({
//     message: "Please verify your account by checking your email"
//   })
 


 


// })

// router.post("/signin", async(req:any,res:any)=>{
//   const body = req.body;
//   const parsedData = SigninData.safeParse(body);

// if (!parsedData.success){
//   return res.status(411).json({
//       message : "Incorrect credential",
//       errors: parsedData.error.errors
//   });
// }
// const user = await prismaClient.user.findFirst({
//   where: {
//       email: parsedData.data.username,
//       password: parsedData.data.password
//   }
// });
//           if(!user){
//             return res.status(403).json({
//               message: "sorry credential are incorrect"
//             })
//           }
//           //sign the jwt

//           const token = jwt.sign({
//             id: user.id
//           }, JWT_PASSWORD)

//           res.json({
//             token: token
//           })

// })
// //check here

// router.get("/", authMiddleware , async (req:any ,res:any)=>{
//   //TODO: Fix the type
//   // @ts-ignore
//     const id = req.id;
//     const user = await prismaClient.user.findFirst({
//       where: {
//         id
//       },
//       select: {
//         name: true,
//         email: true
//       }

//     })

//     return res.json({
//       user
//     })


//     //The issue you're encountering arises from the incorrect type assignment for req in the /user route. In Express, the request object req is not of type string but should be of type Request. Here's how to fix the error:

// // Correct the types for req and res in the /user route handler.
// // Ensure the middleware (authMiddleware) is adding the correct user data (like id) to the req object.
// // Here’s an updated version of your code:



// })


// export default router;





// import { Router } from "express";
//  import express, { Request, Response } from 'express';
// import { PrismaClient } from "@prisma/client";
// import jwt from "jsonwebtoken";
// import { JWT_PASSWORD } from "../config";

// const router = Router();
// const prisma = new PrismaClient();

// // User signup
// router.post("/signup", async (req:any, res:any) => {
//   const { name, email, password } = req.body;
//   try {
//     const existingUser = await prisma.user.findUnique({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ error: "User already exists" });
//     }
//     const user = await prisma.user.create({
//       data: { name, email, password, role: "user" }, // Default role is 'user'
//     });
//     res.status(201).json({ message: "Signup successful", user });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to signup" });
//   }
// });

// // User login
// router.post("/login", async(req:any, res:any) => {
//   const { email, password } = req.body;
//   try {
//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user || user.password !== password) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }
//     const token = jwt.sign({ userId: user.id, role: user.role }, JWT_PASSWORD!, { expiresIn: "1h" });
//     res.json({ message: "Login successful", token });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to login" });
//   }




// });

// // View menu
// router.get("/menu", async (req, res) => {
//   try {
//     const menus = await prisma.menu.findMany();
//     res.json(menus);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch menu" });
//   }
// });

// export default router;











import { Router } from "express";
import { PrismaClient } from "@prisma/client";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"; // Import bcrypt
import { JWT_PASSWORD } from "../config";

const router = Router();
const prisma = new PrismaClient();

// User signup
router.post("/signup", async (req:any, res:any) => {
  const { name, email, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // Use 10 as the salt rounds

    // Save the user with the hashed password
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: "user" }, // Store hashed password
    });

    res.status(201).json({ message: "Signup successful", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to signup" });
  }
});

// User login
// router.post("/login", async (req:any, res:any) => {
//   const { email, password } = req.body;
//   try {
//     // Find the user
//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }

//     // Compare the provided password with the hashed password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }

//     // Generate JWT token
//     const token = jwt.sign({ userId: user.id, role: user.role }, JWT_PASSWORD!, {
//       expiresIn: "1h",
//     });

//     res.json({ message: "Login successful", token });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to login" });
//   }
// });




router.post("/login", async (req:any, res:any) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_PASSWORD!, {
      expiresIn: "1h",
    });

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email,role:user.role }, // Send user details
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to login" });
  }
});






router.get("/role", async (req: any, res: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_PASSWORD!);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ role: user.role });
  } catch (error) {
    console.error("Error fetching user role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


























// View menu
// hermoine5678$$90^&890
router.get("/menu", async (req, res) => {
  try {
    const menus = await prisma.menu.findMany();
    res.json(menus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

export default router;






















