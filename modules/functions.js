const cloudFunctionURL = 'https://functions.yandexcloud.net/d4e67srogrpsvi8csvc0';

export async function fetchQuestions(context) {
    let res;
    await fetch(cloudFunctionURL, {
        method: 'GET',
        redirect: 'follow'
    })
        .then(response => response.json())
        .then(result => res = result)
        .catch(error => {
            context.setErrorParams({
                status: 'error',
                title: 'Что-то пошло не так: не удалось загрузить тест.',
                text: 'Попробуйте еще раз или обратитесь за помощью.',
                optionBack: {
                    text: 'К началу теста'
                },
                optionForwards: null
            });
        });
    return res;
}

export function preformResults(context) {
    const answers = {};
    context.questions.forEach(question => {
        switch (question.type) {
            case 'input':
            case 'radio':
                answers[question.id] = question.res;
                break;
            case 'checkbox':
                answers[question.id] = [];
                question.options.forEach(option => {
                    answers[question.id].push(option.res);
                });
                break;
        }
    });
    return answers;
}

export async function fetchResults(answers) {
    return await fetch(cloudFunctionURL, {
        method: 'POST',
        body: JSON.stringify(answers),
        redirect: 'follow'
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
        return result;
    })
    .catch(error => console.log('error', error));
}