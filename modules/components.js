import { taglinePics, daySwitchArrow, promocodePics, popupIcon, dessertPlus, dishExampleArrow, preCartItemCross, preCardPlus, picsLoader } from './svgs.js';
import { taglineTexts, daysTexts, promoResultsTexts, additiveLines, dict, preCardAdditives } from "./data.js";
import { getPromocodeResults } from './service.js';
import { nutritionValues } from './nutritionData.js';

const activityParams = (param, subParam = null) => ({
    computed: {
        isActive: function() {
            return this.getIsActive(param, this.value, subParam);
        }
    },
    methods: {
        onClick: function() {
            this.setValue(param, this.value, subParam);
        }
    }
})

export const tabComp = {
    props: ['title', 'value', 'get-is-active', 'set-value'],
    template: `
        <div class="tab" :class="{ active: isActive }" v-on:click="onClick">{{ title }}</div>
    `,
    ...activityParams('configuration', 'tab')
}

export const tagLineComp = {
    props: ['tab'],
    template: `
        <div class="tagline">
            <div class="taglinePic" v-html="svg"></div>
            <p>{{ text }}</p>
        </div>
    `,
    computed: {
        text: function() {
            return taglineTexts[this.tab];
        },
        svg: function() {
            return taglinePics[this.tab];
        }
    }
}

export const numDishesComp = {
    props: ['title', 'value', 'get-is-active', 'set-value'],
    template: `
        <div class="dish" :class="{ active: isActive }" v-on:click="onClick">{{ title }}</div>
    `,
    ...activityParams('configuration', 'numDishes'),
    methods: {
        onClick: function() {
            this.setValue('configuration', this.value, 'numDishes');
            this.setValue('dishesX', 0);
        }
    }
}

export const additiveComp = {
    props: ['param', 'text', 'subtext', 'set-value', 'configuration'],
    template: `
        <div class="additive" :class="{ added: isAdded }" v-on:click="toggle">
            <div class="additive__label">
                <p>{{ totalText }}</p>
                <p v-if="!isAdded">{{ subtext }}</p>
            </div>
            <div class="additive__plus">${dessertPlus}</div>
        </div>
    `,
    computed: {
        totalText: function() {
            return (this.isAdded ? additiveLines.remove : additiveLines.add) + this.text;
        },
        isAdded: function() {
            return this.configuration[this.param];
        }
    },
    methods: {
        toggle: function() {
            this.setValue('configuration', !this.isAdded, this.param);
            if (this.isAdded) {
                this.setValue('dishesX', 'max');
            } else {
                this.setValue('dishesX', 'min');
            }
        }
    }
}

export const daySwitchComp = {
    props: ['day', 'set-value'],
    template: `
        <div class="daySwitch">
            <div class="button prev" v-on:click="prevDay" v-html="arrow"></div>
            <div class="text day-full">{{ dayText }}</div>
            <div class="text day-short">{{ dayShortText }}</div>
            <div class="button next" v-on:click="nextDay" v-html="arrow"></div>
        </div>
    `,
    computed: {
        dayText: function() {
            return daysTexts.long[this.day];
        },
        dayShortText: function() {
            return daysTexts.short[this.day];
        },
        arrow: () => daySwitchArrow
    },
    methods: {
        nextDay: function() {
            const newDay = this.day < 6 ? this.day + 1 : 0;
            this.setValue('day', newDay);
        },
        prevDay: function() {
            const newDay = this.day > 0 ? this.day - 1 : 6;
            this.setValue('day', newDay);
        },
    }
}

export const dishExampleComp = {
    props: ['set-value', 'dish-data'],
    template: `
        <div class="dishPicCont">
            <div  v-on:mouseenter="showPopup" v-on:mouseleave="hidePopup" v-on:click="showPopup">${popupIcon}</div>
            <img
                :src="picUrl"
                alt="dish example"
                class="pic"
            >
        </div>
    `,
    computed: {
        picUrl: function() { return this.dishData.picUrl; }
    },
    methods: {
        showPopup: function(e) {
            e.stopPropagation();
            const { x, width, right } = e.target.getBoundingClientRect();
            const y = $(e.target).offset().top;
            const xWithCheck = right + 190 > $(window).width() ? x - 190 : x + width;
            Object.entries(this.dishData).forEach(([key, val]) => this.setValue('dishPopupInfo', val, key));
            this.setValue('dishPopupInfo', xWithCheck, 'x');
            this.setValue('dishPopupInfo', y, 'y');
            this.setValue('dishPopupInfo', true, 'isShown');
        },
        hidePopup: function() { this.setValue('dishPopupInfo', false, 'isShown'); }
    }
}

export const dishesExapmleComp = {
    props: ['set-value', 'dishes', 'x'],
    data() {
        return {
            onBorder: 'left',
            isDrag: false,
            maxShift: 0,
            touchX: null
        }
    },
    template: `
        <div class="pics__container" :class="{ onLeft: isOnLeft, onRight: isOnRight }">
            <div
                ref="cont"
                v-on:mousedown="addListener"
                v-on:mouseup="removeListener"
                v-on:mouseleave="removeListener"
                v-on:mousemove="move"
                v-on:touchstart="addListener"
                v-on:touchend="removeListener"
                v-on:touchcancel="removeListener"
                v-on:touchmove="touchmove"
            >
                <div v-if="!dishes.length" class="pics__loader">${picsLoader}</div>
                <div v-if="dishes.length" class="pics" v-bind:style="transformation" :class="{ smooth: !isDrag }">
                    <dish-example
                        v-for="dish in dishes"
                        :set-value="setValue"
                        :dish-data="dish"
                    ></dish-example>
                </div>
            </div>
            <div class="dishExampleArrow dishExampleArrow-left" :class="{ hidden: isOnLeft }" v-on:click="moveLeft">${dishExampleArrow}</div>
            <div class="dishExampleArrow dishExampleArrow-right" :class="{ hidden: isOnRight }" v-on:click="moveRight">${dishExampleArrow}</div>
        </div>
    `,
    updated: function() {
        const allElements = this.$refs.cont.querySelectorAll('.dishPicCont');
        if (allElements.length) {
            const lastElement = allElements[allElements.length - 1];
            this.maxShift = lastElement.offsetLeft + lastElement.offsetWidth - this.$refs.cont.offsetWidth;
        }
        if (this.x === 0) {
            this.onBorder = 'left';
        }
        if (this.x === 'max' || (this.onBorder === 'right' && this.x === 'min')) {
            this.onBorder = 'right';
            this.setValue('dishesX', -this.maxShift);
        }
    },
    computed: {
        isOnLeft: function() {
            return this.onBorder === 'left' || this.x === 0;
        },
        isOnRight: function() {
            return this.onBorder === 'right' && this.x !== 0;
        },
        transformation: function() {
            return { transform: `translateX(${this.x}px)` };
        },
        dishElementWidth: function() {
            const elem = this.$refs.cont.querySelector('.dishPicCont');
            return elem ? elem.offsetWidth : 0;
        }
    },
    methods: {
        move: function(e) {
            if (this.isDrag) {
                let newX = this.x + e.movementX;
                if (newX > 0) {
                    newX = 0;
                    this.onBorder = 'left';
                } else if (Math.abs(newX) > this.maxShift) {
                    newX = -this.maxShift;
                    this.onBorder = 'right';
                } else {
                    this.onBorder = null;
                }
                this.setValue('dishesX', newX);
            }
        },
        touchmove: function(e) {
            if (this.isDrag) {
                e.preventDefault();
                const diffX = e.targetTouches[0].screenX - this.touchX;
                let newX = this.x + diffX;
                if (newX > 0) {
                    newX = 0;
                    this.onBorder = 'left';
                } else if (Math.abs(newX) > this.maxShift) {
                    newX = -this.maxShift;
                    this.onBorder = 'right';
                } else {
                    this.onBorder = null;
                }
                this.setValue('dishesX', newX);
                this.touchX = e.targetTouches[0].screenX;
            }
        },
        addListener: function(e) {
            this.isDrag = true;
            if (e.targetTouches && e.targetTouches[0]) {
                this.touchX = e.targetTouches[0].screenX;
            }
        },
        removeListener: function() {
            this.isDrag = false;
        },
        moveLeft: function() {
            let newX = this.x + this.dishElementWidth;
            if (newX > 0) {
                newX = 0;
                this.onBorder = 'left';
            } else {
                this.onBorder = null;
            }
            this.setValue('dishesX', newX);
        },
        moveRight: function() {
            let newX = this.x - this.dishElementWidth;
            if (Math.abs(newX) > this.maxShift) {
                newX = -this.maxShift;
                this.onBorder = 'right';
            } else {
                this.onBorder = null;
            }
            this.setValue('dishesX', newX);
        }
    }
}

export const dishExamplePopup = {
    props: ['dish-data'],
    template: `
        <div class="dishPopup" :class="{ hidden: !dishData.isShown }" :style="getStyle">
            <div class="dishPopup__title">{{ dishData.name }}</div>
            <div v-if="!dishData.drinkOptions" class="dishPopup__weight">Вес: <span class="dishPopup__weightValue">{{ dishData.weight }} г</span></div>
            <div v-if="!dishData.drinkOptions" class="dishPopup__ing">Состав: <span class="dishPopup__ingValue">{{ dishData.text }}</span></div>
            <div v-if="dishData.drinkOptions" class="dishPopup__drinks">
                <p v-for="option in dishData.drinkOptions" class="dishPopup__ingValue">{{ option }}</p>
            </div>
        </div>
    `,
    computed: {
        getStyle: function() {
            return `top: ${this.dishData.y}px; left: ${this.dishData.x}px;`;
        }
    }
}

export const nutritionComp = {
    props: ['configuration', 'day'],
    template: `
        <div class="nutrition">
            <div class="text">КБЖУ</div>
            <div class="values">{{ nutritionText }}</div>
        </div>
    `,
    computed: {
        nutritionText: function() {
            const { tab, numDishes, isDessertAdded } = this.configuration;
            const dayData = nutritionValues[tab][numDishes][this.day];
            let [ccal, prot, fat, carb] = dayData.split('/');
            if (isDessertAdded) {
                const dessertData = nutritionValues[tab].desserts[this.day];
                const [dccal, dprot, dfat, dcarb] = dessertData.split('/');
                ccal = Number(ccal) + Number(dccal);
                prot = Number(prot) + Number(dprot);
                fat = Number(fat) + Number(dfat);
                carb = Number(carb) + Number(dcarb);
            }
            return `${ccal} ккал / Б: ${prot} / Ж: ${fat} / У: ${carb}`;
            
            //  ЕСЛИ КОГДА-ТО ЗНАЧЕНИЯ БУДУТ В ИНФЕ О БЛЮДАХ
            // const values = {ccal: 0, prot: 0, fat: 0, carb: 0 };
            // this.dishes.forEach(dish => {
            //     Object.keys(values).forEach(key => {
            //         values[key] += Number(dish.characteristics[key]);
            //     })
            // });
            // return `${values.ccal} ккал / Б: ${values.prot} / Ж: ${values.fat} / У: ${values.carb}`;
        }
    }
}

export const daysSelectionComp = {
    props: ['text', 'subtext', 'value', 'get-is-active', 'set-value'],
    template: `
        <div class="day" :class="{ active: isActive }" v-on:click="onClick">{{ text }}</div>
    `,
    ...activityParams('configuration', 'daysSelection')
}

export const numDaysComp = {
    props: ['value', 'configuration', 'get-is-active', 'set-value', 'prices'],
    template: `
        <div class="numDays" :class="{ active: isActive }" v-on:click="onClick">
            <span class="numDay">{{ numDays }}</span>
            <span class="dayPrice">{{ subtext }}</span>
        </div>
    `,
    computed: {
        isActive: function() {
            return this.getIsActive('configuration', this.value, 'numDays');
        },
        numDays: function() {
            if (this.value == 5) {
                return this.configuration.daysSelection === 'work' ? 5 : 7;
            }
            return this.configuration.daysSelection === 'work' ? 20 : 28;
        },
        subtext: function() {
            return `(${this.getOneDayPrice(this.numDays)} р/день)`;
        },
        numDaysPrice: function() {
            const { tab, numDishes, daysSelection } = this.configuration;
            return this.prices[tab][numDishes][daysSelection][this.value]
        }
    },
    methods: {
        onClick: function() {
            this.setValue('configuration', this.value, 'numDays');
        },
        getOneDayPrice: function(days) {
            let dayPrice = Math.floor((Number(this.numDaysPrice) / days));
            if (this.configuration.isDessertAdded) {
                dayPrice += this.prices.dessert;
            }
            if (this.configuration.isDrinkAdded) {
                dayPrice += this.prices.drink;
            }
            return dayPrice;
        }
    }
}

export const promocodeInputComp = {
    props: ['set-value', 'promocode-results', 'saved-configs', 'is-promocode-valid'],
    data() {
        return {
            promocode: ''
        }
    },
    template: `
        <div class="promo enter" :class="resultStatus">
            <input
                class="promocode"
                :class="{ 'bad': resultStatus === 'bad' || resultStatus === 'strict' }"
                type="text"
                :placeholder="placeholder"
                v-on:input="inputPromocode"
                v-on:keydown="promocodeKeydown"
            ></input>
            <div class="promo__pic" v-html="icon" v-on:click="enterPromocode"></div>
            <div class="promo__status">{{ resultsText }}</div>
            <div v-if="specialDiscountApplied" class="promo__status special">Применена скидка 10% на дополнительные рационы</div>
        </div>
    `,
    methods: {
        inputPromocode: function (e) {
            this.promocode = e.target.value.toLowerCase();
            this.setValue('promocodeResults', 'ready', 'status');
        },
        promocodeKeydown: function (e) {
            if (e.key === 'Enter') {
                this.enterPromocode();
            } else {
                this.setValue('promocodeResults', 'ready', 'status');
                this.setValue('promocodeResults', null, 'type');
                this.setValue('promocodeResults', null, 'discount');
                this.setValue('promocodeResults', null, 'promocode');
            }
        },
        enterPromocode: async function () {
            this.status = 'loading';
            this.setValue('promocodeResults', 'loading', 'status');
            const promoRes = await getPromocodeResults(this.promocode);
            this.setValue('promocodeResults', promoRes.status, 'status');
            if (promoRes.status === 'ok') {
                this.setValue('promocodeResults', this.promocode, 'promocode');
                this.setValue('promocodeResults', promoRes.type, 'type');
                this.setValue('promocodeResults', promoRes.discount, 'discount');
            } else {
                this.setValue('promocodeResults', null, 'promocode');
            }
        },
    },
    computed: {
        resultStatus: function() {
            if (this.promocodeResults.promocode && !this.isPromocodeValid) {
                return 'strict';
            }
            return this.promocodeResults.status;
        },
        icon: function() {
            return promocodePics[this.resultStatus];
        },
        resultsText: function() {
            const text = promoResultsTexts[this.resultStatus];
            if (typeof text === 'function') {
                return text(this.promocodeResults.type, this.promocodeResults.discount);
            }
            return text || '';
        },
        placeholder: function() {
            return this.savedConfigs.length ? 'ДВАРАЦИОНА' : 'Введите промокод';
        },
        specialDiscountApplied: function() {
            return !this.isPromocodeValid && this.savedConfigs.length;
        }
    }
}

export const preCartItemComp = {
    props: ['config', 'index', 'price', 'delete-config'],
    template: `
        <div class="pre-cart__config">
            <div class="pre-cart__item pre-cart__menu">
                <div class="pre-cart__item-value">
                    <p>{{ text }}</p>
                    <p class="pre-cart__item-price">{{ price.price + 'р' }}</p>
                </div>
                <div v-if="config.isDessertAdded" class="pre-cart__item-value">
                    <p>${preCardAdditives.dessert}</p>
                    <p class="pre-cart__item-price">{{ price.dessertPrice + 'р' }}</p>
                </div>
                <div v-if="config.isDrinkAdded" class="pre-cart__item-value">
                    <p>${preCardAdditives.drink}</p>
                    <p class="pre-cart__item-price">{{ price.drinkPrice + 'р' }}</p>
                </div>
            </div>
            <div v-if="deleteConfig" class="cross" v-on:click="remove">${preCartItemCross}</div>
        </div>
    `,
    computed: {
        text: function() {
            const { tab, numDishes, daysSelection, numDays } = this.config;
            return `Рацион "${dict.menus[tab]}": ${dict.numDishes[numDishes]}, ${dict.daysSelect[daysSelection][numDays]}`;
        },
    },
    methods: {
        remove: function() {
            this.deleteConfig(this.index)
        },
    }
}

export const preCartComp = {
    props: ['configuration', 'saved-configs', 'add-config', 'delete-config', 'promocode-results', 'compute-price'],
    template: `
        <div class="pre-cart">
            <pre-cart-item
                v-for="(config, index) in savedConfigs"
                :config="config"
                :price="computePrice(config, index)"
                :index="index"
                :key="index"
                :delete-config="deleteConfig"
            ></pre-cart-item>
            <pre-cart-item
                :config="configuration"
                :price="computePrice(configuration, 'current')"
                index="current"
                key="current"
                :delete-config="deleteCurrent"
            ></pre-cart-item>
            <div class="pre-cart__add" v-on:click="addConfig">
                <div class="plus">${preCardPlus}</div>
                <p>Добавить рацион</p>
            </div>
        </div>
    `,
    computed: {
        configKey: function() {
            return JSON.stringify(this.config);
        },
        deleteCurrent: function() {
            if (this.savedConfigs.length) {
                return () => this.deleteConfig('current');
            }
            return null
        },
    }
}

export const paymentMethodComp = {
    props: ['text', 'value', 'get-is-active', 'set-value'],
    template: `
        <div class="paymentMethod" :class="{ checked: isActive }" v-on:click="onClick">{{ text }}</div>
    `,
    ...activityParams('payment')
}

export const phoneInputComp = {
    props: ['set-value'],
    template: `
        <input 
            class="phone" 
            type="text" 
            placeholder="Введите номер + 7 (...) ... ...."
            v-on:keydown="inputPhone"
        ></input>
    `,
    mounted() {
        const app = this;
        $('.phone').inputmask("+7 (999) 999-99-99", {
            oncomplete: function (e) {
                app.setValue('phone', e.target.value.toLowerCase());
            }
        });
    },
    methods: {
        inputPhone: function (e) {
            setTimeout(() => {
                if (e.target.value.includes('_')) {
                    this.setValue('phone', '');
                }
            });
        },
    }
}

export const tryButtonComp = {
    props: ["checked", "toggle", "class-name"],
    template: `
        <button class="try-mode" :class="classNames" v-on:click="toggle">
            <p class="try-mode__main">ПОПРОБОВАТЬ ЗА 1440 Р</p>
            <p class="try-mode__secondary">5 блюд на 2 дня</p>
            <div class="try-mode__icon"></div>
            <svg class="try-mode__checkmark" width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="33" height="33" rx="16.5" fill="#74BA67"/>
                <path d="M10 14.7692L15.3182 21L23 12" stroke="#FFF7EC" stroke-width="2" stroke-linecap="round" stroke-linejoin="bevel"/>
            </svg>
            <div v-html="fingerIcon"></div>
        </button>
    `,
    computed: {
        classNames: function() {
            console.log(this.className);
            return {
                [this.className]: true,
                "enabled": this.checked
            }
        },
        fingerIcon: function() {
            if (this.className === 'mobile' && !this.checked) {
                return `
                    <div class="try-mode__finger">
                        <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="15.5" cy="15.5" r="1.5" fill="#FFF7EC"/>
                            <circle cx="15.5" cy="15.5" r="7" stroke="#FFF7EC" stroke-opacity="0.8"/>
                            <circle cx="15.5" cy="15.5" r="15" stroke="#FFF7EC" stroke-opacity="0.5"/>
                        </svg>

                        <div class="try-mode__finger-icon"></div>
                    </div>
                `;
            }
        }
    }
}