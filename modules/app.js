import { fetchData, connectBasket, checkout, checkPromocodeInternally } from './service.js';
import { pricesData } from './prices.js';
import { dict } from './data.js';

export const appComp = {
    el: '#app',
    data() {
        return {
            configuration: {
                tab: 'home',    // home / lite / avan
                numDishes: '5',
                daysSelection: 'work',
                numDays: '20',
                isDessertAdded: false,
                isDrinkAdded: false,
            },
            day: 0,
            promocodeResults: {
                promocode: '',
                status: 'ready',
                type: null,
                discount: null
            },
            payment: 'card',
            phone: '',
            savedConfigs: [],
            dishesData: [],
            drinkData: null,
            dishPopupInfo: {
                isShown: false,
                name: '',
                weight: 0,
                text: '',
                drinkData: null,
                x: 0,
                y: 0
            },
            prices: pricesData,
            menuLinks: {home: '#home', lite: '#lite', avan: '#avan'},
            dishesX: 0,
            promoValues: [],
            basket: { selector: '', price: null, phone: null, cashBtn: null, cardBtn: null, productsCont: null, promoInput: null, promoBtn: null, submitBtn: null, preventOrder: false }
        }
    },
    async mounted() {
        const dishesData = await fetchData();
        this.dishesData = dishesData.length ? dishesData : getMockedData();
        this.drinkData = this.dishesData.find(dish => dish.index === 'drink');
        console.log(this.dishesData, this.drinkData);
    },
    methods: {
        setParameter: function(parameter, value, subParameter = null) {
            if (subParameter) {
                this[parameter][subParameter] = value;
            } else {
                this[parameter] = value;
            }
        },
        isActive: function(parameter, value, subParameter = null) {
            if (subParameter) {
                return this[parameter][subParameter] === value;
            } else {
                return this[parameter] === value;
            }
        },
        getNumericNumDays: function(numDays, daysSelection) {
            if (numDays === '5') {
                if (daysSelection === 'work') {
                    return 5;
                } else {
                    return 7;
                }
            } else {
                if (daysSelection === 'work') {
                    return 20;
                } else {
                    return 28;
                }
            }
        },
        saveConfig: function() {
            this.savedConfigs.push({
                ...this.configuration,
                price: this.price,
            });
            if (this.isMobile) {
                $('html, body').animate({scrollTop: $("#app").offset().top}, 250);
            }
        },
        deleteConfig: function(index) {
            if (index === 'current') {
                const config = this.savedConfigs[this.savedConfigs.length - 1];
                this.configuration.tab = config.tab;
                this.configuration.numDishes = config.numDishes;
                this.configuration.numDays = config.numDays;
                this.configuration.isDessertAdded = config.isDessertAdded;
                this.savedConfigs.splice(this.savedConfigs.length - 1, 1);
            } else {
                this.savedConfigs.splice(index, 1);
            }
        },
        connectBasket: function() {
            connectBasket(this);
        },
        checkout: function() {
            checkout(this);
        },
        hidePopup: function() { this.dishPopupInfo.isShown = false; },
        checkPromocodeInternally: function(promocode) { return checkPromocodeInternally(this, promocode) }
    },
    computed: {
        currentDishes: function() {
            const { tab, numDishes, isDessertAdded, isDrinkAdded } = this.configuration;
            const dayDishes = this.dishesData.filter(dish => {
                return dish.menu === tab && dish.day == this.day;
            });
            const dishes = dayDishes.slice(0, Number(numDishes));
            if (isDessertAdded) {
                dishes.push(dayDishes.find(dish => dish.index === 'dessert'));
            }
            if (isDrinkAdded) {
                dishes.push(this.drinkData);
            }
            return dishes;
        },
        price: function() {
            const { tab, numDishes, daysSelection, numDays, isDessertAdded, isDrinkAdded } = this.configuration;
            const pricesForDiffDays = this.prices[tab][numDishes][daysSelection];
            let profit, dessertPrice = 0, drinkPrice = 0, discountCoeff = 1;
            if (numDays === '20') {
                profit = 4 * pricesForDiffDays['5'] - pricesForDiffDays['20'];
            }
            if (!this.promocodeResults.discount && this.savedConfigs.length) {
                discountCoeff = 0.9;
            }
            let basePrice = pricesForDiffDays[numDays] * discountCoeff;
            let price = basePrice;
            if (isDessertAdded) {
                dessertPrice = this.prices.dessert * this.getNumericNumDays(numDays, daysSelection) * discountCoeff;
                price += dessertPrice;
            }
            if (isDrinkAdded) {
                drinkPrice = this.prices.drink * this.getNumericNumDays(numDays, daysSelection) * discountCoeff;
                price += drinkPrice;
            }
            return {
                price,
                profit,
                basePrice,
                dessertPrice,
                drinkPrice,
                textPrice: `${basePrice}р`,
                textProfit: `Ваша выгода — ${profit} р/день`
            }
        },
        totalPrice: function() {
            let { price, profit } = this.price;
            if (this.savedConfigs.length) {
                this.savedConfigs.forEach(config => {
                    price += config.price.price;
                    profit += config.price.profit;
                });
            }
            if (this.promocodeResults.discount) {
                if (this.promocodeResults.type === 'percent') {
                    price = Math.floor(price * (1 - this.promocodeResults.discount / 100));
                } else {
                    price -= this.promocodeResults.discount;
                }
            }
            let priceArr = String(price).split('');
            priceArr.splice(priceArr.length - 3, 0, ' ');
            return {
                price,
                profit,
                textPrice: `${priceArr.join('')} р`,
                textProfit: `Ваша выгода — ${profit} р/день`
            }
        },
        cartPrice: function() {
            let { price, profit } = this.price;
            if (this.savedConfigs.length) {
                this.savedConfigs.forEach(config => {
                    price += config.price.price;
                    profit += config.price.profit;
                });
            }
            return price;
        },
        menuLink: function() {
            return this.menuLinks[this.configuration.tab];
        },
        orderLink: function() {
            const { tab, numDishes, daysSelection, numDays, isDessertAdded } = this.configuration;
            const link = (configs) => `#order:${configs}=${this.cartPrice}`;
            let configs = `Рацион "${dict.menus[tab]}":` + 
                `${dict.numDishes[numDishes]}${isDessertAdded ? '+десерт' : ''},` +
                `${dict.daysSelect[daysSelection][numDays]}`;
            this.savedConfigs.forEach(config => {
                configs += ` + Рацион "${dict.menus[config.tab]}":` +
                    `${dict.numDishes[config.numDishes]}${config.isDessertAdded ? '+десерт' : ''},` +
                    `${dict.daysSelect[config.daysSelection][config.numDays]}`;
            });
            return link(configs);
        },
        isMobile: function() {
            return /Mobi/i.test(window.navigator.userAgent);
        },
        isMobileSafari: function() {
            const isSafari = window.navigator.userAgent.indexOf("Safari") > -1;
            return this.isMobile && isSafari;
        }
    }
};