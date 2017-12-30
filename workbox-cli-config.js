module.exports = {
  "globDirectory": "public/",
  "globPatterns": [
    "**/*.{html,ico,json,css,png,jpg,js}"
  ],
  "swDest": "public/service-worker.js",
  "swSrc": "public/sw-base.js",
  "globIgnores": [
    "../workbox-cli-config.js",
    "help/**"
  ]
};
