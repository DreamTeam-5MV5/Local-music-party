const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Подключение к MySQL
const db = mysql.createConnection({
    host: "crossover.proxy.rlwy.net",
    user: "root",
    password: "FsAdXAdsNwvwoaarvcZBzPzsqHBprIKO",
    database: "railway",
    port: 31468
});

db.connect((err) => {
    if (err) {
        console.error("Ошибка подключения к БД:", err);
    } else {
        console.log("MySQL подключена к Railway ✅");
    }
});

// GET
app.get("/", (req, res) => {
    res.status(200).json("serverRunning");
});

// POST
app.post("/contact", (req, res) => {
    const { name, email, phone, request } = req.body;

    if (!name || !email || !request) {
        return res.status(400).json({ message: "Заполните имя, email и вопрос" });
    }

    const phoneValue = phone && phone.trim() !== '' ? phone : null;

    const sql = `INSERT INTO requests (name, email, phone, request) VALUES (?, ?, ?, ?)`;

    db.query(sql, [name, email, phoneValue, request], (err, result) => {
        if (err) {
            console.error("Ошибка при вставке в БД:", err);
            return res.status(500).json({ message: "Ошибка сервера" });
        }

        res.status(200).json({ message: "Форма успешно отправлена ✅" });
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});