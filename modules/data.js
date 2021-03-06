export const taglineTexts = {
    home: 'Знакомый вкус для повседневной жизни ',
    lite: 'Баланс привычной еды для красивой фигуры',
    avan: 'Палитра блюд различных стран мира'
};
export const daysTexts = {
    long: [
        'Понедельник',
        'Вторник',
        'Среда',
        'Четверг',
        'Пятница',
        'Суббота',
        'Воскресенье'
    ],
    short: [
        'ПН',
        'ВТ',
        'СР',
        'ЧТ',
        'ПТ',
        'СБ',
        'ВС'
    ]
};
export const promoResultsTexts = {
    ok: (type, discount) => `Ваша скидка: ${discount}${type === 'sum' ? 'р' : '%'}`,
    bad: 'Не удалось применить данный промокод',
    strict: 'Этот промокод не применим к данной конфигурации меню',
    special: 'Применена скидка 10% на дополнительные рационы'
};
export const additiveLines = {
    add: 'Добавить ',
    remove: 'Убрать '
};
export const preCardAdditives = {
    dessert: '+ десерт',
    drink: '+ напиток на выбор'
};
export const dict = {
    menus: {
        home: 'Домашний',
        lite: 'Лайт',
        avan: 'Авангард',
    },
    numDishes: {
        '3': '3 блюда',
        '4': '4 блюда',
        '5': '5 блюд',
        '6': '6 блюд',
    },
    daysSelect: {
        'work': {
            '2': '2 дня',
            '5': '5 дней',
            '20': '20 дней',
        },
        'each': {
            '2': '2 дня',
            '5': '7 дней',
            '20': '28 дней',
        },
    }
};
export const defaultTryConfig = {
    numDishes: '5',
    daysSelection: 'work',
    numDays: '2',
    isDessertAdded: true,
    isDrinkAdded: true,
};