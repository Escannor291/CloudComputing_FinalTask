const express = require("express");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const router = express.Router();
const usersFile = "./users.json";

// Pastikan users.json ada agar server tidak crash di Azure
if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
}

router.post("/register", (req, res) => {
    const { username, password, role } = req.body;

    const users = JSON.parse(fs.readFileSync(usersFile));

    if (users.find(u => u.username === username)) {
        return res.status(400).send("Username sudah ada");
    }

    const hashed = bcrypt.hashSync(password, 10);
    users.push({ username, password: hashed, role: role || "user" });
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    res.send("Registrasi berhasil!");
});

router.post("/login", (req, res) => {
    const { username, password } = req.body;

    const users = JSON.parse(fs.readFileSync(usersFile));
    const user = users.find(u => u.username === username);

    if (!user) return res.status(404).send("User tidak ditemukan");

    if (!bcrypt.compareSync(password, user.password))
        return res.status(401).send("Password salah");

    const token = jwt.sign({ username, role: user.role }, process.env.JWT_SECRET);

    res.json({ token });
});

function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(403).send("Token tidak ada");

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).send("Token invalid");
    }
}

module.exports = { router, verifyToken };
