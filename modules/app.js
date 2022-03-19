import { fetchData, connectBasket, checkout, checkPromocodeInternally } from './service.js';
import { pricesData } from './prices.js';
import { dict, defaultConfigs } from './data.js';

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
                tryMode: false,
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
    },
    watch: {
        isCardAvailable: function(old, isAvailable) {
            if (!isAvailable && this.payment === 'card') {
                this.setParameter('payment', 'cash');
            }
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
        toggleTryMode: function() {
            this.configuration.tryMode = !this.configuration.tryMode;
            this.savedConfigs = [];
            this.configuration = {
                ...this.configuration,
                ...(this.configuration.tryMode ? defaultConfigs.try : defaultConfigs.std)
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
                }
                return 7;
            } else {
                if (daysSelection === 'work') {
                    return 20;
                }
                return 28;
            }
        },
        saveConfig: function() {
            this.savedConfigs.push({...this.configuration});
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
        connectBasket: function() { connectBasket(this); },
        checkout: function() { checkout(this); },
        hidePopup: function() { this.dishPopupInfo.isShown = false; },
        checkPromocodeInternally: function(promocode, config = null) { return checkPromocodeInternally(this, promocode, config) },
        getAllValidConfigs: function(promocode, configs) {
            return configs.filter(config => this.checkPromocodeInternally(promocode, config));
        },
        getMinMaxPriceConfig: function(configs, promocode, mode = 'min') {
            const validConfigs = promocode ? this.getAllValidConfigs(promocode, configs) : configs;
            if (!validConfigs.length) {
                return null;
            }
            let index = 0, price = this.configPrice(validConfigs[0]);
            validConfigs.forEach((config, i) => {
                const configPrice = this.configPrice(config);
                if (mode === 'min') {
                    if (configPrice < price) {
                        price = configPrice;
                        index = i;
                    }
                } else {
                    if (configPrice > price) {
                        price = configPrice;
                        index = i;
                    }
                }
            });
            return validConfigs[index];
        },
        configPrice: function(config) {
            const { tab, numDishes, daysSelection, numDays } = config;
            return this.prices[tab][numDishes][daysSelection][numDays];
        },
        computePrice: function(config, index) {
            const { tab, numDishes, daysSelection, numDays, isDessertAdded, isDrinkAdded, tryMode } = config;

            if (tryMode) {
                const dessertPrice = isDessertAdded ? this.prices.dessert * 2 : 0;
                const drinkPrice = isDrinkAdded ? this.prices.drink * 2 : 0;
                return { price: 1440, dessertPrice, drinkPrice, profit: 0 };
            }

            const pricesForDiffDays = this.prices[tab][numDishes][daysSelection];
            const profit = numDays === '20' ? 4 * pricesForDiffDays['5'] - pricesForDiffDays['20'] : 0;
            const dessertPrice = isDessertAdded ? this.prices.dessert * this.getNumericNumDays(numDays, daysSelection) : 0;
            const drinkPrice = isDrinkAdded ? this.prices.drink * this.getNumericNumDays(numDays, daysSelection) : 0;
            let price = pricesForDiffDays[numDays];

            if (this.isPromocodeValid) {
                if (this.promocodeResults.type === 'percent') {
                    const minPriceConfig = this.getMinMaxPriceConfig(this.allConfigs, this.promocodeResults.promocode);
                    if (minPriceConfig === config) {
                        const coeff = 1 - this.promocodeResults.discount / 100;
                        price = Math.floor(price * coeff);
                    }
                } else if (index === 'current') {
                    price -= this.promocodeResults.discount;
                }
            }
            // ДЛЯ СКИДКИ ЗА 2+ НАБОРА
            // else if (this.savedConfigs.length) {
            //     const maxPriceConfig = this.getMinMaxPriceConfig(this.allConfigs, null, 'max');
            //     if (maxPriceConfig !== config) {
            //         price *= 0.9;
            //     }
            // }
            return { price, dessertPrice, drinkPrice, profit };
        },
        configToText: function(config = this.configuration) {
            const { tab, numDishes, daysSelection, numDays, isDessertAdded, isDrinkAdded } = config;
            return (`Рацион "${dict.menus[tab]}":` + 
                `${dict.numDishes[numDishes]}${isDessertAdded ? '+десерт' : ''}${isDrinkAdded ? '+напиток' : ''},` +
                `${dict.daysSelect[daysSelection][numDays]};`);
        },
    },
    computed: {
        allConfigs: function() { return [...this.savedConfigs, this.configuration]; },
        isPromocodeValid: function() {
            const code = this.promocodeResults.promocode;
            return !!(code && this.getAllValidConfigs(code, this.allConfigs).length);
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
            const { price: currentPrice, dessertPrice, drinkPrice } = current;
            price = price + currentPrice + dessertPrice + drinkPrice;
            profit += current.profit;
            this.savedConfigs.forEach((config, index) => {
                const configPrice = this.computePrice(config, index);
                price = price + configPrice.price + configPrice.dessertPrice + configPrice.drinkPrice;
                profit += configPrice.profit;
            });
            basketPrice = price;
            if (this.isPromocodeValid) {
                if (this.promocodeResults.type === 'percent') {
                    basketPrice = basketPrice / (1 - Number(this.promocodeResults.discount) / 100);
                } else {
                    basketPrice += this.promocodeResults.discount;
                }
            }
            let priceArr = String(price).split('');
            priceArr.splice(priceArr.length - 3, 0, ' ');
            return {
                price,
                basketPrice,
                profit,
                textPrice: `${priceArr.join('')} р`,
                textProfit: `Ваша выгода — ${profit} р`
            }
        },
        menuLink: function() {
            return this.menuLinks[this.configuration.tab];
        },
        orderLink: function() {
            const configs = this.allConfigs.reduce((text, config) => text += this.configToText(config), '');
            return `#order:${configs}=${this.totalPrice.basketPrice}`;
        },
        isMobile: function() {
            return /Mobi/i.test(window.navigator.userAgent);
        },
        isMobileSafari: function() {
            const isSafari = window.navigator.userAgent.indexOf("Safari") > -1;
            return this.isMobile && isSafari;
        },
        isCardAvailable: function() {
            const isAvanSaved =  this.savedConfigs.length && this.savedConfigs.find(config => config.tab === 'avan');
            return this.configuration.tryMode || this.configuration.tab === 'avan' || isAvanSaved;
        }
    }
};