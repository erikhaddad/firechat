const _ = require('lodash');
const firebase = require('firebase');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
//admin.initializeApp(functions.config().firebase);
const vision = require('@google-cloud/vision')();
const util = require('util');


/* Expected input: lES9QqFENNZZkd3mCtTQLVgiNUQ2/full/-KfFC5qX2Eiex_oGYfCP/IMG_20170313_134331.jpg */
function derivePathMap(path) {
    let pathMap = {};

    if (!!path) {
        let pathTokens = path.split('/');

        if (pathTokens.length == 4) {
            let userId = pathTokens[0];
            let postId = pathTokens[2];
            let filename = pathTokens[3];

            if (!!userId && !!postId && !!filename) {
                pathMap = {userId: userId, postId: postId, filename: filename};
            }
        }
    }

    return pathMap;
}

function annotatePhoto(evt) {
    const object = evt.data; // The Storage object.

    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    const filePath = object.name; // File path in the bucket.
    const pathMap = derivePathMap(filePath);
    const contentType = object.contentType; // File content type.
    const resourceState = object.resourceState; // The resourceState is 'exists' or 'not_exists' (for file/folder deletions).

    // Exit if this is triggered on a file that is not an image.
    if (!contentType.startsWith('image/')) {
        console.log('This is not an image.');
        return;
    }

    // Exit if this is a move or deletion event.
    if (resourceState === 'not_exists') {
        console.log('This is a deletion event.');
        return;
    }

    // Construct a Cloud Vision request
    let req = {
        image: {
            source: {
                gcsImageUri: util.format('gs://%s/%s', fileBucket, filePath)
            }
        },
        features: [{ type: 'LABEL_DETECTION' }]
    };

    // Make the Cloud Vision request
    return vision.annotate(req)
        .then(function(data) {
            let annotations = data[0];
            let apiResponse = data[1];

            let err = _.get(apiResponse, 'responses[0].error');
            if (err) {
                throw new Error(err.message);
            }

            // Save the annotations into the file in the database
            let labelAnnotations = _.get(annotations, '[0].labelAnnotations');
            if (labelAnnotations) {
                return admin.database().ref().child('tags/'+pathMap.postId).update(labelAnnotations);
            }
        });
}

module.exports = {
    annotatePhoto: annotatePhoto
};
