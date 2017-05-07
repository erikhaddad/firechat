'use strict';

const functions = require('firebase-functions');

const Translate = require('@google-cloud/translate');
const translate = Translate({keyFilename: "service-account-credentials.json"});

function getLanguageWithoutLocale(languageCode) {
    if (languageCode.indexOf("-") >= 0) {
        return languageCode.substring(0, languageCode.indexOf("-"));
    }
    return languageCode;
}

exports.translator = functions.database
    .ref('/room-messages/{roomId}/{messageId}')
    .onWrite((event) => {
        let value = event.data.val();
        let text = value.text ? value.text : value;
        let languages = ["en", "es", "pt", "de", "ja", "hi", "nl"];
        // all supported languages: https://cloud.google.com/translate/docs/languages
        let from = value.language ? getLanguageWithoutLocale(value.language) : "en";
        let promises = languages.map(to => {
            console.log(`translating from '${from}' to '${to}', text '${text}'`);
            // call the Google Cloud Platform Translate API
            if (from == to) {
                return event.data.adminRef.root
                    .child("translations").child(event.params.transcriptId).child(to)
                    .set({text: text, language: from});
            } else {
                return translate.translate(text, {
                    from: from,
                    to: to
                }).then(result => {
                    // write the translation to the database
                    let translation = result[0];
                    return event.data.adminRef.root
                        .child("translations").child(event.params.transcriptId).child(to)
                        .set({text: translation, language: to});
                });
            }
        });
        return Promise.all(promises);
    });