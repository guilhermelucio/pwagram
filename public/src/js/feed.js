const POSTS_REQUEST = 'https://pwa-gram-7e675.firebaseio.com/posts.json';

var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);

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
  componentHandler.upgradeElement(cardWrapper);
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

fetch(POSTS_REQUEST)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    clearElement(sharedMomentsArea);
    networkDataReceived = true;
    return updateUI(data);
  });

// Remember to check if the `caches` object is available
if ('indexedDB' in window) {
  readAllData('posts')
    .then(data => {
      if (!networkDataReceived) {
        console.log(data);
        clearElement(sharedMomentsArea);
        updateUI(data);
      }
    });
}

