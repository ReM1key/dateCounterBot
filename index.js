const { Telegraf } = require('telegraf');
require('dotenv').config();
const moment = require('moment');
const plural = require('plural-ru');

const botKey = process.env.API_KEY;
const bot = new Telegraf(botKey);

const formatsForDate = ['DD.MM.YYYY', 'DD.MM.YY', 'D.MM.YY', 'D.MM.YYYY', 'D MMMM YYYY', 'DD MMMM YYYY'];
const monthMapping = {
    'января': 'January',
    'февраля': 'February',
    'марта': 'March',
    'апреля': 'April',
    'мая': 'May',
    'июня': 'June',
    'июля': 'July',
    'августа': 'August',
    'сентября': 'September',
    'октября': 'October',
    'ноября': 'November',
    'декабря': 'December'
};

const translaterMonth = text => {
    let translateText = text;
    for (key in monthMapping) {
        if (text.toLowerCase().includes(key)) {
            translateText = text.replace(key, monthMapping[key])
            break;
        }
    }
    return translateText;
};

bot.start((ctx) => {
    const userName = ctx.from.first_name;
    ctx.reply(`Привет, ${userName}!\nНапиши мне дату в формате "дд.мм.гг" или "1 ноября 2024" и получишь желаемое :)`)
});

bot.on('text', (ctx) => {
    const userMsg = ctx.message.text;
    const translateMsg = translaterMonth(userMsg);

    const today = moment().startOf('day');

    let validUserDate;
    formatsForDate.some(format => {
        if (moment(translateMsg, format, true).isValid()) {
            validUserDate = moment(translateMsg, format);
            return true;
        } 
        return false;
    });

    if (validUserDate) {
        const daysUntil = today.diff(validUserDate, 'days');
        const absDaysUntil = Math.abs(daysUntil);
        if (absDaysUntil === 0) {
            ctx.reply(`Это сегодняшняя дата`)
        } else if (today.isBefore(validUserDate)) {
            ctx.reply(`До этой даты ${plural(absDaysUntil, 'остался', 'осталось')} ${absDaysUntil} ${plural(absDaysUntil, 'день', 'дня', 'дней')}`)
        } else if (today.isAfter(validUserDate)) {
            ctx.reply(`С этой даты ${plural(absDaysUntil, 'прошёл', 'прошло')} ${absDaysUntil} ${plural(absDaysUntil, 'день', 'дня', 'дней')}`)
        }
    } else {
        ctx.reply(`Увы, но я не распознал дату. Введи её в формате: "дд.мм.гг", пожалуйста!`)
    };
});

bot.launch();
