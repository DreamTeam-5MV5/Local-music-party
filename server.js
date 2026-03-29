console.log("🚀 ПРИЛОЖЕНИЕ НАЧИНАЕТ ЗАПУСК...");
console.log("Node version:", process.version);
console.log("PORT from env:", process.env.PORT);

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// pool
const db = mysql.createPool({
    host: "crossover.proxy.rlwy.net",
    user: "root",
    password: "FsAdXAdsNwvwoaarvcZBzPzsqHBprIKO",
    database: "railway",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Проверка подключения
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Ошибка подключения к БД:", err);
    } else {
        console.log("✅ MySQL подключена к Railway");
        connection.release();
    }
});

// Health-check (для Railway)
app.get("/", (req, res) => {
    res.status(200).send("OK");
});

// API
app.post("/contact", (req, res) => {
    const { name, email, phone, request } = req.body;

    if (!name || !email || !request) {
        return res.status(400).json({
            message: "Заполните имя, email и вопрос"
        });
    }

    const phoneValue = phone && phone.trim() !== "" ? phone : null;

    const sql = `
        INSERT INTO requests (name, email, phone, request)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [name, email, phoneValue, request], (err, result) => {
        if (err) {
            console.error("❌ Ошибка при вставке:", err);
            return res.status(500).json({
                message: "Ошибка сервера"
            });
        }

        res.status(200).json({
            message: "Форма успешно отправлена ✅"
        });
    });
});

// Защита от падений
process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION:", err);
});

// Запуск сервера
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

setInterval(() => {
    console.log(` Сервер жив, uptime: ${Math.floor(process.uptime())}s`);
}, 30000); // каждые 30 секунд

process.on('SIGTERM', () => {
    console.log(' SIGTERM received, shutting down...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down...');
    process.exit(0);
});
