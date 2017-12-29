let deferredPrompt;
const btnEnblNotf = document.querySelectorAll('.enable-notifications');

if(!window.Promise) {
    window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
            console.log('Service Worked registered!!!');
        });
}

// Right before displaying the add to home banner
window.addEventListener('beforeinstallprompt', event => {
    console.log('beforeinstallprompt');
    event.preventDefault();
    deferredPrompt = event;
    return false;
});

const displayConfirmedNotification = () => {   
    if ('serviceWorker' in navigator) {
        /**
         * Notifications are not shown by the browser as one might think,
         * they are managed by the device the user is using. Therefore, some
         * options are just available in one or another device.
         * OPTIONS
         * tag - If two notifications have the same tag, just the most recent one will
         * be displayed, avoiding displaying too many messages to the user.
         * Maybe the operation system will have this displayed by default, to avoid spam,
         * but if it's not the case, the tag options can emulate this option
         * actions - Never rely on the actions, because some devices can display all buttons,
         * some just two, some not even show them. It takes an array, each item representing
         * a button that will be displayed
         */
        const options = {
            body: 'You successfully subscribed to our Notification service',
            icon: '/src/images/icons/app-icon-96x96.png',
            image: '/src/images/sf-boat.jpg',
            dir: 'ltr',
            lang: 'en-US',
            vibrate: [100, 50, 200], // vibration, pause, vibration, pause...
            badge: '/src/images/icons/app-icon-96x96.png',
            tag: 'confirm-notification',
            actions: [
                { action: 'confirm', title: 'Okay', icon: '/src/images/icons/app-icon-96x96.png' },
                { action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png' }
            ]
        };
        const title = 'Successfully subscribed (SW)';
        const swReady = navigator.serviceWorker.ready;
        swReady.then(swRegistration => {
            swRegistration.showNotification(title, options);
        });
    }
};

const askNotificationPermission = () => {
    /**
     * Asking for Notification permission also enables the Push feature
     * if the user accepts it.
     */
    Notification.requestPermission(result => {
        if (result !== 'granted') {
            console.log('[Notification] No notification permission granted!')
            // OPTIONAL - Hide button
            return false;
        } else {
            console.log('[Notification] Permission granted!');
            displayConfirmedNotification();
            // OPTIONAL - Hide button
        }
    });
};

if('Notification' in window) {
    Array.prototype.map.call(btnEnblNotf, button => {
        button.style.display = 'inline-block';
        button.addEventListener('click', askNotificationPermission);
    });
}