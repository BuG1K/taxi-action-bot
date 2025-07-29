const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const TOKEN = '8488566838:AAGEinaovygPDlymr8lfgS02Tmh_zjE3kqI';
const bot = new TelegramBot(TOKEN, { polling: true });

const app = express();
app.use(bodyParser.json());

let users = {}; // Хранение по номеру телефона

// Загрузка из файла при старте (если есть)
try {
  users = JSON.parse(fs.readFileSync('users.json'));
} catch (err) {
  users = {};
}

// 1. Обработка /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const opts = {
    reply_markup: {
      keyboard: [
        [{
          text: 'Участвовать в акции',
          request_contact: true
        }]
      ],
      one_time_keyboard: true
    }
  };
  console.log(11)
  bot.sendMessage(chatId, 'Нажмите кнопку ниже, чтобы участвовать в акции и поделиться контактом.', opts);
});

// 2. Получение контакта
bot.on('contact', (msg) => {
  console.log(22)
  const phoneNumber = msg.contact.phone_number;
  const chatId = msg.chat.id;

  users[phoneNumber] = chatId;
  console.log(1)
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  console.log(`Новый пользователь: ${phoneNumber} - ${chatId}`);
  bot.sendMessage(chatId, 'Спасибо за участие! Мы свяжемся с вами.');
});

// 3. Обработка GET-запроса для отправки сообщения
app.get('/send', async (req, res) => {
  const phone = req.query.phone;
  const message = req.query.message || 'У вас новое сообщение!';

  if (!phone || !users[phone]) {
    return res.status(404).send('Номер не найден');
  }

  const chatId = users[phone];
  await bot.sendMessage(chatId, message);

  res.send('Сообщение отправлено');
});

// Старт сервера
app.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});