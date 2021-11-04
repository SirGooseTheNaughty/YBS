export async function fetchData () {
    let result = [];
    await fetch("https://store.tildacdn.com/api/getproductslist/?storepartuid=414267329441&recid=371213320&c=1635169225701&getparts=true&getoptions=true&slice=1&size=200", {
        "headers": {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        "method": "GET"
    })
    .then(res => res.json())
    .then(res => {
        result = res.products.map(dish => {
            const [ menu, day, index ] = dish.title.split('-');
            let picUrl = tildaPicUrl;
            const characteristics = { ccal: 0, prot: 0, fat: 0, carb: 0 };
            Object.keys(characteristics).forEach(key => {
                const property = dish.characteristics.find(car => car.title === key);
                if (property) {
                    characteristics[key] = property.value;
                }
            });
            if (dish.gallery) {
                try {
                    picUrl = JSON.parse(dish.gallery)[0].img;
                } catch (e) {
                    console.log(e);
                }
            }
            return {
                menu,
                day: Number(day) - 1,
                index: Number(index) - 1,
                name: dish.descr,
                picUrl,
                text: dish.text,
                weight: dish.pack_m,
                characteristics
            }
        });
    })
    .catch(e => {
        console.log(e);
        result = [];
    });
    return result;
}

async function fetchPromocode (code) {
    const res = await fetch("https://forms.tildacdn.com/payment/promocode/", {
        "headers": {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        "body": `promocode=${code}&projectid=${projectId}`,
        "method": "POST"
    });
    return res.json();
}

export async function getPromocodeResults (promocode) {
    const promoResult = {status: null, type: null, discount: null};
    const res = await fetchPromocode (promocode);
        if (res.message === 'OK') {
            promoResult.status = 'ok';
            if (res.discountpercent) {
                promoResult.type = 'persent';
                promoResult.discount = parseFloat(res.discountpercent);
            } else {
                promoResult.type = 'sum';
                promoResult.discount = parseFloat(res.discountsum);
            }
        } else {
            promoResult.status = 'bad';
        }
    return promoResult;
}