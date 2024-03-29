/**
 * defines the database schema for entity 'Room'.
 *
 * @author Turan Ledermann
 * @author Felix Mayer
 **/

"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    roomId: {
        type: String
    },
    roomName: {
        type: String
    },
    users: [
        { type: mongoose.Types.ObjectId, ref: 'User' }
    ],
    messages: [
        { type: mongoose.Types.ObjectId, ref: 'Message' }
    ],
    pinnedMessages: [
        { type: mongoose.Types.ObjectId, ref: 'Message' }
    ]
},
    {
        collection: 'rooms'
    });

/*
 * Activate the usage of virtual fields if toJSON method is called.
 */
roomSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('Room', roomSchema);
