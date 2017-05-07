'use strict';

const authRecord = require('./auth-record');
const textModeration = require('./text-moderation');
const textTranslation = require('./text-translation');

module.exports = {
    createUserRecord: authRecord.createUserRecord,
    moderateText: textModeration.moderator,
    translateText: textTranslation.translator
};