const tagValues = [
    {
        tag: document.querySelector('[data-elem-id="1626103018866"]'),
        border: document.querySelector('[data-elem-id="1626103018863"]'),
        tab: 'home',
        numDishes: 'five',
        daysSelection: 'work',
        numDays: 'twenty',
    },
    {
        tag: document.querySelector('[data-elem-id="1626102705492"]'),
        border: document.querySelector('[data-elem-id="1626102653055"]'),
        tab: 'home',
        numDishes: 'four',
        daysSelection: 'work',
        numDays: 'five'
    },
    {
        tag: document.querySelector('[data-elem-id="1626102869134"]'),
        border: document.querySelector('[data-elem-id="1626102869130"]'),
        tab: 'home',
        numDishes: 'six',
        daysSelection: 'each',
        numDays: 'twenty'
    },
    {
        tag: document.querySelector('[data-elem-id="1626102942455"]'),
        border: document.querySelector('[data-elem-id="1626102942452"]'),
        tab: 'avan',
        numDishes: 'six',
        daysSelection: 'each',
        numDays: 'twenty'
    },
    {
        tag: document.querySelector('[data-elem-id="1626102910905"]'),
        border: document.querySelector('[data-elem-id="1626102910901"]'),
        tab: 'lite',
        numDishes: 'three',
        daysSelection: 'each',
        numDays: 'twenty'
    },
    {
        tag: document.querySelector('[data-elem-id="1626103086728"]'),
        border: document.querySelector('[data-elem-id="1626103086725"]'),
        tab: 'lite',
        numDishes: 'five',
        daysSelection: 'each',
        numDays: 'twenty'
    },
    {
        tag: document.querySelector('[data-elem-id="1626102765298"]'),
        border: document.querySelector('[data-elem-id="1626102765294"]'),
        tab: 'lite',
        numDishes: 'five',
        daysSelection: 'each',
        numDays: 'twenty'
    }
];

tagValues.forEach(value => {
    value.color = getComputedStyle(value.tag).color;
    value.tag.style.pointerEvents = 'none';
    value.border.style.cursor = 'pointer';
    value.border.addEventListener('click', function () {
        globalApp.setValue('configuration', value.tab, 'tab');
        globalApp.setValue('configuration', value.numDishes, 'numDishes');
        globalApp.setValue('configuration', value.daysSelection, 'daysSelection');
        globalApp.setValue('configuration', value.numDays, 'numDays');

        redrawTags(value);
    });
});

function redrawTags (clickedTag = null) {
    tagValues.forEach(value => {
        if (clickedTag && value === clickedTag) {
            value.border.firstElementChild.style.backgroundColor = value.color;
            value.tag.firstElementChild.style.color = 'white';
        } else {
            value.border.firstElementChild.style.backgroundColor = 'transparent';
            value.tag.firstElementChild.style.color = value.color;
        }
    });
}