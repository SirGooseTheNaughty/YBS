export async function fetchData () {
    let result = [];
    await fetch("https://store.tildacdn.com/api/getproductslist/?storepartuid=414267329441&slice=1&size=160")
    .then(res => res.json())
    .then(res => {
        result = res.products.map(dish => {
            const [ menu, day, index ] = dish.title.split('-');
            let picUrl = tildaPicUrl;
            const characteristics = { ccal: 0, prot: 0, fat: 0, carb: 0 };
            Object.keys(characteristics).forEach(key => {
                const property = dish.characteristics.find(car => car.title === key);
                if (property) {
                    characteristics[key] = property.value;
                }
            });
            if (dish.gallery) {
                try {
                    picUrl = JSON.parse(dish.gallery)[0].img;
                } catch (e) {
                    console.log(e);
                }
            }
            return {
                menu,
                day: Number(day) - 1,
                index: isNaN(index) ? index : Number(index) - 1,
                drinkOptions: index === 'drink' ? dish.text.split('; ') : null,
                name: dish.descr,
                picUrl,
                text: dish.text,
                weight: dish.pack_m,
                characteristics
            }
        });
    })
    .catch(e => {
        console.log(e);
        result = [];
    });
    return result;
}

async function fetchPromocode (code) {
    const res = await fetch("https://forms.tildacdn.com/payment/promocode/", {
        "headers": {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        "body": `promocode=${code}&projectid=${projectId}`,
        "method": "POST"
    });
    return res.json();
}

export async function getPromocodeResults (promocode) {
    return { status: 'ok', type: 'percent', discount: 20 };
    const promoResult = {status: null, type: null, discount: null};
    const res = await fetchPromocode(promocode);
        if (res.message === 'OK') {
            promoResult.status = 'ok';
            if (res.discountpercent) {
                promoResult.type = 'percent';
                promoResult.discount = parseFloat(res.discountpercent);
            } else {
                promoResult.type = 'sum';
                promoResult.discount = parseFloat(res.discountsum);
            }
        } else {
            promoResult.status = 'bad';
        }
    return promoResult;
}

export function checkPromocodeInternally(context, promocode, config = null) {
    const isPromocodeStricted = context.promoValues.findIndex(code => code.codes.map(code => code.toLowerCase()).includes(promocode)) !== -1;
    if (!isPromocodeStricted) {
        return true;
    }
    const configuration = config || context.configuration
    const validPromocodes = context.promoValues.filter(value => {
        const { menu, numDishes, daysSelection, numDays, codes } = value;
        if (menu && menu !== configuration.tab) {
            return false;
        }
        if (numDishes && numDishes !== configuration.numDishes) {
            return false;
        }
        if (daysSelection && daysSelection !== configuration.daysSelection) {
            return false;
        }
        if (numDays && numDays !== configuration.numDays) {
            return false;
        }
        if (!codes.map(code => code.toLowerCase()).includes(promocode)) {
            return false;
        }
        return true;
    });
    if (validPromocodes.length) {
        return true;
    }
    return false;
}

export function connectBasket(context) {
    console.log('try');
    let basket = null;
    try {
        basket = document.querySelector(context.basket.selector);
    } catch(e) {
        return console.error('Basket can not be connected', e);
    }
    if (!basket) {
        return setTimeout(() => connectBasket(context), 500);
    }
    context.basket.price = basket.querySelector('.t706__cartwin-prodamount');
    context.basket.phone = basket.querySelector('input[name="phone"]');
    context.basket.cashBtn = basket.querySelector('[name="paymentsystem"][value="cash"]');
    context.basket.cardBtn = basket.querySelector('[name="paymentsystem"][value="tinkoff"]');
    context.basket.submitBtn = basket.querySelector('.t-submit');
    context.basket.productsCont = basket.querySelector('.t706__cartwin-products');
    context.basket.promoInput = basket.querySelector('.t-inputpromocode');
    context.basket.promoBtn = basket.querySelector('.t-inputpromocode__btn');
    context.basket.promoInput.value = '';
}

export function checkout (context) {
    const { tab, payment, phone, totalPrice, isPromocodeValid, promocodeResults: { discount, promocode } } = context;
    context.basket.price.innerHTML = '' + totalPrice.basketPrice;
    context.basket.phone.value = phone;
    if (isPromocodeValid && discount) {
        context.basket.promoInput.value = promocode;
        context.basket.promoBtn.click();
    }
    if (payment === 'card' && tab !== 'avan') {     // т.к. авангард больше не оплачивается
        context.basket.cardBtn.click();
    } else {
        context.basket.cashBtn.click();
    }
    if (!context.basket.preventOrder) {
        setTimeout(() => {
            // FBpixel.trackPurchase();
            context.basket.submitBtn.click();
        }, 500);
    }
}