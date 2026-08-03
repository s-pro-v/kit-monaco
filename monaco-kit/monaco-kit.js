/**
 * Monaco Kit — jeden plik wejściowy
 * W HTML wystarczy:
 * <script src="monaco-kit/monaco-kit.js"></script>
 *
 * Opcjonalnie przycisk ustawień:
 * <button onclick="MonacoEditorSettings.showSettings()">⚙️</button>
 */
(function () {
  const script = document.currentScript;
  const base = script && script.src ? script.src.replace(/[^/]+$/, "") : "";
  window.__MONACO_KIT_BASE__ = base;

  const files = [
    "monaco-themes.js",
    "panel-ustawien-monaco.js",
    "auto-corekt.js",
  ];

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const el = document.createElement("script");
      el.src = base + src;
      el.async = false;
      el.onload = function () {
        resolve();
      };
      el.onerror = function () {
        reject(new Error("Nie udało się załadować: " + src));
      };
      (document.head || document.documentElement).appendChild(el);
    });
  }

  files
    .reduce(function (chain, file) {
      return chain.then(function () {
        return loadScript(file);
      });
    }, Promise.resolve())
    .catch(function (err) {
      console.error("[monaco-kit]", err);
    });
})();
