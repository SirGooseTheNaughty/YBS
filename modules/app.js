// import { fetchQuestions, preformResults, fetchResults } from './functions.js';
// import { loadCookies, saveCookies, unloadListener, showResults } from './utils.js';
// import { colorSchemes } from "./data.js";
import { fetchData } from './service.js';
import { pricesData } from './prices.js';
import { dict } from './data.js';

export const appComp = {
    el: '#app',
    data() {
        return {
            tab: 'home',    // home / lite / avan
            numDishes: '5',
            addDessert: false,
            day: 0,
            daysSelection: 'work',
            numDays: '20',
            promocode: '',
            promocodeResults: {
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
                ing: '',
                x: 0,
                y: 0
            },
            menuLinks: {home: '#home', lite: '#lite', avan: '#avan'}
        }
    },
    async mounted() {
        const dishesData = await fetchData();
        this.dishesData = dishesData.length ? dishesData : getMockedData();
        console.log(this.dishesData);
    },
    methods: {
        setParameter: function(parameter, value, subParameter = null) {
            if (subParameter) {
                this[parameter][subParameter] = value;
            } else {
                this[parameter] = value;
                if (parameter === 'tab' && value === 'lite') {
                    if ((this.numDishes !== '3' && this.numDishes !== '5')) {
                        this.numDishes = '5';
                    }
                }
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
        },
        deleteConfig: function(index) {
            this.savedConfigs.splice(index, 1);
        }
    },
    computed: {
        isDessertAdded: function() {
            return this.addDessert && this.tab !== 'lite';
        },
        currentDishes: function() {
            const dayDishes = this.dishesData.filter(dish => {
                return dish.menu === this.tab && dish.day == this.day;
            });
            const dishes = dayDishes.slice(0, Number(this.numDishes));
            if (this.isDessertAdded && this.tab !== 'lite') {
                dishes.push(dayDishes.find(dish => dish.index === 'dessert'));
            }
            return dishes;
        },
        price: function() {
            const pricesForDiffDays = pricesData[this.tab][this.numDishes][this.daysSelection];
            let price = pricesForDiffDays[this.numDays];
            let profit;
            if (this.numDays === '20') {
                profit = 4 * pricesForDiffDays['5'] - pricesForDiffDays['20'];
            }
            if (this.isDessertAdded) {
                price += 100;
            }
            if (!this.promocodeResults.discount && this.savedConfigs.length) {
                price = Math.floor(0.9 * price);
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
        menuLink: function() {
            return this.menuLinks[this.tab];
        },
        orderLink: function() {
            const link = (configs) => `#order:${configs}=${this.totalPrice.price}`;
            let configs = `Рацион "${dict.menus[this.tab]}":` + 
                `${dict.numDishes[this.numDishes]}${this.isDessertAdded ? '+десерт' : ''},` +
                `${dict.daysSelect[this.daysSelection][this.numDays]}`;
            this.savedConfigs.forEach(config => {
                configs += ` + Рацион "${dict.menus[config.tab]}":` +
                    `${dict.numDishes[config.numDishes]}${config.isDessertAdded ? '+десерт' : ''},` +
                    `${dict.daysSelect[config.daysSelection][config.numDays]}`;
            });
            return link(configs);
        }
    }
};