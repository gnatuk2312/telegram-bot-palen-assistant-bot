const TelegramApi =  require("node-telegram-bot-api");

const {gameOptions, againOptions} = require("./options");
const sequelize = require("./db");
const {User} = require("./models");

const token = "6065903165:AAESpVxPXZjV01OIqA2bXBXYqHxY-4Gu2dk";

const bot = new TelegramApi(token, { polling: true });

const chats = {};

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, "Зараз я загадаю число від 0 до 9, а ти спробуй його відгадати")
    const randomNumber = Math.floor(Math.random() * 10);
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, `Пробуй відгадати. Скажу по секрету... я загадав число ${randomNumber}`, gameOptions);
}

const sendMessageToAllUsers = async () => {
    const users = await  User.findAll();
    users.forEach(user => {
        const chatId = user.dataValues.chatId;
        const lastName = user.dataValues.lastName;
        const firstName = user.dataValues.firstName;

        bot.sendMessage(chatId, `Привіт ${firstName}! Я можу написати тобі в будь який момент, навіть о 04:00 ранку. \n\nСкинь 100грн мені на карту: xxxx-xxxx-xxxx-xxxx і твій сон буде й надалі спокійним \n\n З повагою, асистент Гната.`)
        bot.sendSticker(chatId, "CAACAgIAAxkBAAEeMJtkCxP1urTqJ2dZPOA5xVHuL2bWQAACYgADISmmG5dCydoH6MnGLwQ")
    })
}

const start = async () => {

    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log("Successfully connected to database");
    } catch (error) {
        console.log("Error while connecting to database", error);
    }

    bot.setMyCommands([
        { command: "/start", description: "Початок роботи з ботом"},
        { command: "/info", description: "Інформація про тебе"},
        { command: "/game", description: "Перевіримо твою удачу"}
    ])
        
    bot.on("message", async (message) => {
        const text = message.text;
        const from = message.from;
        const firstName = from.first_name;
        const lastName = from.last_name;
        const chatId = message.chat.id;

        try {
            if (text === "/start") {
                const user = await User.findOne({where: {chatId: String(chatId)}});
                if (user) {
                    await bot.sendMessage(chatId, `User exist`);
                } else {
                    await User.create({firstName, lastName, chatId})
                    await bot.sendMessage(chatId, `User created`);
                }
                // const user = await User.findOne({ where: {chatId} })
                // if (user) {
                //     return await bot.sendMessage(chatId, `Радий бачити вас знову, ${user.dataValues.firstName}! Вибери команду в пункті "МЕНЮ"`);
                // } else {
                //     await User.create({firstName, lastName, chatId})
                //     await bot.sendMessage(chatId, `Привіт ${from.first_name}! Асистент Гната радий тобі допомогти. Вибери команду в пункті "МЕНЮ"`);
                //     return await bot.sendSticker(chatId, "CAACAgQAAxkBAAEeHxhkCNFOfKkMm55r6UFfj0qBmY64hwACjAoAAkeK-FCqyQVtegY39i4E")
                // }
            } 
            if (text === "/info") {
                const user = await User.findOne({chatId})
                return await bot.sendMessage(chatId, `Інформація про користувача: \n ${from.first_name} ${from.last_name}. \n ${user.right} - привильних відповідей та ${user.wrong} - неправильних в /game`);
            }
            if (text === "/game") {
                return await startGame(chatId)
            }
            // return await bot.sendMessage(chatId, `Не розумію вашого запитання`);
        } catch (error) {
            return await bot.sendMessage(chatId, `Сталась якась помилка ${JSON.stringify(error)}`)
        }
    })

    bot.on("callback_query", async message => {
        const data = message.data;
        const chatId = message.message.chat.id;

        if (data === "/again") {
            return await startGame(chatId)
        }
        const user = await User.findOne({chatId});
        if (data == chats[chatId]) {
            user.right++;
            await bot.sendMessage(chatId, "Ви вгадали!!!", againOptions)
            await bot.sendSticker(chatId, "CAACAgIAAxkBAAEeH2JkCNs4rrWfpiygshFoKn_JmaaywgACBSUAAqBjsEvht8ooX7DfDS4E")
        } else {
            user.wrong++
            await bot.sendMessage(chatId, `Ви вибрали цифру ${data}, але не вгадали 😢`, againOptions)
        }
        await user.save();
    })
}

start();