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
// Middleware to check admin role
// const isAdmin = async (req: any, res: any, next: NextFunction) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) {
//     console.log("No token provided");
//     return res.status(401).json({ error: "Unauthorized" });
//   }
//   try {
//     const decoded: any = jwt.verify(token, JWT_PASSWORD!);
//     const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
//     if (!user || user.role !== "admin") {
//       return res.status(403).json({ error: "Access denied: Admins only" });
//     }
//     req.userId = decoded.userId;
//     next();
//   } catch (error) {
//     console.error("Error verifying token:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
// Add a menu item
router.post("/menu", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, price, image, restaurantId } = req.body;
    try {
        // console.log("Creating menu item with data:", { name, description, price, image, restaurantId });
        const menu = yield prisma.menu.create({
            data: { name, description, price, image, restaurantId },
        });
        res.status(201).json(menu);
    }
    catch (error) {
        console.error("Error adding menu item:", error);
        res.status(500).json({ error: "Failed to add menu item" });
    }
}));
// Update a menu item
router.put("/menu/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, description, price, image } = req.body;
    try {
        const updatedMenu = yield prisma.menu.update({
            where: { id },
            data: { name, description, price, image },
        });
        res.json(updatedMenu);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update menu item" });
    }
}));
// Delete a menu item
router.delete("/menu/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma.menu.delete({ where: { id } });
        res.status(200).json({ message: "Menu item deleted" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete menu item" });
    }
}));
router.get("/popular-items", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const popularItems = yield prisma.orderItem.groupBy({
            by: ["menuId"], // Group by menu item
            _count: {
                menuId: true, // Count how many orders are associated with each menu item
            },
            having: {
                menuId: {
                    _count: {
                        gte: 3, // Filter only items with 3 or more orders
                    },
                },
            },
        });
        // Fetch the menu details for the grouped items
        const menuIds = popularItems.map((item) => item.menuId);
        const menuDetails = yield prisma.menu.findMany({
            where: {
                id: {
                    in: menuIds,
                },
            },
        });
        res.json(menuDetails);
    }
    catch (error) {
        console.error("Error fetching popular items:", error);
        res.status(500).json({ error: "Failed to fetch popular items" });
    }
}));
exports.default = router;
//8b34d46b-269f-4be2-b148-fff9ee98aec7
