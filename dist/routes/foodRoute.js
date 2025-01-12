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
// Fetch all menu items
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const menus = yield prisma.menu.findMany();
        res.json(menus);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch menu" });
    }
}));
// Fetch a single menu item by ID
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const menu = yield prisma.menu.findUnique({ where: { id } });
        if (!menu)
            return res.status(404).json({ error: "Menu item not found" });
        res.json(menu);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch menu item" });
    }
}));
exports.default = router;
