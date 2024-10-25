const { faker } = require('@faker-js/faker');

console.log("Generate 1.000.000 Accounts");

function account() {
    return {
        number: faker.finance.creditCardNumber()
    }
}

let accounts = faker.helpers.multiple(account, {count: 1_000_000});
