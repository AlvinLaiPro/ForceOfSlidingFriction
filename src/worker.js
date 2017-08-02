var CACHE_NAME = 'forceofsliding-cache-v1'
var urlsToCache = [
  '/',
  '/resources/images/barbg.png',
  '/resources/images/celiji.png',
  '/resources/images/delete-icon.png',
  '/resources/images/farmar.png',
  '/resources/images/farmarbig.png',
  '/resources/images/glass.png',
  '/resources/images/glass-btn.png',
  '/resources/images/graph-bg.png',
  '/resources/images/gray-icon.png',
  '/resources/images/icon_choice.png',
  '/resources/images/load.gif',
  '/resources/images/wood.png',
  'resources/images/wood-btn.png',
  '/resources/images/woodblock-glass.png',
  '/resources/images/woodblock-towel.png',
  '/resources/images/towel.png',
  '/resources/images/towel-btn.png',
  '/resources/images/yellow-icon.png',
  '/resources/images/yellowon-icon.png',
  '/resources/images/woodblock-wood.png'
]

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('opened cache')
      return cache.addAll(urlsToCache)
    })
  )
})

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // Cache hit - return response
      if (response) {
        return response
      }

      // IMPORTANT: Clone the request. A request is a stream and
      // can only be consumed once. Since we are consuming this
      // once by cache and once by the browser for fetch, we need
      // to clone the response.
      var fetchRequest = event.request.clone()

      return fetch(fetchRequest).then(function(response) {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        // IMPORTANT: Clone the response. A response is a stream
        // and because we want the browser to consume the response
        // as well as the cache consuming the response, we need
        // to clone it so we have two streams.
        var responseToCache = response.clone()

        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    })
  )
})
