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

const hashPassword = (pwd) => bcrypt.hashSync(pwd, 10);

const insertUser = db.prepare(`
  INSERT INTO users (name, email, password_hash, role, avatar_url)
  VALUES (@name, @email, @password_hash, @role, @avatar_url)
`);

// 2 клиента
const sarvinoz = insertUser.run({
  name: 'Сарвиноз Ҳасанова',
  email: 'sarvinoz@example.com',
  password_hash: hashPassword('password123'),
  role: 'customer',
  avatar_url: null,
});
const alisher = insertUser.run({
  name: 'Алишер Тошматов',
  email: 'alisher@example.com',
  password_hash: hashPassword('password123'),
  role: 'customer',
  avatar_url: null,
});

// 8 мастеров
const tradesmensData = [
  { name: 'Рустам Назаров',       email: 'rustam.n@example.com',   trade: 'Сантехник',    city: 'Душанбе',  lat: 38.5598, lng: 68.7739, rate: 120, cof: 50,  rating: 4.8, reviews: 87,  avail: 1, exp: 10, bio: 'Мастер-сантехник с 10-летним стажем. Устранение аварий, установка сантехники, замена труб.' },
  { name: 'Фирӯз Раҳимов',        email: 'firuz.r@example.com',    trade: 'Электрик',     city: 'Душанбе',  lat: 38.5700, lng: 68.7800, rate: 150, cof: 60,  rating: 4.9, reviews: 112, avail: 1, exp: 8,  bio: 'Сертифицированный электрик. Монтаж электропроводки, установка розеток и щитков.' },
  { name: 'Баҳром Каримов',       email: 'bahrom.k@example.com',   trade: 'Плотник',      city: 'Душанбе',  lat: 38.5500, lng: 68.7600, rate: 100, cof: 40,  rating: 4.7, reviews: 203, avail: 0, exp: 15, bio: 'Опытный плотник. Мебель на заказ, двери, окна, отделочные работы.' },
  { name: 'Шерзод Мирзоев',       email: 'sherzod.m@example.com',  trade: 'Электрик',     city: 'Хуҷанд',   lat: 40.2839, lng: 69.6214, rate: 130, cof: 55,  rating: 4.3, reviews: 54,  avail: 0, exp: 6,  bio: 'Электромонтажные работы в Хуҷанде. Быстро и качественно.' },
  { name: 'Умед Сафаров',         email: 'umed.s@example.com',     trade: 'Сантехник',    city: 'Хуҷанд',   lat: 40.2900, lng: 69.6300, rate: 100, cof: 45,  rating: 4.5, reviews: 76,  avail: 1, exp: 7,  bio: 'Надёжный сантехник в Хуҷанде. Любые работы с водопроводом и канализацией.' },
  { name: 'Нилуфар Раҳматуллаева', email: 'nilufar.r@example.com', trade: 'Маляр',        city: 'Душанбе',  lat: 38.5650, lng: 68.7700, rate: 80,  cof: 30,  rating: 4.6, reviews: 131, avail: 1, exp: 5,  bio: 'Покраска стен, поклейка обоев, декоративная отделка. Аккуратно и в срок.' },
  { name: 'Комил Давлатов',       email: 'komil.d@example.com',    trade: 'Плотник',      city: 'Хуҷанд',   lat: 40.2800, lng: 69.6100, rate: 110, cof: 50,  rating: 4.1, reviews: 42,  avail: 1, exp: 4,  bio: 'Плотник в Хуҷанде. Кухни на заказ, шкафы-купе, ремонт мебели.' },
  { name: 'Дилноза Юсупова',      email: 'dilnoza.y@example.com',  trade: 'Маляр',        city: 'Душанбе',  lat: 38.5480, lng: 68.7580, rate: 75,  cof: 30,  rating: 3.9, reviews: 28,  avail: 0, exp: 3,  bio: 'Малярные работы: покраска, шпаклёвка, выравнивание стен.' },
];

const insertProfile = db.prepare(`
  INSERT INTO tradesman_profiles (user_id, trade, hourly_rate, call_out_fee, bio, city, latitude, longitude, avg_rating, review_count, is_available, years_experience)
  VALUES (@user_id, @trade, @hourly_rate, @call_out_fee, @bio, @city, @lat, @lng, @avg_rating, @review_count, @is_available, @years_experience)
`);

const tradesmanIds = [];
for (const t of tradesmensData) {
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

// Заявки
const insertJob = db.prepare(`
  INSERT INTO job_requests (customer_id, tradesman_id, title, description, address, city, urgency, offered_fee, status, scheduled_at, photos_json)
  VALUES (@customer_id, @tradesman_id, @title, @description, @address, @city, @urgency, @offered_fee, @status, @scheduled_at, @photos_json)
`);

const job1 = insertJob.run({
  customer_id: sarvinoz.lastInsertRowid,
  tradesman_id: tradesmanIds[0],
  title: 'Протечка трубы под раковиной',
  description: 'Труба под кухонной раковиной течёт уже 2 дня. Намокает пол.',
  address: 'ул. Рудаки 45, кв. 12',
  city: 'Душанбе',
  urgency: 'emergency',
  offered_fee: 200,
  status: 'accepted',
  scheduled_at: new Date(Date.now() + 86400000).toISOString(),
  photos_json: '[]',
});

const job2 = insertJob.run({
  customer_id: sarvinoz.lastInsertRowid,
  tradesman_id: tradesmanIds[1],
  title: 'Установка новых светильников',
  description: 'Нужно установить 4 точечных светильника в гостиной. Проводка есть.',
  address: 'ул. Рудаки 45, кв. 12',
  city: 'Душанбе',
  urgency: 'flexible',
  offered_fee: 300,
  status: 'pending',
  scheduled_at: new Date(Date.now() + 3 * 86400000).toISOString(),
  photos_json: '[]',
});

const job3 = insertJob.run({
  customer_id: alisher.lastInsertRowid,
  tradesman_id: tradesmanIds[4],
  title: 'Замена смесителя в ванной',
  description: 'Старый смеситель сломался. Нужна замена на новый.',
  address: 'пр. Исмоил Сомони 22',
  city: 'Хуҷанд',
  urgency: 'flexible',
  offered_fee: 150,
  status: 'completed',
  scheduled_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  photos_json: '[]',
});

// Отзывы
const insertReview = db.prepare(`
  INSERT INTO reviews (job_id, reviewer_id, reviewee_id, rating, comment)
  VALUES (@job_id, @reviewer_id, @reviewee_id, @rating, @comment)
`);

insertReview.run({
  job_id: job3.lastInsertRowid,
  reviewer_id: alisher.lastInsertRowid,
  reviewee_id: tradesmanIds[4],
  rating: 5,
  comment: 'Умед приехал вовремя, работу сделал быстро и аккуратно. Очень доволен!',
});

console.log('✅ Seed завершён!');
console.log('');
console.log('Демо аккаунты (пароль: password123):');
console.log('  Клиент:   sarvinoz@example.com');
console.log('  Клиент:   alisher@example.com');
console.log('  Мастер:   rustam.n@example.com   (Рустам - Сантехник)');
console.log('  Мастер:   firuz.r@example.com    (Фирӯз - Электрик)');
console.log('  Мастер:   nilufar.r@example.com  (Нилуфар - Маляр)');
