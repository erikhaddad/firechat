'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

let languagesEnum = {
  ENGLISH: 1,
  SPANISH: 2,
  PORTUGUESE: 3,
  GERMAN: 4
};

let themesEnum = {
  LIGHT: 0,
  DARK: 1
};

// Creates the user data in the RTDB when the accounts are deleted.
exports.rtdbCreateUserRecord = functions.auth.user().onCreate(event => {
  const user = event.data; // The Firebase user.

  console.log('user data', user);

  const newUser = {
    'id': user.uid,
    'name': user.displayName,
    'email': user.email,
    'avatar': user.photoURL,
    'created': '' + user.metadata.createdAt,
    'preferences': {
      'language': languagesEnum.ENGLISH,
      'moderate': false,
      'theme': themesEnum.LIGHT
    }
  };

  // Realtime Database implementation
  return admin.database().ref(`/users/${user.uid}`).update(newUser);
});

// Creates the user data in the Firestore when the accounts are deleted.
exports.firestoreCreateUserRecord = functions.auth.user().onCreate(event => {
  const user = event.data; // The Firebase user.

  console.log('user data', user);

  const newUser = {
    'id': user.uid,
    'name': user.displayName,
    'email': user.email,
    'avatar': user.photoURL,
    'created': '' + user.metadata.createdAt,
    'preferences': {
      'language': languagesEnum.ENGLISH,
      'moderate': false,
      'theme': themesEnum.LIGHT
    }
  };

  // Firestore implementation
  return admin.firestore().collection('users').doc(user.uid).set(newUser);
});
