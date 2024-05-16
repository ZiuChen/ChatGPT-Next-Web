console.log("preload.js");

utools.onPluginEnter((action) => {
  window.postMessage({
    type: "utools:onPluginEnter",
    payload: action,
  });
});
