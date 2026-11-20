/* Created only when SVG is requested; receives pixels, never a network document. */
importScripts('core.js?v=20261120-1');
self.onmessage = function (event) {
  try { self.postMessage({ result: self.DrawingCore.vectorize(event.data.image, event.data.options) }); }
  catch (error) { self.postMessage({ error: error.message || '矢量化失败。' }); }
};
