const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local from parent directory
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function seed() {
  try {
    await client.connect();
    const db = client.db('tip-community'); // Adjust if DB name is different
    const logs = db.collection('visitor_logs');

    // Clear existing logs (optional)
    // await logs.deleteMany({});

    const paths = ['/', '/places', '/contribute', '/about', '/faq', '/auth/login'];
    const devices = ['desktop', 'mobile', 'tablet'];
    const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
    const oss = ['Windows', 'macOS', 'Linux', 'Android', 'iOS'];

    const dummyLogs = [];
    const now = new Date();

    // Create logs for the last 30 days
    for (let i = 0; i < 500; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

      dummyLogs.push({
        path: paths[Math.floor(Math.random() * paths.length)],
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0...',
        referer: 'https://google.com',
        device: devices[Math.floor(Math.random() * devices.length)],
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        os: oss[Math.floor(Math.random() * oss.length)],
        screenSize: '1920x1080',
        timestamp: date
      });
    }

    const result = await logs.insertMany(dummyLogs);
    console.log(`Successfully seeded ${result.insertedCount} visitor logs.`);
  } finally {
    await client.close();
  }
}

seed().catch(console.error);
