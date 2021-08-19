// MongoDB connection setup with mongoose

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const url = 'mongodb://'+process.env.MONGO_HOST+'/'+process.env.MONGO_DATABASE;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', () => console.log("could not connect to database"));
db.on('open', () => console.log("successfully connected to database"));
