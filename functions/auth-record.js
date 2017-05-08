'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

let languagesEnum = {
    ENGLISH: 0,
    SPANISH: 1,
    PORTUGUESE: 2,
    GERMAN: 3
};

let themesEnum = {
    LIGHT: 0,
    DARK: 1
};

// Deletes the user data in the Realtime Datastore when the accounts are deleted.
exports.createUserRecord = functions.auth.user().onCreate(event => {
    const user = event.data; // The Firebase user.

    console.log('user data', user);

    const newUser = {
        'id': user.uid,
        'name': user.displayName,
        'email': user.email,
        'avatar': user.photoURL,
        'created': ''+user.metadata.createdAt,
        'preferences': {
            'language': languagesEnum.ENGLISH,
            'moderate': false,
            'theme': themesEnum.LIGHT
        }
    };

    return admin.database().ref(`/users/${user.uid}`).update(newUser);
});