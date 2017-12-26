let deferredPrompt;

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