// import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.esm.browser.min.js'
import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.esm.browser.js';

import { appComp } from './modules/app.js';
import {
    tabComp, 
    tagLineComp, 
    numDishesComp, 
    daySwitchComp, 
    daysSelectionComp, 
    numDaysComp, 
    promocodeInputComp,
    paymentMethodComp,
    phoneInputComp,
    dishesExapmleComp,
    dishExampleComp,
    dishExamplePopup
} from './modules/components.js';

Vue.component('tab', tabComp);
Vue.component('tagline', tagLineComp);
Vue.component('num-dishes', numDishesComp);
Vue.component('day-switch', daySwitchComp);
Vue.component('dishes-example', dishesExapmleComp);
Vue.component('dish-example', dishExampleComp);
Vue.component('dish-popup', dishExamplePopup);
Vue.component('days-selection', daysSelectionComp);
Vue.component('num-days', numDaysComp);
Vue.component('promocode', promocodeInputComp);
Vue.component('payment-method', paymentMethodComp);
Vue.component('phone-input', phoneInputComp);

const app = new Vue(appComp);
try {
    if (globalApp) {
        globalApp = app;
    }
} catch (e) {};