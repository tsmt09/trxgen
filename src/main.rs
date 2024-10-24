use chrono::Days;
use fake::{Dummy, Fake};
use rand::{seq::IteratorRandom, Rng};
use rand_distr::{num_traits::ToPrimitive, Distribution, SkewNormal};
use serde::{Deserialize, Serialize};

static ACCOUNT_COUNT: usize = 10_000_000;
static DAYS: usize = 365;
static TRX_PER_DAY: usize = 150_000;

#[derive(Serialize, Deserialize)]
struct Record {
    timestamp: u64,
    amount: f32,
    sender: String,
    receiver: String,
}

fn main() {
    // create 100k fake accounts
    let mut accounts: Vec<String> = Vec::with_capacity(ACCOUNT_COUNT);
    for _ in 0..ACCOUNT_COUNT {
        accounts.push(fake::faker::creditcard::en::CreditCardNumber().fake());
    }
    let mut day = chrono::DateTime::parse_from_rfc3339("2024-01-01T00:00:00Z").unwrap();
    let mut rng = rand::thread_rng();
    for _ in 0..DAYS {
        let start = day.timestamp_millis().to_u64().unwrap();
        let next_day = day.checked_add_days(Days::new(1)).unwrap();
        let end = next_day.timestamp_millis().to_u64().unwrap();
        // println!(
        //     "From {} ({}) to {} ({})",
        //     day.to_rfc3339(),
        //     start,
        //     next_day.to_rfc3339(),
        //     end
        // );
        let mut records_today = Vec::with_capacity(TRX_PER_DAY);
        for _ in 0..TRX_PER_DAY {
            let record = Record {
                timestamp: rng.gen_range(start..end),
                amount: rng.gen_range(0.0..10_000_000.0),
                sender: accounts.iter().choose(&mut rng).unwrap().clone(),
                receiver: accounts.iter().choose(&mut rng).unwrap().clone(),
            };
            records_today.push(record);
        }
        records_today.sort_by(|a, b| b.timestamp.partial_cmp(&a.timestamp).unwrap());
        for _ in 0..TRX_PER_DAY {
            let record = records_today.pop();
            println!("{}", serde_json::to_string(&record).unwrap());
        }
        day = next_day;
    }
}
