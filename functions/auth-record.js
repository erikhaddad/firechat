'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// Deletes the user data in the Realtime Datastore when the accounts are deleted.
exports.createUserRecord = functions.auth.user().onCreate(event => {
    const user = event.data; // The Firebase user.

    console.log('user data', user);

    const newUser = {
        'uid': user.uid,
        'name': user.displayName,
        'email': user.email,
        'avatar': user.photoURL,
        'created': ''+user.metadata.createdAt
    };

    return admin.database().ref(`/users/${user.uid}`).update(newUser);
});