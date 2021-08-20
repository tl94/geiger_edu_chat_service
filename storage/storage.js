/**
 * uses multer package to create and export image storage and upload functionality.
 *
 * @author Turan Ledermann
 * @author Felix Mayer
 **/

const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './images/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.fieldname + '-' + Math.floor(Math.random() * 100) + '.png');
    }
});
const upload = multer({ storage: storage });

module.exports = upload;