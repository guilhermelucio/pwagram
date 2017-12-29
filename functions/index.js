const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
var serviceAccount = require("./pwa-gram-fb-key.json");

// // Create and Deploy Your First Cloud Functions
// // q
//
admin.initializeApp({
    databaseURL: 'https://pwa-gram-7e675.firebaseio.com/',
    credential: admin.credential.cert(serviceAccount)
});

exports.storePostData = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        const promise = admin.database().ref('posts').push({
            id: request.body.id,
            title: request.body.title,
            image: request.body.image,
            location: request.body.location
        });
        promise.then(() => response.status(201).json({ message: 'Data stored', id: request.body.id }));
        promise.catch(err => response.status(500).json({ error: err }));
    });
});
