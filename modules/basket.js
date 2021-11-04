
let basket, priceField, phoneField, paumentCash, paumentCard, dict, submit, productsCont, promoField, promoBtn, clearBtn;
const orderDict = {
    menus: {
        home: 'домашнее',
        lite: 'легкое',
        avan: 'авангард'
    },
    numDishes: {
        three: 'три блюда',
        four: 'четыре блюда',
        five: 'пять блюд',
        six: 'шесть блюд'
    },
    numDays: {
        five: {
            work: 'на 5 дней',
            each: 'на 7 дней'
        },
        twenty: {
            work: 'на 20 дней',
            each: 'на 28 дней'
        }
    }
}

const int = setInterval(() => {
    basket = document.querySelector('#rec335963068');
    if (basket) {
        clearInterval(int);
        setBasketConnection();
    }
}, 500);

function clearBasket () {
    productsCont.innerHTML = '';
    promoField.innerHTML = '';
}

function setBasketConnection () {
    priceField = basket.querySelector('.t706__cartwin-prodamount');
    phoneField = basket.querySelector('input[name="phone"]');
    paymentCash = basket.querySelector('[name="paymentsystem"][value="cash"]');
    paymentCard = basket.querySelector('[name="paymentsystem"][value="tinkoff"]');
    submit = basket.querySelector('.t-submit');
    productsCont = basket.querySelector('.t706__cartwin-products');
    promoField = basket.querySelector('.t-inputpromocode');
    promoBtn = basket.querySelector('.t-inputpromocode__btn');
    if (clearBtn) {
        clearBtn.click();
    }
}

function resetOrderInfo () {
    const { tab, numDishes, daysSelection, numDays } = state;
    const price = prices[tab][numDishes][daysSelection][numDays];
    orderInfoLink.setAttribute('href', `#order:${orderDict.menus[tab]}, ${orderDict.numDishes[numDishes]} ${orderDict.numDays[numDays][daysSelection]}=${price}`);
}

function handleOrder () {
    console.log('order: ', state);
    fillBasket();
    FBpixel.trackPurchase();
    // VKpixel.trackPurchase();
}
    
function fillBasket (context) {
    const { tab, payment, phone, price, promocode, discount } = context;
    priceField.innerHTML = '' + price;
    phoneField.value = phone;
    if (discount) {
        promoField.value = promocode;
        promoBtn.click();
    }
    if (payment === 'card' && tab !== 'avan') {     // т.к. авангард больше не оплачивается
        paymentCard.click();
    } else {
        paymentCash.click();
    }
    setTimeout(() => {
        submit.click();
    }, 500);
}