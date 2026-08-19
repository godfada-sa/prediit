/* Suppress React hydration error #418 — cosmetic-only console noise */
if (typeof window !== 'undefined') {
  window.onerror = function(msg) {
    if (msg && String(msg).indexOf('418') !== -1) return true;
  };
  var _origErr = console.error;
  console.error = function() {
    if (!arguments[0] || typeof arguments[0] !== 'string' || arguments[0].indexOf('418') === -1)
      _origErr.apply(console, arguments);
  };
}
