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
                discount: null,
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
    watch: {
        configuration: {
            handler(val) {
                if (val.tab === 'avan' && this.payment === 'card') {
                    this.setParameter('payment', 'cash');
                }
            },
            deep: true
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
        checkPromocodeInternally: function(promocode) { return checkPromocodeInternally(this, promocode) },
        computePrice: function(config, index) {
            const { tab, numDishes, daysSelection, numDays, isDessertAdded, isDrinkAdded } = config;
            const pricesForDiffDays = this.prices[tab][numDishes][daysSelection];
            let profit, dessertPrice = 0, drinkPrice = 0, discountCoeff = 1;
            if (numDays === '20') {
                profit = 4 * pricesForDiffDays['5'] - pricesForDiffDays['20'];
            }
            let price = pricesForDiffDays[numDays];
            if (isDessertAdded) {
                dessertPrice = this.prices.dessert * this.getNumericNumDays(numDays, daysSelection);
            }
            if (isDrinkAdded) {
                drinkPrice = this.prices.drink * this.getNumericNumDays(numDays, daysSelection);
            }
            
            const actual = {
                price: pricesForDiffDays[numDays],
                dessertPrice,
                drinkPrice
            };

            if ((!this.promocodeResults.discount || !this.isPromocodeValid) && this.savedConfigs.length && index !== 0) {
                price *= 0.9;
                actual.price *= 0.9;
            } else if (this.isPromocodeValid && this.promocodeResults.discount) {
                if (this.promocodeResults.type === 'percent') {
                    const coeff = 1 - this.promocodeResults.discount / 100;
                    price = Math.floor(price * coeff);
                } else if (index === 'current') {
                    price -= this.promocodeResults.discount;
                }
            }
            return { price, dessertPrice, drinkPrice, profit, actual };
        }
    },
    computed: {
        isPromocodeValid: function() {
            const code = this.promocodeResults.promocode;
            let isValid = this.checkPromocodeInternally(code) && !this.savedConfigs.length;
            // this.savedConfigs.forEach(config => {
            //     isValid = isValid && checkPromocodeInternally(this, code, config);
            // });
            return isValid;

        },
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
        totalPrice: function() {
            let price = 0, profit = 0, basketPrice = 0;
            const current = this.computePrice(this.configuration, 'current');
            const { actual } = current;
            price = price + current.price + current.dessertPrice + current.drinkPrice;
            basketPrice = basketPrice + actual.price + actual.dessertPrice + actual.drinkPrice;
            profit += current.profit;
            this.savedConfigs.forEach((config, index) => {
                const configPrice = this.computePrice(config, index);
                price = price + configPrice.price + configPrice.dessertPrice + configPrice.drinkPrice;
                profit += configPrice.profit;
                const { actual } = configPrice;
                basketPrice = basketPrice + actual.price + actual.dessertPrice + actual.drinkPrice;
            });
            let priceArr = String(price).split('');
            priceArr.splice(priceArr.length - 3, 0, ' ');
            console.log(basketPrice);
            return {
                price,
                basketPrice,
                profit,
                textPrice: `${priceArr.join('')} р`,
                textProfit: `Ваша выгода — ${profit} р/день`
            }
        },
        menuLink: function() {
            return this.menuLinks[this.configuration.tab];
        },
        orderLink: function() {
            const { tab, numDishes, daysSelection, numDays, isDessertAdded } = this.configuration;
            const link = (configs) => `#order:${configs}=${this.totalPrice.basketPrice}`;
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