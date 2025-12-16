// Quick script to check user lastActive values
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/amber')
    .then(async () => {
        console.log('Connected to MongoDB');

        const User = require('./models/User');
        const users = await User.find({}, 'name email lastActive').lean();

        console.log('\n📊 User Activity Report:');
        console.log('========================\n');

        const now = new Date();
        users.forEach(user => {
            const lastActive = user.lastActive ? new Date(user.lastActive) : null;
            const diffMinutes = lastActive ? Math.floor((now - lastActive) / 60000) : 'N/A';

            console.log(`👤 ${user.name} (${user.email})`);
            console.log(`   Last Active: ${lastActive ? lastActive.toISOString() : 'Never'}`);
            console.log(`   Minutes Ago: ${diffMinutes}`);
            console.log('');
        });

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
