'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const capitalizeSentence = require('capitalize-sentence');
const Filter = require('bad-words');
const badWordsFilter = new Filter();

let languagesEnum = {
    ENGLISH: 1,
    SPANISH: 2,
    PORTUGUESE: 3,
    GERMAN: 4
};

// Moderates messages by lowering all uppercase messages and removing swearwords.
exports.rtdbModerator = functions.database
    .ref('/room-messages/{roomId}/SOURCE/{messageId}').onWrite(event => {
        const message = event.data.val();

        const msgVersions = [];

        if (message) {
            // Update the Firebase DB with original message.
            console.log('Detected new message for copying and moderation', message);

            // push original message
            msgVersions.push(message);

            // copy original message for moderation
            let moderatedMessage = JSON.parse(JSON.stringify(message));
            moderatedMessage.message = moderateMessage(message.message);
            moderatedMessage.moderated = true;
            // push moderated version
            msgVersions.push(moderatedMessage);
        }

        let promises = msgVersions.map(version => {
            if (version.moderated) {
                return event.data.adminRef.root
                    .child("room-messages")
                    .child(event.params.roomId)
                    .child("TRANSLATE")
                    .child(event.params.messageId + '-mod')
                    .set(version);
            } else {
                return event.data.adminRef.root
                    .child("room-messages")
                    .child(event.params.roomId)
                    .child("TRANSLATE")
                    .child(event.params.messageId + '-raw')
                    .set(version);
            }
        });

        return Promise.all(promises);
    });

// Moderates messages by lowering all uppercase messages and removing swearwords.
exports.firestoreModerator = functions.firestore
  .document('/room-messages/{roomId}/SOURCE/{messageId}').onCreate(event => {
    const message = event.data.val();

    let db = admin.firestore();
    const msgVersions = [];

    if (message) {
      // Update the Firebase DB with original message.
      console.log('Detected new message for copying and moderation', message);

      // push original message
      msgVersions.push(message);

      // copy original message for moderation
      let moderatedMessage = JSON.parse(JSON.stringify(message));
      moderatedMessage.message = moderateMessage(message.message);
      moderatedMessage.moderated = true;
      // push moderated version
      msgVersions.push(moderatedMessage);
    }

    let promises = msgVersions.map(version => {
      if (version.moderated) {
        return db.collection("room-messages")
                  .document(event.params.roomId)
                  .collection("TRANSLATE")
                  .document(event.params.messageId + '-mod')
                  .set(version);
      } else {
        return db.collection("room-messages")
                  .document(event.params.roomId)
                  .collection("TRANSLATE")
                  .document(event.params.messageId + '-raw')
                  .set(version);
      }
    });

    return Promise.all(promises);
  });

// Moderates the given message if appropriate.
function moderateMessage(message) {
    // Re-capitalize if the user is Shouting.
    if (isShouting(message)) {
        console.log('User is shouting. Fixing sentence case...');
        message = stopShouting(message);
    }

    // Moderate if the user uses SwearWords.
    if (containsSwearwords(message)) {
        console.log('User is swearing. moderating...');
        message = moderateSwearwords(message);
    }

    return message;
}

// Returns true if the string contains swearwords.
function containsSwearwords(message) {
    return message !== badWordsFilter.clean(message);
}

// Hide all swearwords. e.g: Crap => ****.
function moderateSwearwords(message) {
    return badWordsFilter.clean(message);
}

// Detect if the current message is shouting. i.e. there are too many Uppercase
// characters or exclamation points.
function isShouting(message) {
    return message.replace(/[^A-Z]/g, '').length > message.length / 2 || message.replace(/[^!]/g, '').length >= 3;
}

// Correctly capitalize the string as a sentence (e.g. uppercase after dots)
// and remove exclamation points.
function stopShouting(message) {
    return capitalizeSentence(message.toLowerCase()).replace(/!+/g, '.');
}
