// import { fetchQuestions, preformResults, fetchResults } from './functions.js';
// import { loadCookies, saveCookies, unloadListener, showResults } from './utils.js';
// import { colorSchemes } from "./data.js";
import { fetchData } from './service.js';
import { pricesData } from './prices.js';

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
            promocode: '',
            promocodeResults: {
                code: 'ready',
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
            }
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
            }
        },
        isActive: function(parameter, value) {
            return this[parameter] === value;
        }
    },
    computed: {
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
                profit = `Ваша выгода — ${4 * pricesForDiffDays['5'] - pricesForDiffDays['20']} р/день `;
            }
            if (this.isDessertAdded) {
                price += 100;
            }
            if (this.discount) {
                if (discountType === 'percent') {
                    price = Math.floor(price * (1 - this.discount / 100));
                } else {
                    price -= this.discount;
                }
            }
            let priceArr = String(price).split('');
            priceArr.splice(priceArr.length - 3, 0, ' ');
            return {
                price: 13000,
                profit,
                textPrice: `${priceArr.join('')} р`
            }
        }
    }
};