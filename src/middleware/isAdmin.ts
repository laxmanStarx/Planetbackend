import express,{ NextFunction, Request, Response,Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"; // Import bcrypt
import { JWT_PASSWORD } from "../config";




import { prismaClient } from '../db';



const router = express.Router();






export const isAdmin = router.post("/assign-admin", async (req: any, res: any) => {
    const { email } = req.body;
  
    try {
      const user = await prismaClient.user.findUnique({ where: { email } });
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Update the user's role to admin
      const updatedUser = await prismaClient.user.update({
        where: { email },
        data: { role: "admin" },
      });
      const token = jwt.sign({ userId: user.id, role: "admin" }, JWT_PASSWORD!, {
        expiresIn: "1h",
      });
      
      res.status(200).json({
        message: `Admin role assigned to ${updatedUser.name} (${updatedUser.email})`,
        token, // Ensure the token is included in the response
      });
  
      // res.status(200).json({
      //   message: `Admin role assigned to ${updatedUser.name} (${updatedUser.email})`,
      // });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to assign admin role" });
    }
  });
  








// export function authMiddleware (req: Request,res:any,next: NextFunction) {
//     const token = req.headers.authorization as unknown as string
//      try{
//     const payload = jwt.verify(token, JWT_PASSWORD)

    
//         // @ts-ignore
//         req.id = payload.id
//         next();
//     }catch(e){
//         return res.status(403).json({
//             message: "You are not logged in"
//         })
//     }

// }