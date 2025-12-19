// Quick MongoDB check script
const mongoose = require('mongoose');
require('dotenv').config();

const News = require('./models/News');

async function checkNews() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📊 Connected to MongoDB');

        const allNews = await News.find({}).select('title image isPublished createdAt').sort({ createdAt: -1 });

        console.log(`\n📰 Total news in DB: ${allNews.length}\n`);

        allNews.forEach((news, index) => {
            console.log(`${index + 1}. ${news.title}`);
            console.log(`   🖼️  image: ${news.image || 'NULL'}`);
            console.log(`   📌 isPublished: ${news.isPublished}`);
            console.log(`   📅 created: ${news.createdAt}`);
            console.log('');
        });

        const withImages = allNews.filter(n => n.image).length;
        const withoutImages = allNews.filter(n => !n.image).length;

        console.log(`✅ With images: ${withImages}`);
        console.log(`❌ Without images: ${withoutImages}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkNews();
