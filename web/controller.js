const mongoose = require('mongoose');

// db model
const User = require('../domain/user');
const Room = require('../domain/room');
const Message = require('../domain/message');
const Image = require('../domain/image');

const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './images/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.filename)
    }
});
const upload = multer({ storage: storage });


// needs uuid, name
exports.createUser = async (req, res) => {
    let user = new User(req.body);
    const userInDb = await User.findOne({ uuid: user.uuid });
    if (!userInDb) {
        user = await user.save();
        res.status(201);
        res.send(user);
    } else {
        res.send(200);
        res.send(userInDb);
    }
}

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
    console.log("HEWWO");
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
    let room = await Room.findOne({ roomId: roomId }).populate('messages').exec();
    const messages = room.messages;
    res.send(messages);
}

// needs path parameter /rooms/:roomId/messages
// needs Message with userId, roomId, message, isAnonymous
exports.postMessageInRoom = async (req, res) => {
    
    console.log("HEWWO MESSAGES");
    const roomId = req.params.roomId;
    const message = new Message(req.body);
    message.timestamp = new Date();

    const room = await checkOrCreateRoom(roomId);

    // TODO: get userId on creation or some kind of token to identify them
    const uuid = req.body.uuid;
    const user = await User.findOne({ uuid: uuid }).exec();

    if (user) { 
        message.roomId = room._id;
        message.userId = user._id;
        message.save((err, msg) => handleSavedMessage(req, res, room, user, err, msg)); 
    }
}

// needs path parameter /rooms/:roomId/messages/:parentMsgId
// needs Message with userId, roomId, message, isAnonymous
exports.postReplyMessage = async (req, res) => {
    
    console.log("HEWWO MESSAGES 2");
    const roomId = req.params.roomId;
    const parentMsgId = req.params.parentMsgId;
    const message = new Message(req.body);
    message.parentMsg = parentMsgId;
    message.timestamp = new Date();

    const room = await checkOrCreateRoom(roomId);

    const uuid = req.body.uuid;
    const user = await User.findOne({ uuid: uuid }).exec();

    if (user) { 
        message.roomId = room._id;
        message.userId = user._id;
        message.save((err, msg) => handleSavedMessage(req, res, room, user, err, msg)); 
    }}

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
exports.postImage = upload.single('image'), (req, res) => {
    const roomId = req.params.roomId;
    const image = {
        img: {
            data: fs.readFileSync(path.join(__dirname + '/' + roomId + '/' + req.file.filename)),
            contentType: 'image/png'
            // THIS CONTENT TYPE MIGHT CAUSE PROBLEMS 
        }
    }
    Image.create(image, async (err, item) => {
        if (err) {
            console.log(err);
        } else {
            item = await item.save();
            res.status(201);
            res.send(item._id);
        }
    });
}

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
                    res.status(204);
                    res.send();
                }
            })
        }
    })
}


// helper methods

const checkOrCreateRoom = async roomId => {
    let room = await Room.findOne({ roomId: roomId }).exec();
    if (!room) {
        // create room
        room.roomId = id;
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
    } else {
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