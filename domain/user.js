/**
 * defines the database schema for entity 'User'.
 *
 * @author Turan Ledermann
 * @author Felix Mayer
 **/

"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String
    },
    messages: [
        {type: mongoose.Types.ObjectId, ref: 'Message'}
    ],
    profileImage: {
        type: String
    },
    learnScore: {
        type: Number
    },
    isAnonymous: {
        type: Boolean
    },
    showLearnScore: {
        type: Boolean
    }
},
    {
        collection: 'users'
    });

/*
 * Activate the usage of virtual fields if toJSON method is called.
 */
userSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('User', userSchema);
