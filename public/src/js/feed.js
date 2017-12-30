const POSTS_REQUEST = 'https://pwa-gram-7e675.firebaseio.com/posts.json';

var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

const form = document.querySelector('form');
const inpTitle = document.querySelector('#title');
const inpLocation = document.querySelector('#location');

const videoPlayer = document.querySelector('#player');
const canvas = document.querySelector('#canvas');
const btnCapture = document.querySelector('#capture-btn');
const imagePicker = document.querySelector('#image-picker');
const imagePickerArea = document.querySelector('#pick-image');

/**
 * @function initializeMedia
 * @description
 * Display the camera whenever the form modal is opened
 * 
 */
function initializeMedia() {
  
  // CAMERA - Browsers that does not support mediaDevices at all
  if (!('mediaDevices' in navigator)) {
    navigator.mediaDevices = {};
  }

  // CAMERA - Fallback to access the camera in older browsers
  if(!('getUserMedia' in navigator.mediaDevices)) {

    // CAMERA - Creating a polyfill of `getUserMedia`
    navigator.mediaDevices.getUserMedia = function(constraints) {
      // CAMERA - Try to fallback to the specific getUserMedia implemented by browsers
      const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented'));
      }
      return new Promise((resolve, reject) => {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }

  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(stream => {
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = 'block';
    })
    .catch(err => {
      imagePickerArea.style.display = 'block';
    });
}

/**
 * @function sendData
 * @description
 * Sending a new post to the firebase backend server to create a new post
 * @param {string} id
 * @param {string} title
 * @param {string} location
 * @returns {promise}
 */
function sendData(id, title, location) {
  fetch('https://us-central1-pwa-gram-7e675.cloudfunctions.net/storePostData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      id: id,
      title: title,
      location: location,
      image: 'https://firebasestorage.googleapis.com/v0/b/pwa-gram-7e675.appspot.com/o/sf-boat.jpg?alt=media&token=a2694b9c-aeb1-44da-a96d-9aff0c35c5e8'
    })
  }).then(data => {
    console.log(JSON.parse(data));
    updateUI();
  });
}

/**
 * @function onFormSubmit
 * @description
 * Reacting to the form submit event, getting the values of the inputs and calling
 * the method that saves a new post. This method is used as a fallback in case serviceWorker
 * is not supported
 * @param {object} form
 * @returns {null|function}
 */
function onFormSubmit(form) {
  form.addEventListener('submit', event => {
    event.preventDefault();

    // Checking the input values
    if (inpTitle.value.trim() !== '' && inpLocation.value.trim() !== '') {
      
      // Creating a post in the backend format
      const post = {
        id: new Date().toISOString(),
        title: inpTitle.value,
        location: inpLocation.value,
        image: 'https://firebasestorage.googleapis.com/v0/b/pwa-gram-7e675.appspot.com/o/sf-boat.jpg?alt=media&token=a2694b9c-aeb1-44da-a96d-9aff0c35c5e8'
      };

      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        // Registering a new serviceWorker task to save a new post
        // The post is going to be executed via serviceWorker
        navigator.serviceWorker.ready
          .then(sw => {
            writeData('sync-posts', post)
              .then(() => sw.sync.register('sync-new-post'))
              .then(() => {
                // Displaying a snack message
                const snackBarContainer = document.querySelector('#confirmation-toast');
                const data = { message: 'Your post was saved for syncing' };
                snackBarContainer.MaterialSnackbar.showSnackbar(data);
              })
              .catch(err => console.log(err));
          });
      } else {
        // Fallback in case serviceWorker is not supported by the browser
        sendData(id, title, location)
      }
    } else {
      alert('Please add valid data');
    }

    // Closing the form modal
    return closeCreatePostModal();
  });
}

/**
 * @function openCreatePostModal
 * @description
 * Display the form modal to create a new post
 * @returns {undefined}
 */
function openCreatePostModal() {
  createPostArea.style.display = 'block';
  
  // CAMERA - Displaying the camera
  initializeMedia();
  
  // ADD TO HOME - Asks the user if he wants to add the app to the home screen of the device
  if (deferredPrompt) {
    deferredPrompt.prompt();

    // ADD TO HOME - There is only once chance, if the user says no, there will be no second chance
    deferredPrompt.userChoice.then(function(choiceResult) {
      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
  imagePickerArea.style.display = 'none';
  videoPlayer.style.display = 'none';
  canvas.style.display = 'none';
}

function createSaveButton() {
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save';
  return saveButton;
}

function createCardSupportingText(text) {
  const cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = text;
  cardSupportingText.style.textAlign = 'center';
  return cardSupportingText;
}

function createCardTitleText(title) {
  const cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = title;
  return cardTitleTextElement;
}

function createCardTitle(imageUrl) {
  const cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = `url("${imageUrl}")`;
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  return cardTitle;
}

function createCardWrapper() {
  const cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  return cardWrapper;
}

function clearElement(element) {
  while(element.hasChildNodes()) {
    element.removeChild(element.lastChild);
  }
}

const cacheCard = (event) => {
  if ('caches' in window) {
    caches.open('pwagram-user-requested')
      .then(cache => {
        cache.addAll([
          'https://httpbin.org/get',
          'src/images/sf-boat.jpg'
        ]);
      });
  }
};

// Old dynamic cache functions, they were replaced by caching dynamic response
const onSave = event => cacheCard(event);
const addSaveEventListener = (name, el) => el.addEventListener(name, onSave);

shareImageButton.addEventListener('click', openCreatePostModal);
closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function createCard(post) {
  var cardWrapper = createCardWrapper();

  // Outer frame with a picture
  var cardTitle = createCardTitle(post.image);
  cardWrapper.appendChild(cardTitle);

  // Title of the card
  var cardTitleTextElement = createCardTitleText(post.title);
  cardTitle.appendChild(cardTitleTextElement);

  // Description of the card
  var cardSupportingText = createCardSupportingText(post.location);
  cardWrapper.appendChild(cardSupportingText);
  // componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(posts) {
  _.map(posts, post => createCard(post));
}

/**
 * Using the cache first, then request strategy.
 * Which basically means that a request will be fire to the server,
 * at the same time a cached version will be search, if it has been found,
 * it will be returned.
 * When the request is resolved, it will override the cached version and it will
 * override the cache as well, to keep it updated.
 */
let networkDataReceived = false;

// Fecthing the post data
fetch(POSTS_REQUEST)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    clearElement(sharedMomentsArea);
    networkDataReceived = true;
    return updateUI(data);
  });

// Return an immediate cache data to display to the user
// Remember to check if the `indexedDB` object is available
if ('indexedDB' in window) {
  readAllData('posts')
    .then(data => {
      if (!networkDataReceived) {
        clearElement(sharedMomentsArea);
        updateUI(data);
      }
    });
}

// Adding the onSubmit behavior
onFormSubmit(form);

