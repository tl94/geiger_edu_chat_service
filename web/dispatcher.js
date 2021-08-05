const express = require('express');
const dispatcher = express.Router();

const roomController = require('./controller');

// define endpoints
dispatcher.get('/', (req, res) => {
    res.send("Hello World!");
    logger.debug("Successful GET request on main endpoint /")
});

dispatcher.post('/users', roomController.createUser);

dispatcher.get('/users/:userId', roomController.getUser);

dispatcher.get('/users/:userId/messages', roomController.getMessagesByUser);

dispatcher.get('/rooms', roomController.findAllRooms);

dispatcher.get('/rooms/:roomId', roomController.findRoomById);

dispatcher.get('/rooms/:roomId/messages', roomController.getMessagesInRoom);

dispatcher.post('/rooms/:roomId/messages', roomController.postMessageInRoom);

dispatcher.post('/rooms/:roomId/messages/:parentMsgId', roomController.postReplyMessage);

dispatcher.post('/rooms/:roomId/pinnedMessages/:messageId', roomController.pinMessage);

dispatcher.post('/rooms/:roomId/images', roomController.postImage);

dispatcher.delete('/messages/:messageId', roomController.deleteMessage);


module.exports = dispatcher;