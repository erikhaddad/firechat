'use strict';

const authRecord = require('./auth-record');
const textModeration = require('./text-moderation');
const textTranslation = require('./text-translation');

module.exports = {
    createUser: authRecord.firestoreCreateUserRecord,
    moderateMessage: textModeration.firestoreModerator,
    translateMessage: textTranslation.firestoreTranslator
};
