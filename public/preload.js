utools.onPluginEnter((action) => {
  window.__UTOOLS__ = { action };

  const height = utools.dbStorage.getItem("utools-config/plugin-height");
  if (height !== null) {
    utools.setExpendHeight(height);
  }
});
