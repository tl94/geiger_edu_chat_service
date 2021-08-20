/**
 * UNUSED
 * The following implementation has been integrated from
 * https://github.com/log4js-node/log4js-node/blob/master/docs/file.md
 * Credit to: the log4js-node developers
 * */

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