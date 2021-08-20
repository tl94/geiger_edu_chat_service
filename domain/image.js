/**
 * defines the database schema for entity 'Image'.
 *
 * @author Turan Ledermann
 * @author Felix Mayer
 **/

"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    img:
    {
        data: Buffer,
        contentType: String
    }
}, {
    collection: 'images'
});

/*
 * Activate the usage of virtual fields if toJSON method is called.
 */
imageSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('Image', imageSchema);
