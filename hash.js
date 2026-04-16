const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config();

const db = new sqlite3.Database('./capitals.db');
const PEPPER = process.env.PEPPER || 'default_pepper_for_demo';

// Функція підготовки пароля
function preparePassword(password) {
    const preHashed = crypto.createHash('sha256').update(password).digest('hex');
    return crypto.createHmac('sha256', PEPPER).update(preHashed).digest('base64');
}

async function showCapitalsWithAuth(inputPassword) {
    // Хеш від "Ukraine2026!"
    const storedHash = 'GpqB2PKqQ9mScJelt0ViEy8seiSMN+OCCd3emlbXxT8=';

    try {
        const processedInput = preparePassword(inputPassword);
        const isMatch = (processedInput === storedHash);
        const isMatch = await bcrypt.compare(processedInput, storedHash);

        if (isMatch) {
            console.log('✅ Пароль вірний. Доступ надано.');
            
            // Запит до бази ТІЛЬКИ ТУТ
            db.all("SELECT * FROM capitals ORDER BY id ASC", [], (err, rows) => {
                if (err) {
                    console.error('❌ Помилка бази:', err.message);
                } else {
                    console.log('🌍 Список столиць:');
                    console.table(rows);
                }
                db.close();
            });
        } else {
            console.log('❌ Доступ заборонено: Невірний пароль.');
            db.close();
        }
    } catch (err) {
        console.error('System error:', err.message);
        db.close();
    }
}

// Отримуємо пароль з терміналу
const userPass = process.argv[2]; 

if (!userPass) {
    console.log('Ви не ввели пароль! Пишіть так: node databasecapitals.js ваш_пароль');
    process.exit(); // Зупиняємо програму
} else {
    showCapitalsWithAuth(userPass);
}