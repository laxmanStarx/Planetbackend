"use strict";
// import express, { Request, Response } from 'express';
// import { prismaClient } from '../db';
// // import bcrypt from 'bcrypt';
// import { authMiddleware } from '../middleware';
// import jwt from 'jsonwebtoken';
// import { JWT_PASSWORD } from '../config';
// import { SigninData,SignupData } from '../types';
// const router = express.Router();
// router.post("/assign-admin", async (req: any, res: any) => {
//     const { email } = req.body;
//     try {
//       const user = await prismaClient.user.findUnique({ where: { email } });
//       if (!user) {
//         return res.status(404).json({ error: "User not found" });
//       }
//       // Update the user's role to admin
//       const updatedUser = await prismaClient.user.update({
//         where: { email },
//         data: { role: "admin" },
//       });
//       res.status(200).json({
//         message: `Admin role assigned to ${updatedUser.name} (${updatedUser.email})`,
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Failed to assign admin role" });
//     }
//   });
