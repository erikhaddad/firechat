'use strict';

const authRecord = require('./auth-record');
const textModeration = require('./text-moderation');
const textTranslation = require('./text-translation');
const vision = require('./vision');

let storageUploadVision = functions.storage.object()
  .onChange(vision.annotatePhoto);

module.exports = {
  createUser: authRecord.firestoreCreateUserRecord,
  moderateMessage: textModeration.firestoreModerator,
  translateMessage: textTranslation.firestoreTranslator,
  storageUploadVision: storageUploadVision
};
