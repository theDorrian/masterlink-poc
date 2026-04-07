require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const db = require('./database');

console.log('🌱 Seeding MasterLink database...');

// Clear existing data
db.exec(`
  DELETE FROM reviews;
  DELETE FROM job_requests;
  DELETE FROM tradesman_profiles;
  DELETE FROM users;
`);

const hashPassword = (pwd) => bcrypt.hashSync(pwd, 10);

// --- Users ---
const insertUser = db.prepare(`
  INSERT INTO users (name, email, password_hash, role, avatar_url)
  VALUES (@name, @email, @password_hash, @role, @avatar_url)
`);

// 2 customers
const alice = insertUser.run({
  name: 'Alice Thompson',
  email: 'alice@example.com',
  password_hash: hashPassword('password123'),
  role: 'customer',
  avatar_url: null,
});
const bob = insertUser.run({
  name: 'Bob Williams',
  email: 'bob@example.com',
  password_hash: hashPassword('password123'),
  role: 'customer',
  avatar_url: null,
});

// 8 tradesmen
const tradsemenData = [
  { name: 'Mike Johnson',   email: 'mike.j@example.com',  trade: 'Plumber',      city: 'London',      lat: 51.5074, lng: -0.1278, rate: 75, cof: 50, rating: 4.8, reviews: 120, avail: 1, exp: 12, bio: 'Master Plumber with 12 years experience. Specialising in emergency repairs and bathroom installations.' },
  { name: 'David Chen',     email: 'david.c@example.com', trade: 'Electrician',  city: 'London',      lat: 51.5200, lng: -0.1000, rate: 80, cof: 60, rating: 4.9, reviews: 94,  avail: 1, exp: 8,  bio: 'Certified electrician, domestic & commercial. Available for same-day call-outs.' },
  { name: 'Robert Smith',   email: 'robert.s@example.com',trade: 'Carpenter',    city: 'London',      lat: 51.4900, lng: -0.1500, rate: 65, cof: 40, rating: 4.7, reviews: 215, avail: 0, exp: 15, bio: 'Expert carpenter crafting bespoke furniture, decking, and full room renovations.' },
  { name: 'Sarah O\'Brien', email: 'sarah.o@example.com', trade: 'Electrician',  city: 'Manchester',  lat: 53.4808, lng: -2.2426, rate: 85, cof: 55, rating: 4.3, reviews: 67,  avail: 0, exp: 6,  bio: 'Fully qualified electrician. Domestic rewires, consumer units, and EV charger installations.' },
  { name: 'Tom Murphy',     email: 'tom.m@example.com',   trade: 'Plumber',      city: 'Manchester',  lat: 53.4900, lng: -2.2300, rate: 65, cof: 45, rating: 4.5, reviews: 88,  avail: 1, exp: 10, bio: 'Reliable and affordable plumbing for the Manchester area. No job too small.' },
  { name: 'Aisha Patel',    email: 'aisha.p@example.com', trade: 'Painter',      city: 'London',      lat: 51.5100, lng: -0.0900, rate: 45, cof: 30, rating: 4.6, reviews: 143, avail: 1, exp: 7,  bio: 'Interior and exterior painting with attention to detail. Free quotations available.' },
  { name: 'Lucas Ferrari',  email: 'lucas.f@example.com', trade: 'Carpenter',    city: 'Birmingham',  lat: 52.4862, lng: -1.8904, rate: 70, cof: 50, rating: 4.1, reviews: 52,  avail: 1, exp: 5,  bio: 'Carpenter specialising in fitted kitchens, wardrobes, and loft conversions.' },
  { name: 'Yuki Tanaka',    email: 'yuki.t@example.com',  trade: 'Painter',      city: 'London',      lat: 51.4800, lng: -0.1200, rate: 50, cof: 35, rating: 3.9, reviews: 38,  avail: 0, exp: 3,  bio: 'Painting and decorating specialist. Wallpaper hanging, coving, and feature walls.' },
];

const insertProfile = db.prepare(`
  INSERT INTO tradesman_profiles (user_id, trade, hourly_rate, call_out_fee, bio, city, latitude, longitude, avg_rating, review_count, is_available, years_experience)
  VALUES (@user_id, @trade, @hourly_rate, @call_out_fee, @bio, @city, @lat, @lng, @avg_rating, @review_count, @is_available, @years_experience)
`);

const tradesmanIds = [];
for (const t of tradsemenData) {
  const userRow = insertUser.run({
    name: t.name,
    email: t.email,
    password_hash: hashPassword('password123'),
    role: 'tradesman',
    avatar_url: null,
  });
  insertProfile.run({
    user_id: userRow.lastInsertRowid,
    trade: t.trade,
    hourly_rate: t.rate,
    call_out_fee: t.cof,
    bio: t.bio,
    city: t.city,
    lat: t.lat,
    lng: t.lng,
    avg_rating: t.rating,
    review_count: t.reviews,
    is_available: t.avail,
    years_experience: t.exp,
  });
  tradesmanIds.push(userRow.lastInsertRowid);
}

// --- Job Requests ---
const insertJob = db.prepare(`
  INSERT INTO job_requests (customer_id, tradesman_id, title, description, address, city, urgency, offered_fee, status, photos_json)
  VALUES (@customer_id, @tradesman_id, @title, @description, @address, @city, @urgency, @offered_fee, @status, @photos_json)
`);

const job1 = insertJob.run({
  customer_id: alice.lastInsertRowid,
  tradesman_id: tradesmanIds[0], // Mike Johnson
  title: 'Leaking pipe under kitchen sink',
  description: 'The pipe under the kitchen sink has been dripping for 2 days. Water damage starting on cabinet floor.',
  address: '14 Baker Street, Apt 3',
  city: 'London',
  urgency: 'emergency',
  offered_fee: 120,
  status: 'accepted',
  photos_json: '[]',
});

const job2 = insertJob.run({
  customer_id: alice.lastInsertRowid,
  tradesman_id: tradesmanIds[1], // David Chen
  title: 'Install new light fixtures in living room',
  description: 'Need 4 recessed lights installed in living room ceiling. Existing wiring is in place.',
  address: '14 Baker Street, Apt 3',
  city: 'London',
  urgency: 'flexible',
  offered_fee: 200,
  status: 'pending',
  photos_json: '[]',
});

insertJob.run({
  customer_id: bob.lastInsertRowid,
  tradesman_id: tradesmanIds[4], // Tom Murphy
  title: 'Boiler service and annual check',
  description: 'Annual boiler service needed. Combi boiler, 5 years old, no major issues just routine maintenance.',
  address: '7 Oxford Road',
  city: 'Manchester',
  urgency: 'flexible',
  offered_fee: 90,
  status: 'completed',
  photos_json: '[]',
});

// --- Reviews ---
const insertReview = db.prepare(`
  INSERT INTO reviews (job_id, reviewer_id, reviewee_id, rating, comment)
  VALUES (@job_id, @reviewer_id, @reviewee_id, @rating, @comment)
`);

insertReview.run({
  job_id: job2.lastInsertRowid - 1, // job3 is the completed one (lastInsertRowid from bob's job)
  reviewer_id: bob.lastInsertRowid,
  reviewee_id: tradesmanIds[4],
  rating: 5,
  comment: 'Tom was punctual, professional and thorough. Highly recommend!',
});

console.log('✅ Seed complete!');
console.log('');
console.log('Demo accounts (password: password123):');
console.log('  Customer:   alice@example.com');
console.log('  Customer:   bob@example.com');
console.log('  Tradesman:  mike.j@example.com  (Mike Johnson - Plumber)');
console.log('  Tradesman:  david.c@example.com (David Chen - Electrician)');
