"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
 * Define the database schema for entity 'Message'.
 */
const messageSchema = new Schema({
    roomId: {
        type: String
    },
    userId: {
        type: mongoose.Types.ObjectId, ref: 'User'
    },
    parentMsg: {
        type: mongoose.Types.ObjectId, ref: 'Message'
    },
    childMsgs: [
        {
            type: mongoose.Types.ObjectId, ref: 'Message'
        }
    ],
    message: {
        type: String
    },
    timestamp: {
        type: Date
    },
    imageId: {
        type: mongoose.Types.ObjectId, ref: 'Image'
    }
}, {
    collection: 'messages'
});

/*
 * Activate the usage of virtual fields if toJSON method is called.
 */
messageSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('Message', messageSchema);
