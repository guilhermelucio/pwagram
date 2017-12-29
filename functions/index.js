const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const serviceAccount = require("./pwa-gram-fb-key.json");
const webpush = require('web-push');

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
        promise
            .then(() => {
                webpush.setVapidDetails(
                    'mailto:guilhermelucio.design@gmail.com',
                    'BIyTDSIbL1H8S9TdesqxlSByQVu36zADcMDIErjbceZDw3gLrEqZRbYiJt4t4Eogh6b1pgXpAZv_OqaK-0qkJ-M',
                    '33eMz-bmheacx21yZpXdmmWjF5-Bj0h6LmFMQwMryBY'
                );
                return admin.database().ref('subscriptions').once('value');
            })
            .then(subscriptions => {
                /**
                 * For each is provided by the admin.database api to loop through the results
                 */
                subscriptions.forEach(sub => {
                    /**
                     * sub is each item inside of subscription, as it was used a special
                     * .forEach admin method to loop through items, before accessing the
                     * values of each item, the method val should be executed, this gives
                     * access to the properties of the database items
                     */
                    const pushConfig = {
                        endpoint: sub.val().endpoint,
                        keys: sub.val().keys // auth and p256dh properties
                    };

                    /**
                     * Sending the notification
                     * The payload of the notification is arbitrary, anything could be passed in
                     **/
                    webpush
                        .sendNotification(pushConfig, JSON.stringify({
                            title: 'New Post',
                            content: 'New post added!!!',
                            openURL: '/'
                        }))
                        .catch(err => console.error(err));
                });
                return response.status(201).json({ message: 'Data stored', id: request.body.id });
            })
            .catch(err => response.status(500).json({ error: err }));
    });
});
