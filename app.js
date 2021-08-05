require('dotenv-extended').load();
require('./db/db');
const express = require('express');
const dispatcher = require('./web/dispatcher');

// define middlewares
const cors = require('cors');

// server app setup
const app = express();
const port = process.env.SERVER_PORT;

// load middlewares
app.use(express.json());
app.use(cors());

// define main route
app.use('/geiger-edu-chat', dispatcher);

app.listen(port, () => {
    const serverStartLogMsg = "Server is running on port " + port;
    console.log(serverStartLogMsg);
});
