/* 
* class that uses log4js package to log relevant events in the application
* UNUSED 
*/
const log4js = require("log4js");

log4js.configure({
    appenders: {
        everything: {
            type: 'file',
            filename: 'logs/app.log',
            maxLogSize: 10485760,
            backups: 3,
            compress: true
        }
    },
    categories: {
        default: {appenders: ['everything'], level: 'debug'}
    }
});

const logger = log4js.getLogger();

module.exports = logger;