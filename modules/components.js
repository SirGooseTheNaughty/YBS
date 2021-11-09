import { taglinePics, daySwitchArrow, promocodePics, popupIcon, dessertPlus, dishExampleArrow, preCartItemCross, preCardPlus, picsLoader } from './svgs.js';
import { taglineTexts, daysTexts, promoResultsTexts, dessertLines, dict } from "./data.js";
import { pricesData } from './prices.js';
import { getPromocodeResults } from './service.js';
import { nutritionValues } from './nutritionData.js';

const activityParams = (param) => ({
    computed: {
        isActive: function() {
            return this.getIsActive(param, this.value);
        }
    },
    methods: {
        onClick: function() {
            this.setValue(param, this.value);
        }
    }
})

export const tabComp = {
    props: ['title', 'value', 'get-is-active', 'set-value'],
    template: `
        <div class="tab" :class="{ active: isActive }" v-on:click="onClick">{{ title }}</div>
    `,
    ...activityParams('tab')
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
    ...activityParams('numDishes')
}

export const dessertComp = {
    props: ['set-value', 'is-added'],
    template: `
        <div class="dessert" :class="{ added: isAdded }" v-on:click="toggle">
            <p>{{ text }}</p>
            <div class="dessert__plus">${dessertPlus}</div>
        </div>
    `,
    computed: {
        text: function() {
            return this.isAdded ? dessertLines.remove : dessertLines.add;
        }
    },
    methods: {
        toggle: function() {
            this.setValue('isDessertAdded', !this.isAdded);
            if (!this.isAdded) {
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
            const { x, y, width, right } = e.target.getBoundingClientRect();
            const xWithCheck = right + 190 > $(window).width() ? x - 190 : x + width;
            this.setValue('dishPopupInfo', this.dishData.name, 'name');
            this.setValue('dishPopupInfo', this.dishData.weight, 'weight');
            this.setValue('dishPopupInfo', this.dishData.text, 'text');
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
            this.onBorder = 'left'
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
            <div class="dishPopup__weight">Вес: <span class="dishPopup__weightValue">{{ dishData.weight }} г</span></div>
            <div class="dishPopup__ing">Состав: <span class="dishPopup__ingValue">{{ dishData.text }}</span></div>
        </div>
    `,
    computed: {
        getStyle: function() {
            return `top: ${this.dishData.y}px; left: ${this.dishData.x}px;`;
        }
    }
}

export const nutritionComp = {
    props: ['tab', 'num-dishes', 'day', 'is-dessert-added', 'dishes'],
    template: `
        <div class="nutrition">
            <div class="text">КБЖУ</div>
            <div class="values">{{ nutritionText }}</div>
        </div>
    `,
    computed: {
        nutritionText: function() {
            const dayData = nutritionValues[this.tab][this.numDishes][this.day];
            let [ccal, prot, fat, carb] = dayData.split('/');
            if (this.isDessertAdded) {
                const dessertData = nutritionValues[this.tab].desserts[this.day];
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
    ...activityParams('daysSelection')
}

export const numDaysComp = {
    props: ['value', 'tab', 'num-dishes', 'days-selection', 'get-is-active', 'set-value'],
    template: `
        <div class="numDays" :class="{ active: isActive }" v-on:click="onClick">
            <span class="numDay">{{ numDays }}</span>
            <span class="dayPrice">{{ subtext }}</span>
        </div>
    `,
    computed: {
        isActive: function() {
            return this.getIsActive('numDays', this.value);
        },
        numDays: function() {
            if (this.value == 5) {
                return this.daysSelection === 'work' ? 5 : 7;
            }
            return this.daysSelection === 'work' ? 20 : 28;
        },
        subtext: function() {
            return `(${this.getOneDayPrice(this.numDays)} р/день)`;
        }
    },
    methods: {
        onClick: function() {
            this.setValue('numDays', this.value);
        },
        getOneDayPrice: function(days) {
            const price = pricesData[this.tab][this.numDishes][this.daysSelection][this.value]
            return Math.floor((Number(price) / days));
        }
    }
}

export const promocodeInputComp = {
    props: ['set-value', 'promocode-results', 'saved-configs'],
    data() {
        return {
            promocode: ''
        }
    },
    template: `
        <div class="promo enter" :class="resultStatus">
            <input
                class="promocode"
                :class="{ 'bad': resultStatus === 'bad' }"
                type="text"
                placeholder="Введите промокод"
                v-on:input="inputPromocode"
                v-on:keydown="promocodeKeydown"
            ></input>
            <div class="promo__pic" v-html="icon" v-on:click="enterPromocode"></div>
            <div class="promo__status">{{ resultsText }}</div>
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
            this.setValue('promocodeResults', promoRes.type, 'type');
            this.setValue('promocodeResults', promoRes.discount, 'discount');
            if (promoRes.status === 'ok') {
                this.setValue('promocodeResults', this.promocode, 'promocode');
            } else {
                this.setValue('promocodeResults', null, 'promocode');
            }
        },
    },
    computed: {
        resultStatus: function() {
            if (this.promocodeResults.status === 'ok') {
                return this.promocodeResults.status;
            }
            return this.savedConfigs.length ? 'special' : this.promocodeResults.status;
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
        }
    }
}

export const preCartItemComp = {
    props: ['text', 'index', 'delete-config'],
    template: `
        <div class="pre-cart__item">
            <p>{{ text }}</p>
            <div v-if="deleteConfig" class="cross" v-on:click="remove">${preCartItemCross}</div>
        </div>
    `,
    methods: {
        remove: function() {
            this.deleteConfig(this.index)
        }
    }
}

export const preCartComp = {
    props: ['tab', 'is-dessert-added', 'num-dishes', 'num-days', 'days-selection', 'price', 'saved-configs', 'add-config', 'delete-config'],
    template: `
        <div class="pre-cart">
            <pre-cart-item
                v-for="(config, index) in savedConfigs"
                :text="getItemText(config)"
                :index="index"
                :key="configKey"
                :delete-config="deleteConfig"
            ></pre-cart-item>
            <pre-cart-item :text="currentText" key="current"></pre-cart-item>
            <div class="pre-cart__add" v-on:click="addConfig">
                <div class="plus">${preCardPlus}</div>
                <p>Добавить рацион</p>
            </div>
        </div>
    `,
    computed: {
        currentText: function() {
            return `
                Рацион "${dict.menus[this.tab]}":
                ${dict.numDishes[this.numDishes]}${this.isDessertAdded ? '+десерт' : ''},
                ${dict.daysSelect[this.daysSelection][this.numDays]} — ${this.price}
            `;
        },
        configKey: function() {
            return JSON.stringify(this.config);
        }
    },
    methods: {
        getItemText: function(config) {
            return `
                Рацион "${dict.menus[config.tab]}":
                ${dict.numDishes[config.numDishes]}${config.isDessertAdded ? '+десерт' : ''},
                ${dict.daysSelect[config.daysSelection][config.numDays]} — ${config.price.textPrice}
            `;
        }
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