import { taglinePics, daySwitchArrow, promocodePics, popupIcon } from './svgs.js';
import { taglineTexts, daysTexts, promoResultsTexts } from "./data.js";
import { getPromocodeResults } from './service.js';

let confLink = '#';
try {
    confLink = confidentialLink;
} catch(e) {
    console.log(e);
}

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

export const daySwitchComp = {
    props: ['day', 'set-value'],
    template: `
        <div class="daySwitch">
            <div class="button prev" v-on:click="prevDay" v-html="arrow"></div>
            <div class="text">{{ dayText }}</div>
            <div class="button next" v-on:click="nextDay" v-html="arrow"></div>
        </div>
    `,
    computed: {
        dayText: function() {
            return daysTexts.long[this.day];
        },
        arrow: () => daySwitchArrow
    },
    methods: {
        nextDay: function() {
            const newDay = this.day < 5 ? this.day + 1 : 0;
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
        picUrl: function() { return this.dishData.picUrl || window.location.toString() + '/../assets/1.png'; }
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
    template: `
        <div class="pics">
            <dish-example
                v-for="dish in dishes"
                :set-value="setValue"
                :dish-data="dish"
            ></dish-example>
        </div>
    `
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
    props: ['set-value'],
    data() {
        return {
            promocode: '',
            status: 'ready'
        }
    },
    template: `
        <div class="promo enter" :class="status">
            <input
                class="promocode"
                :class="{ 'bad': status === 'bad' }"
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
            this.status = 'ready';
        },
        promocodeKeydown: function (e) {
            if (e.key === 'Enter') {
                this.enterPromocode();
            } else {
                this.setValue('promocodeResults', 'ready', 'code');
                this.setValue('promocodeResults', null, 'type');
                this.setValue('promocodeResults', null, 'discount');
            }
        },
        enterPromocode: async function () {
            this.status = 'loading';
            const promoRes = await getPromocodeResults(this.promocode);
            this.status = promoRes.code;
            this.setValue('promocodeResults', promoRes.code, 'code');
            this.setValue('promocodeResults', promoRes.type, 'type');
            this.setValue('promocodeResults', promoRes.discount, 'discount');
        },
    },
    computed: {
        icon: function() {
            return promocodePics[this.status];
        },
        resultsText: function() {
            return promoResultsTexts[this.status] || '';
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
    data() {
        return {
            inputElem: null
        }
    },
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