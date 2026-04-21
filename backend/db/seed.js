require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const db = require('./database');

console.log('🌱 Seeding MasterLink database...');

db.exec(`
  DELETE FROM reviews;
  DELETE FROM job_requests;
  DELETE FROM tradesman_profiles;
  DELETE FROM users;
`);

const hash = (pwd) => bcrypt.hashSync(pwd, 10);

const insertUser = db.prepare(`
  INSERT INTO users (name, email, password_hash, role, avatar_url)
  VALUES (@name, @email, @password_hash, @role, @avatar_url)
`);

// customers

const customerList = [
  { name: 'Sarvinoz Hasanova',  email: 'sarvinoz@example.com' },
  { name: 'Alisher Toshmatov', email: 'alisher@example.com' },
  { name: 'Zulfiya Nazarova',  email: 'zulfiya@example.com' },
  { name: 'Parviz Rahimov',    email: 'parviz@example.com' },
  { name: 'Kamola Yusupova',   email: 'kamola@example.com' },
  { name: 'Maftuna Mirzoyeva', email: 'maftuna@example.com' },
];

const customerIds = customerList.map(c => {
  const row = insertUser.run({
    name: c.name,
    email: c.email,
    password_hash: hash('password123'),
    role: 'customer',
    avatar_url: null,
  });
  return row.lastInsertRowid;
});

const [sarvinoz, alisher, zulfiya, parviz, kamola, maftuna] = customerIds;

// tradesmen

const insertProfile = db.prepare(`
  INSERT INTO tradesman_profiles (user_id, trade, hourly_rate, call_out_fee, bio, city, latitude, longitude, avg_rating, review_count, is_available, years_experience)
  VALUES (@user_id, @trade, @hourly_rate, @call_out_fee, @bio, @city, @lat, @lng, @avg_rating, @review_count, @is_available, @years_experience)
`);

const tradesmensData = [
  { name: 'Rustam Nazarov',         email: 'rustam.n@example.com',   trade: 'Plumber',      city: 'Dushanbe', lat: 38.5598, lng: 68.7739, rate: 120, cof: 50,  rating: 4.8, reviews: 87,  avail: 1, exp: 10, bio: 'Expert plumber with 10 years of experience in Dushanbe. Emergency call-outs, installations, and pipe replacements.' },
  { name: 'Firuz Rahimov',          email: 'firuz.r@example.com',    trade: 'Electrician',  city: 'Dushanbe', lat: 38.5700, lng: 68.7800, rate: 150, cof: 60,  rating: 4.9, reviews: 112, avail: 1, exp: 8,  bio: 'Certified electrician. Wiring, sockets, switchboards, and smart-home installations.' },
  { name: 'Bahrom Karimov',         email: 'bahrom.k@example.com',   trade: 'Carpenter',    city: 'Dushanbe', lat: 38.5500, lng: 68.7600, rate: 100, cof: 40,  rating: 4.7, reviews: 63,  avail: 0, exp: 15, bio: 'Master carpenter. Custom furniture, doors, windows, and decorative woodwork.' },
  { name: 'Sherzod Mirzoev',        email: 'sherzod.m@example.com',  trade: 'Electrician',  city: 'Khujand',  lat: 40.2839, lng: 69.6214, rate: 130, cof: 55,  rating: 4.3, reviews: 34,  avail: 0, exp: 6,  bio: 'Electrical installations in Khujand. Fast and reliable service.' },
  { name: 'Umed Safarov',           email: 'umed.s@example.com',     trade: 'Plumber',      city: 'Khujand',  lat: 40.2900, lng: 69.6300, rate: 100, cof: 45,  rating: 4.5, reviews: 46,  avail: 1, exp: 7,  bio: 'Trusted plumber in Khujand. Any water supply or drainage work.' },
  { name: 'Nilufar Rahmatullayeva', email: 'nilufar.r@example.com',  trade: 'Painter',      city: 'Dushanbe', lat: 38.5650, lng: 68.7700, rate: 80,  cof: 30,  rating: 4.6, reviews: 51,  avail: 1, exp: 5,  bio: 'Interior painting, wallpaper, and decorative finishes. Neat and on time.' },
  { name: 'Komil Davlatov',         email: 'komil.d@example.com',    trade: 'Carpenter',    city: 'Khujand',  lat: 40.2800, lng: 69.6100, rate: 110, cof: 50,  rating: 4.1, reviews: 22,  avail: 1, exp: 4,  bio: 'Carpenter in Khujand. Custom kitchens, wardrobes, and furniture repairs.' },
  { name: 'Dilnoza Yusupova',       email: 'dilnoza.y@example.com',  trade: 'Painter',      city: 'Dushanbe', lat: 38.5480, lng: 68.7580, rate: 75,  cof: 30,  rating: 3.9, reviews: 18,  avail: 0, exp: 3,  bio: 'Painting and plastering. Wall levelling, priming, and finishing coats.' },
  { name: 'Nodir Toshmatov',        email: 'nodir.t@example.com',    trade: 'Tiler',        city: 'Dushanbe', lat: 38.5620, lng: 68.7650, rate: 90,  cof: 35,  rating: 4.7, reviews: 38,  avail: 1, exp: 6,  bio: 'Tile installation for bathrooms, kitchens, and floors. Precise and clean work.' },
  { name: 'Akbar Nazarov',          email: 'akbar.n@example.com',    trade: 'Builder',      city: 'Dushanbe', lat: 38.5550, lng: 68.7720, rate: 110, cof: 60,  rating: 4.5, reviews: 29,  avail: 1, exp: 12, bio: 'General construction — brickwork, plastering, extensions, and renovations.' },
  { name: 'Gulbahor Mirzoyeva',     email: 'gulbahor.m@example.com', trade: 'Painter',      city: 'Khujand',  lat: 40.2850, lng: 69.6200, rate: 80,  cof: 30,  rating: 4.4, reviews: 15,  avail: 1, exp: 4,  bio: 'Professional painter in Khujand. Interior and exterior work.' },
  { name: 'Davron Hakimov',         email: 'davron.h@example.com',   trade: 'Plumber',      city: 'Khujand',  lat: 40.2870, lng: 69.6250, rate: 95,  cof: 40,  rating: 4.2, reviews: 12,  avail: 1, exp: 5,  bio: 'Plumbing services in Khujand. Emergency repairs, boiler installs, and more.' },
];

const tradesmanIds = [];
for (const t of tradesmensData) {
  const userRow = insertUser.run({
    name: t.name,
    email: t.email,
    password_hash: hash('password123'),
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

const [tRustam, tFiruz, tBahrom, tSherzod, tUmed, tNilufar, tKomil, tDilnoza, tNodir, tAkbar, tGulbahor, tDavron] = tradesmanIds;

// jobs

const insertJob = db.prepare(`
  INSERT INTO job_requests (customer_id, tradesman_id, title, description, address, city, urgency, offered_fee, status, scheduled_at, photos_json)
  VALUES (@customer_id, @tradesman_id, @title, @description, @address, @city, @urgency, @offered_fee, @status, @scheduled_at, @photos_json)
`);

const daysAgo   = (n) => new Date(Date.now() - n * 86400000).toISOString();
const daysAhead = (n) => new Date(Date.now() + n * 86400000).toISOString();

// Completed jobs (used for reviews)
const completedSpec = [
  { c: sarvinoz, t: tRustam,  title: 'Leaking pipe under kitchen sink',    desc: 'Pipe has been dripping for 2 days, floor is damp.',            addr: 'Rudaki Ave 45, apt 12',       city: 'Dushanbe', urg: 'emergency', fee: 200,  ago: 30 },
  { c: sarvinoz, t: tBahrom,  title: 'Custom wardrobe installation',        desc: 'Need a built-in wardrobe for the master bedroom.',             addr: 'Rudaki Ave 45, apt 12',       city: 'Dushanbe', urg: 'flexible',  fee: 800,  ago: 60 },
  { c: alisher,  t: tFiruz,   title: 'Install new ceiling lights',          desc: 'Need 4 recessed lights installed in the living room.',         addr: 'Ismoil Somoni Ave 22',         city: 'Dushanbe', urg: 'flexible',  fee: 300,  ago: 25 },
  { c: alisher,  t: tNilufar, title: 'Paint two bedrooms',                  desc: 'Both bedrooms need fresh coat, light grey colour.',            addr: 'Ismoil Somoni Ave 22',         city: 'Dushanbe', urg: 'flexible',  fee: 600,  ago: 45 },
  { c: alisher,  t: tUmed,    title: 'Replace bathroom mixer tap',          desc: 'Old tap is broken, needs replacement.',                        addr: 'Prospect Lenina 8',            city: 'Khujand',  urg: 'flexible',  fee: 150,  ago: 20 },
  { c: zulfiya,  t: tRustam,  title: 'Blocked shower drain',                desc: 'Shower is draining very slowly.',                             addr: 'Bokhtar St 17, apt 5',        city: 'Dushanbe', urg: 'flexible',  fee: 120,  ago: 15 },
  { c: zulfiya,  t: tFiruz,   title: 'Full apartment rewire',               desc: 'Old wiring needs full replacement and new fuse board.',        addr: 'Bokhtar St 17, apt 5',        city: 'Dushanbe', urg: 'flexible',  fee: 1500, ago: 90 },
  { c: parviz,   t: tUmed,    title: 'Fix low shower pressure',             desc: 'Water pressure in the shower is very weak.',                   addr: 'Nusratullo Mator St 3',       city: 'Khujand',  urg: 'flexible',  fee: 100,  ago: 18 },
  { c: parviz,   t: tNodir,   title: 'Bathroom wall tiling',                desc: 'Full bathroom retile, approx 12m² of tiles.',                  addr: 'Nusratullo Mator St 3',       city: 'Dushanbe', urg: 'flexible',  fee: 900,  ago: 35 },
  { c: kamola,   t: tBahrom,  title: 'Kitchen cabinet build',               desc: 'Custom kitchen cabinets with soft-close hinges.',              addr: 'Ayni St 56, apt 2',           city: 'Dushanbe', urg: 'flexible',  fee: 1200, ago: 50 },
  { c: kamola,   t: tAkbar,   title: 'Partition wall construction',         desc: 'New wall needed to divide the living room.',                   addr: 'Ayni St 56, apt 2',           city: 'Dushanbe', urg: 'flexible',  fee: 700,  ago: 40 },
  { c: kamola,   t: tSherzod, title: 'Electrical panel upgrade',            desc: 'Old fuse box needs upgrading to modern circuit breakers.',     addr: 'Khujand New Town, blk 4',     city: 'Khujand',  urg: 'flexible',  fee: 400,  ago: 22 },
  { c: maftuna,  t: tNilufar, title: 'Living room feature wall',            desc: 'Decorative painting on one wall with stencil pattern.',        addr: 'Somoni Microdistrict 12',     city: 'Dushanbe', urg: 'flexible',  fee: 350,  ago: 12 },
  { c: maftuna,  t: tGulbahor,title: 'Full apartment interior painting',    desc: 'Freshly plastered walls need full coat of white emulsion.',    addr: 'Khujand, Lenin St 88',        city: 'Khujand',  urg: 'flexible',  fee: 1100, ago: 70 },
  { c: maftuna,  t: tDavron,  title: 'Emergency boiler repair',             desc: 'Boiler stopped producing hot water.',                          addr: 'Khujand, Lenin St 88',        city: 'Khujand',  urg: 'emergency', fee: 300,  ago: 8  },
  { c: sarvinoz, t: tNodir,   title: 'Kitchen floor tiling',                desc: 'Replace old vinyl with ceramic tiles in kitchen.',             addr: 'Rudaki Ave 45, apt 12',       city: 'Dushanbe', urg: 'flexible',  fee: 600,  ago: 55 },
  { c: alisher,  t: tKomil,   title: 'Custom floor-to-ceiling bookshelf',   desc: 'Floor-to-ceiling bookshelf for the study room.',              addr: 'Prospect Lenina 8',            city: 'Khujand',  urg: 'flexible',  fee: 500,  ago: 65 },
  { c: parviz,   t: tDavron,  title: 'Replace corroded water stopcock',     desc: 'Main stopcock is corroded and very hard to turn.',            addr: 'Nusratullo Mator St 3',       city: 'Khujand',  urg: 'flexible',  fee: 180,  ago: 42 },
];

const completedJobIds = completedSpec.map(j => {
  const row = insertJob.run({
    customer_id:  j.c,
    tradesman_id: j.t,
    title:        j.title,
    description:  j.desc,
    address:      j.addr,
    city:         j.city,
    urgency:      j.urg,
    offered_fee:  j.fee,
    status:       'completed',
    scheduled_at: daysAgo(j.ago + 1),
    photos_json:  '[]',
  });
  return row.lastInsertRowid;
});

// Active jobs (pending / accepted)
insertJob.run({ customer_id: sarvinoz, tradesman_id: tFiruz,  title: 'Install outdoor security light',  description: 'Need a security light above the front door.',             address: 'Rudaki Ave 45',         city: 'Dushanbe', urgency: 'flexible',  offered_fee: 150, status: 'pending',  scheduled_at: daysAhead(3), photos_json: '[]' });
insertJob.run({ customer_id: alisher,  tradesman_id: tRustam, title: 'New bathroom radiator',            description: 'Existing radiator is leaking, needs replacing.',          address: 'Ismoil Somoni Ave 22',  city: 'Dushanbe', urgency: 'flexible',  offered_fee: 250, status: 'accepted', scheduled_at: daysAhead(1), photos_json: '[]' });
insertJob.run({ customer_id: zulfiya,  tradesman_id: tNodir,  title: 'Hallway floor tiles',              description: 'Hallway needs new tiles, approx 8m².',                   address: 'Bokhtar St 17, apt 5',  city: 'Dushanbe', urgency: 'flexible',  offered_fee: 500, status: 'pending',  scheduled_at: daysAhead(5), photos_json: '[]' });
insertJob.run({ customer_id: parviz,   tradesman_id: tAkbar,  title: 'Garden boundary wall repair',      description: 'Part of the boundary wall has crumbled and needs rebuilding.', address: 'Khujand New Town',   city: 'Khujand',  urgency: 'flexible',  offered_fee: 300, status: 'pending',  scheduled_at: daysAhead(4), photos_json: '[]' });

// reviews

const insertReview = db.prepare(`
  INSERT INTO reviews (job_id, reviewer_id, reviewee_id, rating, comment)
  VALUES (@job_id, @reviewer_id, @reviewee_id, @rating, @comment)
`);

const reviewSpec = [
  { idx: 0,  reviewer: sarvinoz, reviewee: tRustam,   rating: 5, comment: 'Fixed the leak quickly and left the area spotless. Highly recommend!' },
  { idx: 1,  reviewer: sarvinoz, reviewee: tBahrom,   rating: 5, comment: 'Incredible craftsmanship on the wardrobe. Exactly what I wanted — solid and beautiful.' },
  { idx: 2,  reviewer: alisher,  reviewee: tFiruz,    rating: 5, comment: 'Brilliant electrician. All lights installed safely and he tidied up after himself.' },
  { idx: 3,  reviewer: alisher,  reviewee: tNilufar,  rating: 4, comment: 'Great finish on the walls. Very tidy work, only a minor delay on day two.' },
  { idx: 4,  reviewer: alisher,  reviewee: tUmed,     rating: 5, comment: 'Replaced the mixer tap professionally. Fair price and very friendly.' },
  { idx: 5,  reviewer: zulfiya,  reviewee: tRustam,   rating: 4, comment: 'Sorted the blocked drain efficiently. Arrived on time and explained the issue clearly.' },
  { idx: 6,  reviewer: zulfiya,  reviewee: tFiruz,    rating: 5, comment: 'Full rewire done to a very high standard. Very knowledgeable and professional.' },
  { idx: 7,  reviewer: parviz,   reviewee: tUmed,     rating: 4, comment: 'Fixed the shower pressure quickly. Good value for money.' },
  { idx: 8,  reviewer: parviz,   reviewee: tNodir,    rating: 5, comment: 'Bathroom looks stunning. The tile alignment is perfect — very skilled tiler.' },
  { idx: 9,  reviewer: kamola,   reviewee: tBahrom,   rating: 5, comment: 'Custom kitchen cabinets are perfect. Outstanding quality, very happy with the result.' },
  { idx: 10, reviewer: kamola,   reviewee: tAkbar,    rating: 5, comment: 'Clean and precise brickwork on the partition wall. No mess, finished on schedule.' },
  { idx: 11, reviewer: kamola,   reviewee: tSherzod,  rating: 4, comment: 'Upgraded the panel without any issues. Professional and reliable.' },
  { idx: 12, reviewer: maftuna,  reviewee: tNilufar,  rating: 5, comment: 'The feature wall looks amazing! Beautiful stencil work, will definitely hire again.' },
  { idx: 13, reviewer: maftuna,  reviewee: tGulbahor, rating: 5, comment: 'Entire apartment painted perfectly. Very professional and pleasant to work with.' },
  { idx: 14, reviewer: maftuna,  reviewee: tDavron,   rating: 5, comment: 'Came within an hour for the emergency and fixed the boiler. An absolute lifesaver!' },
  { idx: 15, reviewer: sarvinoz, reviewee: tNodir,    rating: 4, comment: 'Good tile job in the kitchen. Clean and precise, just took a day longer than expected.' },
  { idx: 16, reviewer: alisher,  reviewee: tKomil,    rating: 4, comment: 'Made a great floor-to-ceiling bookshelf. Solid construction and good communication.' },
  { idx: 17, reviewer: parviz,   reviewee: tDavron,   rating: 4, comment: 'Replaced the corroded stopcock cleanly. Reasonable price and punctual.' },
];

for (const r of reviewSpec) {
  insertReview.run({
    job_id:      completedJobIds[r.idx],
    reviewer_id: r.reviewer,
    reviewee_id: r.reviewee,
    rating:      r.rating,
    comment:     r.comment,
  });
}

// give all customers a starting balance of 5000 TJS for testing

db.prepare("UPDATE users SET balance = 5000 WHERE role = 'customer'").run();

// recalculate ratings from the reviews we just inserted

const updateProfile = db.prepare(
  'UPDATE tradesman_profiles SET avg_rating = ?, review_count = ? WHERE user_id = ?'
);
for (const tid of tradesmanIds) {
  const stats = db.prepare(
    'SELECT ROUND(AVG(rating), 1) AS avg, COUNT(*) AS cnt FROM reviews WHERE reviewee_id = ?'
  ).get(tid);
  if (stats.cnt > 0) updateProfile.run(stats.avg, stats.cnt, tid);
}

console.log('✅ Seed complete!');
console.log('');
console.log('Demo accounts (password: password123)');
console.log('');
console.log('  Customers:');
customerList.forEach(c => console.log(`    ${c.email}`));
console.log('');
console.log('  Tradesmen:');
tradesmensData.forEach(t => console.log(`    ${t.email.padEnd(26)} ${t.name} — ${t.trade}, ${t.city}`));
