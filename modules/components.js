import { taglinePics, daySwitchArrow, promocodePics, popupIcon, dessertPlus, dishExampleArrow, preCartItemCross, preCardPlus } from './svgs.js';
import { taglineTexts, daysTexts, promoResultsTexts, dessertLines, dict } from "./data.js";
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
    props: ['set-value', 'is-added', 'tab'],
    template: `
        <div class="dessert" :class="{ hidden: isHidden, added: isAdded }" v-on:click="toggle">
            <p>{{ text }}</p>
            <div class="dessert__plus">${dessertPlus}</div>
        </div>
    `,
    computed: {
        isHidden: function() {
            return this.tab === 'lite';
        },
        text: function() {
            return this.isAdded ? dessertLines.remove : dessertLines.add;
        }
    },
    methods: {
        toggle: function() {
            this.setValue('addDessert', !this.isAdded);
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
            <svg
                class="dishPopup__icon"
                width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                v-on:mouseenter="showPopup"
                v-on:mouseleave="hidePopup"
                v-on:click="showPopup"
            >
                <circle cx="8" cy="8" r="8" fill="#FFF7EC" fill-opacity="0.6"/>
                <path d="M7.51053 9.672C7.43053 9.672 7.36253 9.644 7.30653 9.588C7.25053 9.532 7.22253 9.464 7.22253 9.384V3.888C7.22253 
                3.808 7.25053 3.74 7.30653 3.684C7.36253 3.628 7.43053 3.6 7.51053 3.6H8.48253C8.57053 3.6 8.63853 3.628 8.68653 3.684C8.74253 
                3.732 8.77053 3.8 8.77053 3.888V9.384C8.77053 9.464 8.74253 9.532 8.68653 9.588C8.63853 9.644 8.57053 9.672 8.48253 
                9.672H7.51053ZM7.43853 12C7.35853 12 7.29053 11.972 7.23453 11.916C7.17853 11.86 7.15053 11.792 7.15053 11.712V10.596C7.15053 
                10.508 7.17853 10.436 7.23453 10.38C7.29053 10.324 7.35853 10.296 7.43853 10.296H8.55453C8.64253 10.296 8.71453 10.324 8.77053 
                10.38C8.82653 10.436 8.85453 10.508 8.85453 10.596V11.712C8.85453 11.792 8.82653 11.86 8.77053 11.916C8.71453 11.972 8.64253 
                12 8.55453 12H7.43853Z" fill="white"/>
            </svg>
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
            const { x, y, width, height } = e.target.getBoundingClientRect();
            this.setValue('dishPopupInfo', this.dishData.name, 'name');
            this.setValue('dishPopupInfo', this.dishData.weight, 'weight');
            this.setValue('dishPopupInfo', this.dishData.ing, 'ing');
            this.setValue('dishPopupInfo', x + width, 'x');
            this.setValue('dishPopupInfo', y + height, 'y');
            this.setValue('dishPopupInfo', true, 'isShown');
        },
        hidePopup: function() { this.setValue('dishPopupInfo', false, 'isShown'); }
    }
}

export const dishesExapmleComp = {
    props: ['set-value', 'dishes'],
    data() {
        return {
            x: 0,
            onBorder: 'left',
            isDrag: false
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
            >
                <div class="pics" v-bind:style="transformation" :class="{ smooth: !isDrag }">
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
    computed: {
        isOnLeft: function() {
            return this.onBorder === 'left';
        },
        isOnRight: function() {
            return this.onBorder === 'right';
        },
        transformation: function() {
            return { transform: `translateX(${this.x}px)` };
        },
        maxShift: function() {
            const allElements = this.$refs.cont.querySelectorAll('.dishPicCont');
            const lastElement = allElements[allElements.length - 1];
            return lastElement.offsetLeft + lastElement.offsetWidth - this.$refs.cont.offsetWidth;
        },
        dishElementWidth: function() {
            const elem = this.$refs.cont.querySelector('.dishPicCont');
            return elem ? elem.offsetWidth : 0;
        }
    },
    methods: {
        move: function(e) {
            if (this.isDrag) {
                this.x += e.movementX;
                if (this.x > 0) {
                    this.x = 0;
                    this.onBorder = 'left';
                } else if (Math.abs(this.x) > this.maxShift) {
                    this.x = -this.maxShift;
                    this.onBorder = 'right';
                } else {
                    this.onBorder = null;
                }
            }
        },
        addListener: function() {
            this.isDrag = true;
        },
        removeListener: function() {
            this.isDrag = false;
        },
        moveLeft: function() {
            this.x += this.dishElementWidth;
            if (this.x > 0) {
                this.x = 0;
                this.onBorder = 'left';
            } else {
                this.onBorder = null;
            }
        },
        moveRight: function() {
            this.x -= this.dishElementWidth;
            if (Math.abs(this.x) > this.maxShift) {
                this.x = -this.maxShift;
                this.onBorder = 'right';
            } else {
                this.onBorder = null;
            }
        }
    }
}

export const dishExamplePopup = {
    props: ['dish-data'],
    template: `
        <div class="dishPopup" :class="{ hidden: !dishData.isShown }" :style="getStyle">
            <div class="dishPopup__title">{{ dishData.name }}</div>
            <div class="dishPopup__weight">Вес: <span class="dishPopup__weightValue">{{ dishData.weight }} г</span></div>
            <div class="dishPopup__ing">Состав: <span class="dishPopup__ingValue">{{ dishData.ing }}</span></div>
        </div>
    `,
    computed: {
        getStyle: function() {
            return `top: ${this.dishData.y}px; left: ${this.dishData.x}px;`;
        }
    }
}

export const nutritionComp = {
    props: ['tab', 'num-dishes', 'day', 'is-dessert-added'],
    template: `
        <div class="nutrition">
            <div class="text">КБЖУ</div>
            <div class="values">{{ nutritionText }}</div>
        </div>
    `,
    computed: {
        nutritionText: function() {
            const data = nutritionValues[this.tab][this.numDishes][this.day];
            let [ ccal, prot, fat, carb] = data.split('/');
            if (this.isDessertAdded) {
                const dessertsData = nutritionValues[this.tab].desserts;
                const dessertData = dessertsData ? dessertsData[this.day] : null;
            }
            return `${ccal} ккал / Б: ${prot} / Ж: ${fat} / У: ${carb}`;
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
    props: ['text', 'subtext', 'value', 'get-is-active', 'set-value'],
    template: `
        <div class="numDays" :class="{ active: isActive }" v-on:click="onClick">
            <span class="numDay">{{ text }}</span>
            <span class="dayPrice">{{ subtext }}</span>
        </div>
    `,
    ...activityParams('numDays')
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
            }
        },
        enterPromocode: async function () {
            this.status = 'loading';
            this.setValue('promocodeResults', 'loading', 'status');
            const promoRes = await getPromocodeResults(this.promocode);
            this.setValue('promocodeResults', promoRes.status, 'status');
            this.setValue('promocodeResults', promoRes.type, 'type');
            this.setValue('promocodeResults', promoRes.discount, 'discount');
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