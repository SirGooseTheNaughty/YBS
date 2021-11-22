// import { fetchQuestions, preformResults, fetchResults } from './functions.js';
// import { loadCookies, saveCookies, unloadListener, showResults } from './utils.js';
// import { colorSchemes } from "./data.js";
import { fetchData, connectBasket, checkout, checkPromocodeInternally } from './service.js';
import { pricesData } from './prices.js';
import { dict } from './data.js';

export const appComp = {
    el: '#app',
    data() {
        return {
            tab: 'home',    // home / lite / avan
            numDishes: '5',
            isDessertAdded: false,
            day: 0,
            daysSelection: 'work',
            numDays: '20',
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
            dishPopupInfo: {
                isShown: false,
                name: '',
                weight: 0,
                text: '',
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
        console.log(this.dishesData);
    },
    watch: {
        numDishes: function() {
            this.dishesX = 0;
        }
    },
    methods: {
        setParameter: function(parameter, value, subParameter = null) {
            if (subParameter) {
                this[parameter][subParameter] = value;
            } else {
                this[parameter] = value;
            }
        },
        isActive: function(parameter, value) {
            return this[parameter] === value;
        },
        saveConfig: function() {
            this.savedConfigs.push({
                tab: this.tab,
                numDishes: this.numDishes,
                numDays: this.numDays,
                daysSelection: this.daysSelection,
                isDessertAdded: this.isDessertAdded,
                price: this.price,
            });
            if (this.isMobile) {
                $('html, body').animate({scrollTop: $("#app").offset().top}, 250);
            }
        },
        deleteConfig: function(index) {
            if (index === 'current') {
                const config = this.savedConfigs[this.savedConfigs.length - 1];
                this.tab = config.tab;
                this.numDishes = config.numDishes;
                this.numDays = config.numDays;
                this.tab = config.tab;
                this.isDessertAdded = config.isDessertAdded;
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
            const dayDishes = this.dishesData.filter(dish => {
                return dish.menu === this.tab && dish.day == this.day;
            });
            const dishes = dayDishes.slice(0, Number(this.numDishes));
            if (this.isDessertAdded) {
                dishes.push(dayDishes.find(dish => dish.index === 'dessert'));
            }
            return dishes;
        },
        price: function() {
            const pricesForDiffDays = this.prices[this.tab][this.numDishes][this.daysSelection];
            let price = pricesForDiffDays[this.numDays];
            let profit;
            if (this.numDays === '20') {
                profit = 4 * pricesForDiffDays['5'] - pricesForDiffDays['20'];
            }
            if (this.isDessertAdded) {
                let numDays = 5;
                if (this.numDays === '5') {
                    if (this.daysSelection === 'work') {
                        numDays = 5;
                    } else {
                        numDays = 7;
                    }
                } else {
                    if (this.daysSelection === 'work') {
                        numDays = 20;
                    } else {
                        numDays = 28;
                    }
                }
                price += 100 * numDays;
            }
            if (!this.promocodeResults.discount && this.savedConfigs.length) {
                price = Math.floor(0.9 * price);
            }
            return {
                price,
                profit,
                textPrice: `${price}р`,
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
            return this.menuLinks[this.tab];
        },
        orderLink: function() {
            const link = (configs) => `#order:${configs}=${this.cartPrice}`;
            let configs = `Рацион "${dict.menus[this.tab]}":` + 
                `${dict.numDishes[this.numDishes]}${this.isDessertAdded ? '+десерт' : ''},` +
                `${dict.daysSelect[this.daysSelection][this.numDays]}`;
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