import { faker } from '@faker-js/faker';
import random from 'random';
import { MongoClient } from 'mongodb';

const url = 'mongodb://admin:password@localhost:27017';
const client = new MongoClient(url);
const dbName = 'test';

var normal_rec = random.normal(1, 0.1);
var normal_send = random.normal(1, 0.1);

function gen_trx(date)  {
    let rec_index = Math.round(Math.abs(normal_rec())*companyCount) % companyCount;
    let send_index = Math.round(Math.abs(normal_send())*accountsCount) % accountsCount;
    let rec = companys[rec_index];
    let send = accounts[send_index];
    let amount = Math.round(Math.abs(random.normal(0, 0.1)())*1000000) / 100;
    return {
        date, rec, send, amount
    }
}

function insert_or_add(map, name) {
    if(map.has(name)) {
        let count = map.get(name);
        map.set(name, count + 1);
    } else {
        map.set(name, 1);
    }
}
// year, monthIndex, day, hour, minute, second
var startDate = [2024, 0, 1, 0, 0, 0];
var days = 90;
var trxPerDay = 10_000;
var accountsCount = 100_000;
var companyCount = 1000;

var accounts = faker.helpers.multiple(faker.finance.iban, {count: accountsCount});
var companys = faker.helpers.multiple(faker.finance.iban, {count: companyCount})

var trxs = [];
console.error("- created accounts and companies");

async function main() {
    // Use connect method to connect to the server
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
    const collection = db.collection('test');
    const collection_arr = db.collection('test_arr');
    for (let d = 0; d < days; d++) {
        console.error("- day %d", d);
        let today = new Date(startDate[0], startDate[1], startDate[2] + d, startDate[3], startDate[4], startDate[5]);
        let tomorrow = new Date(startDate[0], startDate[1], startDate[2] + d + 1, startDate[3], startDate[4], startDate[5]);

        console.error("- creating %d dates between %s -> %s", trxPerDay, today, tomorrow);
        var dates = faker.helpers.multiple(() => faker.date.between({from: today, to: tomorrow}), {count: trxPerDay});
        // console.error("- pre sort dates...");
        // dates = dates.sort((a,b) => b - a);
        console.error("- inserting %d dates", trxPerDay);
        for(let i = 0; i < trxPerDay; i++ ) {
            if(i % trxPerDay == 0) {
                console.error("%d", i*10000);
            }
            let trx = gen_trx(dates.pop());
            let doc = {
                ts: trx.date,
                a: trx.amount,
                s: trx.send,
                r: trx.rec
            };
            await collection.insertOne(doc);
            let find = {
                _id: trx.send,
            }
            let dataField = "data." + trx.rec;
            let update = {};
            update["$push"] = {};
            update["$push"][dataField] = [trx.date, trx.amount];
            await collection_arr.updateOne(find, update, {upsert: true});
        }
    }
    return 'done.';
}
  
main()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());


// let senders = new Map;
// let receivers = new Map;

// trxs.forEach(element => {
//     // insert or add to map
//     insert_or_add(senders, element.send);
//     insert_or_add(receivers, element.rec);
// });

// const sortedSenders = [...senders.entries()].sort((a, b) => b[1] - a[1]);
// const sortedReceivers  = [...receivers.entries()].sort((a, b) => b[1] - a[1]);

// console.log("receivers: %d", sortedReceivers.length);
// console.log("senders: %d", sortedSenders.length);

// let mostRecName = sortedReceivers[0];
// let mostSendName = sortedSenders[0];
// console.log("most received: %s", mostRecName[0]);
// console.log("most sent: %s", mostSendName[0]);
// let mostSendinRecIndex = sortedReceivers.findIndex(v => v[0] == mostSendName[0])
// console.log(mostSendinRecIndex);

// console.log(sortedSenders);
// console.log(sortedReceivers);



// trxs.forEach(element => {
//     console.log("%s,%s,%f", element.rec, element.send,element.amount)
// })