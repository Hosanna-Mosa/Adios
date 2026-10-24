module.exports = function (api) {
  // Release bundles are built with NODE_ENV=production; dev and test builds keep their logs.
  const isProduction = api.env("production");
  api.cache.using(() => isProduction);
  return {
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
    // console.log/info/debug can carry order, location and payment payloads, so none of
    // them ship. warn and error stay for crash diagnostics.
    plugins: isProduction ? [["transform-remove-console", { exclude: ["error", "warn"] }]] : [],
  };
};
