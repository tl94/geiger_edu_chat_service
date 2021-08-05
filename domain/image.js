"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
 * Define the database schema for entity 'Image'.
 */
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
