/* 
* class that implements request and response handling and relevant DB operations  
*/
const mongoose = require('mongoose');

// db models, used for all operations on DB
const User = require('../domain/user');
const Room = require('../domain/room');
const Message = require('../domain/message');
const Image = require('../domain/image');


// create User using User request body with name property
exports.createUser = async (req, res) => {
    let user = new User(req.body);
    user = await user.save();
    res.status(201);
    res.send(user._id);
}


// get User using path parameter userId in path /users/:userId/, if the User exists
exports.getUser = async (req, res) => {
    const userId = req.params.userId;
    const user = await User.findById(userId).exec();
    if (!user) {
        res.status(404);
    }
    if (user.isAnonymous) {
        user.name = 'Anonymous';
    }
    user.messages = null;
    res.send(user);
}

// update User using path parameter userId in path /users/:userId/ and new User data in request body
exports.updateUser = async (req, res) => {
    const userId = req.params.userId;

    let oldUser = await User.findById(userId).exec();
    const newUser = User(req.body);
    if (!newUser) {
        res.status(404);
    } else {
        oldUser.name = newUser.name;
        oldUser.profileImage = newUser.profileImage;
        oldUser.learnScore = newUser.learnScore;
        oldUser.isAnonymous = newUser.isAnonymous;
        oldUser.showLearnScore = newUser.showLearnScore;

        await oldUser.save();
    }
    res.send();
}

// get Messages by user using path parameter userId in /users/:userId/messages
exports.getMessagesByUser = async (req, res) => {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate('messages').exec();
    if (!user) {
        res.status(404);
        res.send();
    } else {
        res.send(user.messages);
    }
}

// get all Rooms
exports.findAllRooms = (req, res) => {
    Room.find((err, rooms) => {
        if (err) {
            res.status(400);
            res.send(err);
        } else {
            res.status(200)
            res.send(rooms);
        }
    });
};

// get Room using path parameter roomId in /rooms/:roomId
exports.findRoomById = async (req, res) => {
    const roomId = req.params.roomId;
    let room = await Room.findOne({ roomId: roomId }).exec();
    if (room === null) {
        room = new Room();
        room.roomId = roomId;
        room = await room.save();
    }
    res.send(room);
}

// get Messages in Room using path parameter roomId in /rooms/:roomId/messages
exports.getMessagesInRoom = async (req, res) => {
    const roomId = req.params.roomId;

    const room = await checkOrCreateRoom(roomId);

    let messages = room.messages;

    res.send(messages);
}


// post Message in Room using path parameter roomId in /rooms/:roomId/messages
// and Message request body with userId, roomId, message
exports.postMessageInRoom = async (req, res) => {
    const roomId = req.params.roomId;

    message.timestamp = new Date();

    const userId = mongoose.Types.ObjectId(req.body.userId);

    let imageId = null;
    if (req.body.imageId) {
        imageId = req.body.imageId.split('"')[1];

        imageId = mongoose.Types.ObjectId(imageId);
    }

    const room = await checkOrCreateRoom(roomId);

    const user = await User.findById(userId).exec();


    req.body.roomId = room.roomId;
    req.body.imageId = imageId;

    const message = new Message(req.body);

    if (user) {
        message.roomId = room.roomId;
        message.userId = user._id;
        message.save((err, msg) => handleSavedMessage(req, res, room, user, err, msg));
    }
}

// post reply Message for Message in Room using path parameters roomId, parentMsgId in /rooms/:roomId/messages/:parentMsgId
// and Message request body with userId, roomId, message
exports.postReplyMessage = async (req, res) => {
    const roomId = req.params.roomId;
    const parentMsgId = req.params.parentMsgId;
    
    const message = new Message(req.body);
    message.parentMsg = parentMsgId;
    message.timestamp = new Date();

    const room = await checkOrCreateRoom(roomId);

    const uuid = req.body.uuid;
    const user = await User.findOne({ uuid: uuid }).exec();

    const parentMsg = await Message.findById(parentMsgId).exec();

    if (user) {
        message.roomId = room.roomId;
        message.userId = user._id;
        message.save((err, msg) => {
            handleSavedMessage(req, res, room, user, err, msg);
            parentMsg.childMsgs.push(msg._id);
            parentMsg.save();
        });
    }
}

// pin Message in Room using path parameters roomId, messageId in /rooms/:roomId/pinnedMessages/:messageId
exports.pinMessage = async (req, res) => {
    const roomId = req.params.roomId;
    const messageId = req.params.messageId;

    const room = await checkOrCreateRoom(roomId);

    Message.findById(messageId, (err, msg) => {
        if (msg === null) {
            res.status(404);
            res.send();
        } else {
            room.pinnedMessages.push(msg._id);
            room.save();
            res.send();
        }
    });
}


// UNUSED
exports.postImage;

// delete Message using path parameter messageId in path /messages/:messageId
exports.deleteMessage = (req, res) => {
    const messageId = req.params.messageId;
    Message.findById(messageId, (err, msg) => {
        if (msg === null) {
            res.status(404);
            res.send();
        } else {
            // let room = Room.findById(msg.roomId).exec();
            // let user = User.findById(msg.userId).exec();
            Message.deleteOne(msg, (err) => {
                if (err) {
                    res.status(500)
                    res.send(err);
                } else {
                    res.status(200);
                    res.send();
                }
            })
        }
    })
}

// get Image using path parameter imageId in path /images/:imageId
exports.getImage = async (req, res) => {
    const imageId = req.params.imageId;
    const image = await Image.findById(imageId).exec();
    if (image) {
        res.send(image);
    } else {
        res.status(404);
        res.send();
    }
}


// helper methods
// check if Room with roomId exists, create it if not, return Room
const checkOrCreateRoom = async roomId => {
    let room = await Room.findOne({ roomId: roomId }).populate('messages').exec();
    if (!room) {
        room = Room();
        // create room
        room.roomId = roomId;
        // room.roomName = id;
        room.users = [];
        room.messages = [];
        room.pinnedMessages = [];
        room = await room.save();
    }
    return room;
}

// UNUSED
const checkUser = async uuid => {
    let user = await User.findOne({ uuid: uuid }).exec();
    if (!user) {
        return false;
    }
    return true;
}

// save new Message and add to particular Room and User
const handleSavedMessage = (req, res, room, user, err, msg) => {
    if (err) {
        res.status(500);
        res.send(err);
        console.log(err);
    } else {
        msg.roomId = room.roomId;

        let msgs = room.messages;
        msgs.push(msg._id);
        room.save();

        msgs = user.messages;
        msgs.push(msg._id);
        user.save();

        res.status(201)
        res.send(msg);
    }
}