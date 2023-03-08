const TelegramApi =  require("node-telegram-bot-api");
const {gameOptions, againOptions} = require("./options");
const Promise = require('bluebird');
  Promise.config({
    cancellation: true
  });

const token = "6065903165:AAESpVxPXZjV01OIqA2bXBXYqHxY-4Gu2dk";

const bot = new TelegramApi(token, { polling: true });

const chats = {};

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, "Зараз я загадаю число від 0 до 9, а ти спробуй його відгадати")
    const randomNumber = Math.floor(Math.random() * 10);
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, `Пробуй відгадати. Скажу по секрету... я загадав число ${randomNumber}`, gameOptions);
}

const start = () => {
    bot.setMyCommands([
        { command: "/start", description: "Початок роботи з ботом"},
        { command: "/info", description: "Інформація про тебе"},
        { command: "/game", description: "Перевіримо твою удачу"}
    ])
        
    bot.on("message", async (message) => {
        const text = message.text;
        const from = message.from;
        const chatId = message.chat.id;
        
        if (text === "/start") {
            await bot.sendMessage(chatId, `Привіт ${from.first_name}! Асистент Гната радий тобі допомогти. Вибери команду в пункті "МЕНЮ"`);
            return await bot.sendSticker(chatId, "CAACAgQAAxkBAAEeHxhkCNFOfKkMm55r6UFfj0qBmY64hwACjAoAAkeK-FCqyQVtegY39i4E")
        } 
        if (text === "/info") {
            return await bot.sendMessage(chatId, `Інформація про тебе - ${from.first_name} ${from.last_name}`);
        }
        if (text === "/game") {
            return await startGame(chatId)
        }
        return await bot.sendMessage(chatId, `Не розумію вашого запитання`);
    })

    bot.on("callback_query", async message => {
        const data = message.data;
        const chatId = message.message.chat.id;

        if (data === "/again") {
            return await startGame(chatId)
        }

        if (data == chats[chatId]) {
            await bot.sendMessage(chatId, "Ви вгадали!!!", againOptions)
            return await bot.sendSticker(chatId, "CAACAgIAAxkBAAEeH2JkCNs4rrWfpiygshFoKn_JmaaywgACBSUAAqBjsEvht8ooX7DfDS4E")
        } else {
            return await bot.sendMessage(chatId, `Ви вибрали цифру ${data}, але не вгадали 😢`, againOptions)
        }
    })
}

start();