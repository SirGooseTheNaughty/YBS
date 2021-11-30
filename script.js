// import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.esm.browser.min.js'
import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.esm.browser.js';

import { appComp } from './modules/app.js';
import {
    tabComp, 
    tagLineComp, 
    numDishesComp,
    additiveComp,
    nutritionComp,
    daySwitchComp, 
    daysSelectionComp, 
    numDaysComp, 
    promocodeInputComp,
    preCartItemComp,
    preCartComp,
    paymentMethodComp,
    phoneInputComp,
    dishesExapmleComp,
    dishExampleComp,
    dishExamplePopup
} from './modules/components.js';

Vue.component('tab', tabComp);
Vue.component('tagline', tagLineComp);
Vue.component('num-dishes', numDishesComp);
Vue.component('additive', additiveComp);
Vue.component('nutrition', nutritionComp);
Vue.component('day-switch', daySwitchComp);
Vue.component('dishes-example', dishesExapmleComp);
Vue.component('dish-example', dishExampleComp);
Vue.component('dish-popup', dishExamplePopup);
Vue.component('days-selection', daysSelectionComp);
Vue.component('num-days', numDaysComp);
Vue.component('promocode', promocodeInputComp);
Vue.component('pre-cart-item', preCartItemComp);
Vue.component('pre-cart', preCartComp);
Vue.component('payment-method', paymentMethodComp);
Vue.component('phone-input', phoneInputComp);

const app = new Vue(appComp);
try {
    if (globalApp) {
        globalApp = app;
    }
} catch (e) {};
try {
    globalApp.setParameter('basket', basketId, 'selector');
    globalApp.connectBasket();
} catch(e) {
    console.error('Не задан селектор корзины');
}
try {
    if (tildaMenuLinks) {
        globalApp.setParameter('menuLinks', tildaMenuLinks.home, 'home');
        globalApp.setParameter('menuLinks', tildaMenuLinks.lite, 'lite');
        globalApp.setParameter('menuLinks', tildaMenuLinks.avan, 'avan');
    }
} catch (e) {};
try {
    if (preventOrder) {
        console.log('order is off');
        globalApp.setParameter('basket', true, 'preventOrder');
    }
} catch(e) {}
try {
    if (promoValues) {
        globalApp.setParameter('promoValues', promoValues);
    }
} catch(e) {}
try {
    if (pricesData) {
        globalApp.setParameter('prices', pricesData);
    }
} catch(e) {}
try {
    if (basketId) {
        document.querySelector(basketId).style.display = 'none';
    }
} catch(e) {}