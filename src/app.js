import run from './presenter/run'
import layout from './presenter/layout'
import runtime from 'serviceworker-webpack-plugin/lib/runtime'
if ('serviceWorker' in navigator) {
  const registration = runtime
    .register()
    .then(function(registration) {
      console.log('registration successful', registration.scope)
    })
    .catch(function(err) {
      console.log('registration failed', err)
    })
}
$(function() {
  run(document.body)
})
