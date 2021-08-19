const express = require('express');
const dispatcher = express.Router();

const roomController = require('./controller');

// define endpoints
dispatcher.get('/', (req, res) => {
    res.send("Hello World!");
});

dispatcher.post('/users', roomController.createUser);

dispatcher.get('/users/:userId', roomController.getUser);

dispatcher.put('/users/:userId', roomController.updateUser);

dispatcher.get('/users/:userId/messages', roomController.getMessagesByUser);

dispatcher.get('/rooms', roomController.findAllRooms);

dispatcher.get('/rooms/:roomId', roomController.findRoomById);

dispatcher.get('/rooms/:roomId/messages', roomController.getMessagesInRoom);

dispatcher.post('/rooms/:roomId/messages', roomController.postMessageInRoom);

dispatcher.post('/rooms/:roomId/messages/:parentMsgId', roomController.postReplyMessage);

dispatcher.post('/rooms/:roomId/pinnedMessages/:messageId', roomController.pinMessage);



const Image = require('../domain/image');
const fs = require('fs');
var path = require('path');
const upload = require('../storage/storage');
dispatcher.post('/rooms/:roomId/images', upload.single('image'), (req, res, next) => {
    
    const roomId = req.params.roomId;

    let imageDirectory = path.join('./images');

    const image = {
        img: {
            data: fs.readFileSync(path.join(imageDirectory + '/' + req.file.filename)),
            contentType: 'image/png'
        }
    }
    console.log(image);

    Image.create(image, async (err, item) => {
        if (err) {
            console.log(err);
        } else {
            item = await item.save();
            res.status(201);
            res.send(item._id);
        }
    });
});

dispatcher.delete('/messages/:messageId', roomController.deleteMessage);

dispatcher.get('/images/:imageId', roomController.getImage);

module.exports = dispatcher;