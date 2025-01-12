"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SigninData = exports.SignupData = void 0;
const zod_1 = require("zod");
exports.SignupData = zod_1.z.object({
    username: zod_1.z.string().email({ message: "Invalid email address" }),
    password: zod_1.z.string().min(8, { message: "Password must be at least 8 characters long" }),
    name: zod_1.z.string().min(1, { message: "Name is required" }),
});
exports.SigninData = zod_1.z.object({
    username: zod_1.z.string(),
    password: zod_1.z.string()
});
