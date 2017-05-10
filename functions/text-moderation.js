'use strict';

const functions = require('firebase-functions');
const capitalizeSentence = require('capitalize-sentence');
const Filter = require('bad-words');
const badWordsFilter = new Filter();

let languagesEnum = {
    ENGLISH: 0,
    SPANISH: 1,
    PORTUGUESE: 2,
    GERMAN: 3
};

// Moderates messages by lowering all uppercase messages and removing swearwords.
exports.moderator = functions.database
    .ref('/room-messages/{roomId}/SOURCE/{messageId}').onWrite(event => {
        const message = event.data.val();

        if (message && !message.moderated && (message.language === languagesEnum.ENGLISH)) {
            // Retrieved the message values.
            console.log('Retrieved message content: ', message);

            // Run moderation checks on on the message and moderate if needed.
            const moderatedMessage = moderateMessage(message.message);

            // Update the Firebase DB with checked message.
            console.log('Message has been moderated. Saving to DB: ', moderatedMessage);

            message.message = moderatedMessage;
            message.moderated = true;

            return event.data.adminRef.root
                .child("room-messages")
                .child(event.params.roomId)
                .child("OUTPUT")
                .child(event.params.messageId + '-mod')
                .set(message);
        }
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