const mongoose = require('mongoose');

// db model
const User = require('../domain/user');
const Room = require('../domain/room');
const Message = require('../domain/message');
const Image = require('../domain/image');


// needs name
exports.createUser = async (req, res) => {
    let user = new User(req.body);
    user = await user.save();
    res.status(201);
    res.send(user._id);
}

/**
 * Gets user data for userId.
 * @param {*} req request object
 * @param {*} res response object
 */
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

exports.updateUser = async (req, res) => {
    const userId = req.params.userId;
        let oldUser = await User.findById(userId).exec();
    const newUser = User(req.body);
    if (!newUser) {
        res.status(404);
    }
    
    oldUser.name = newUser.name;
    oldUser.profileImage = newUser.profileImage;
    oldUser.learnScore = newUser.learnScore;
    oldUser.isAnonymous = newUser.isAnonymous;
    oldUser.showLearnScore = newUser.showLearnScore;
    await oldUser.save();
    res.send();
}

// needs path parameter /users/:userId/messages
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

// path /rooms
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

// needs path parameter /rooms/:roomId
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

// needs path parameter /rooms/:roomId/messages
exports.getMessagesInRoom = async (req, res) => {
    const roomId = req.params.roomId;

    const room = await checkOrCreateRoom(roomId);

    let messages = room.messages;

    res.send(messages);
}

// needs path parameter /rooms/:roomId/messages
// needs Message with userId, roomId, message, isAnonymous
exports.postMessageInRoom = async (req, res) => {
    const roomId = req.params.roomId;

    // message.timestamp = new Date();

    const userId = mongoose.Types.ObjectId(req.body.userId);
    
    let imageId = null;
    if (req.body.imageId) {
        imageId = req.body.imageId.split('"')[1];

        imageId = mongoose.Types.ObjectId(imageId);
    }

    const room = await checkOrCreateRoom(roomId);


    // TODO: get userId on creation or some kind of token to identify them
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

// needs path parameter /rooms/:roomId/messages/:parentMsgId
// needs Message with userId, roomId, message, isAnonymous
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

// needs path parameter /rooms/:roomId/pinnedMessages/:messageId
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

// needs path parameter /rooms/:roomId/images
exports.postImage;

// needs path parameter /messages/:messageId
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

const checkUser = async uuid => {
    let user = await User.findOne({ uuid: uuid }).exec();
    if (!user) {
        return false;
    }
    return true;
}

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