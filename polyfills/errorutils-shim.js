// Ensures global.ErrorUtils exists as early as possible, before RN core sets handlers
(function initErrorUtilsShim() {
  try {
    var g = (typeof global !== 'undefined' ? global : (typeof globalThis !== 'undefined' ? globalThis : this));
    if (!g) return;
    var noop = function () {};
    var defaultHandler = function (error) {
      // eslint-disable-next-line no-console
      try { console.error('Unhandled error (early polyfill):', error); } catch (_) {}
    };

    if (!g.ErrorUtils || typeof g.ErrorUtils !== 'object') {
      g.ErrorUtils = {
        setGlobalHandler: noop,
        getGlobalHandler: function () { return defaultHandler; },
        reportFatalError: noop,
        reportError: noop,
        inGuard: function () { return false; },
        applyWithGuard: function (fun, context, args) { return fun.apply(context, args || []); },
      };
    } else {
      g.ErrorUtils.setGlobalHandler = g.ErrorUtils.setGlobalHandler || noop;
      g.ErrorUtils.getGlobalHandler = g.ErrorUtils.getGlobalHandler || function () { return defaultHandler; };
      g.ErrorUtils.reportFatalError = g.ErrorUtils.reportFatalError || noop;
      g.ErrorUtils.reportError = g.ErrorUtils.reportError || noop;
      g.ErrorUtils.inGuard = g.ErrorUtils.inGuard || function () { return false; };
      g.ErrorUtils.applyWithGuard = g.ErrorUtils.applyWithGuard || function (fun, context, args) { return fun.apply(context, args || []); };
    }
  } catch (e) {
    try { console.error('Error initializing ErrorUtils polyfill:', e); } catch (_) {}
  }
})();
