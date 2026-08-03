/**
 * Monaco Editor Settings Panel & CSS Var Injector
 * Ładowany przez monaco-kit.js (auto: root-monaco.css + hook create)
 */

(function () {
  const SCRIPT_BASE = (() => {
    if (window.__MONACO_KIT_BASE__) return window.__MONACO_KIT_BASE__;
    const src = document.currentScript && document.currentScript.src;
    return src ? src.replace(/[^/]+$/, "") : "";
  })();

  class MonacoEditorSettingsManager {
    constructor() {
      this.CODE_EDITOR_SETTINGS_KEY = "codeEditorSettings";
      this.THEME_KEY = "cyber-refactor-theme";
      this.scriptBase = SCRIPT_BASE;
      this._createHooked = false;

      this.editors = [];
      this.inputEditor = null;
      this.outputEditor = null;

      this.settings = {
        fontSize: 14,
        fontFamily: '"JetBrains Mono", monospace',
        lineHeight: 0,
        wordWrap: "off",
        minimap: true,
        lineNumbers: "on",
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        tabSize: 4,
        insertSpaces: true,
        renderWhitespace: "none",
        renderLineHighlight: "all",
        renderIndentGuides: true,
        cursorStyle: "line",
        cursorBlinking: "blink",
        scrollBeyondLastLine: true,
        smoothScrolling: false,
        mouseWheelZoom: false,
        roundedSelection: false,
        formatOnPaste: false,
        formatOnType: false,
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: "on",
        quickSuggestions: { other: true, comments: false, strings: true },
        quickSuggestionsDelay: 100,
        autoIndent: "full",
        bracketPairColorization: true,
        colorDecorators: true,
        folding: true,
        showFoldingControls: "mouseover",
        matchBrackets: "always",
        occurrencesHighlight: true,
        selectionHighlight: true,
        codeLens: false,
        links: true,
        multiCursorModifier: "alt",
        dragAndDrop: true,
        emptySelectionClipboard: true,
        copyWithSyntaxHighlighting: true,
        cursorSmoothCaretAnimation: false,
        cursorSurroundingLines: 0,
        cursorSurroundingLinesStyle: "default",
        stickyScroll: { enabled: false },
        guides: { bracketPairs: true },
      };

      this.loadSettings();

      // Auto-inicjalizacja natychmiast po załadowaniu drzewa DOM
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.boot());
      } else {
        this.boot();
      }
    }

    boot() {
      this.injectRootCss();
      this.injectStyles();
      this.injectDOM();
      this.applyTheme(localStorage.getItem(this.THEME_KEY) || "dark", false);
      this.bindThemeToggle();
      this.bindGlobalEvents();
      this.hookMonacoCreate();
    }

    injectRootCss() {
      if (document.getElementById("root-monaco-css")) return;

      const href = this.scriptBase
        ? this.scriptBase + "root-monaco.css"
        : "root-monaco.css";
      const link = document.createElement("link");
      link.id = "root-monaco-css";
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }

    waitForMonaco(callback, timeoutMs) {
      const deadline = Date.now() + (timeoutMs || 30000);

      const tick = () => {
        if (window.monaco && monaco.editor && monaco.editor.create) {
          callback();
          return;
        }
        if (Date.now() >= deadline) return;
        setTimeout(tick, 50);
      };

      tick();
    }

    hookMonacoCreate() {
      this.waitForMonaco(() => {
        if (this._createHooked || monaco.editor.create.__monacoSettingsHooked) {
          return;
        }

        const originalCreate = monaco.editor.create.bind(monaco.editor);
        const self = this;

        monaco.editor.create = function (container, options, override) {
          const merged = Object.assign(
            {},
            self.getEditorOptions(),
            options || {},
          );
          const editor = originalCreate(container, merged, override);
          if (editor && self.editors.indexOf(editor) === -1) {
            self.editors.push(editor);
          }
          return editor;
        };

        monaco.editor.create.__monacoSettingsHooked = true;
        this._createHooked = true;

        // Motyw terminal-* po defineTheme (monaco-themes.js)
        this.applyTheme(localStorage.getItem(this.THEME_KEY) || "dark", false);
      });
    }

    get elements() {
      return {
        overlay: document.getElementById("settingsOverlay"),
        sidebar: document.getElementById("settingsSidebar"),
        body: document.getElementById("settingsSidebarBody"),
      };
    }

    injectStyles() {
      if (document.getElementById("monaco-settings-styles")) return;

      const style = document.createElement("style");
      style.id = "monaco-settings-styles";
      style.textContent = `
                @import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Share+Tech+Mono&display=swap");
                @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css");
    
               ::-webkit-scrollbar {
                  width: 8px;
                  height: 8px;
               }

               ::-webkit-scrollbar-track {
                  background: var(--oi-bg-color);
               }

               ::-webkit-scrollbar-thumb {
                  background: var(--oi-border-color);
                  border: 1px solid var(--oi-bg-color);
               }

               ::-webkit-scrollbar-thumb:hover {
                  background: var(--oi-highlight);
               }

               .monaco-editor .margin {
                  background-color: var(--oi-bg-secondary) !important;
                  max-width: 48px;
               }

               .monaco-editor .margin-view-overlays {
                  max-width: 40px;
                  min-width: 24px;
               }

               .setting-label input[type="checkbox"] {
                  width: 20px;
                  height: 20px;
                  min-width: 20px;
                  cursor: pointer;
                  accent-color: var(--oi-highlight-color);
                  border: 1px solid var(--oi-border-color);
                  background-color: var(--oi-card-bg);
                  appearance: none;
                  -webkit-appearance: none;
                  position: relative;
                  transition: background-color var(--oi-transition-speed), border-color var(--oi-transition-speed);
                  margin-left: auto;
                  box-shadow: var(--oi-shadow-inset);
                  box-sizing: border-box;
               }

               .setting-label input[type="checkbox"]:checked {
                  background-color: var(--oi-highlight-color);
                  outline-offset: -2px;
                  outline: 1px solid var(--oi-bg-color);
               }

               .setting-label input[type="checkbox"]:checked::after {
                  content: "✓";
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  color: var(--oi-text-inverse);
                  font-size: 0.7rem;
                  font-weight: 700;
                  line-height: 1;
               }

               .setting-item.setting-range {
                  display: flex;
                  flex-direction: column;
                  gap: 5px;
               }

               .setting-control {
                  display: flex;
                  align-items: center;
                  gap: 10px;
               }

               .setting-control input[type="range"] {
                  flex: 1;
                  height: 10px;
                  background: var(--oi-bg-color);
                  outline: none;
                  border: 1px solid var(--oi-border-color);
                  cursor: pointer;
                  -webkit-appearance: none !important;
               }

               .setting-control input[type="range"]::-webkit-slider-runnable-track {
                  height: 10px;
                  background: var(--oi-border-color-hover);
                  border: 1px solid var(--oi-border-color);
               }

               .setting-control input[type="range"]::-webkit-slider-thumb {
                  -webkit-appearance: none !important;
                  width: 15px;
                  height: 15px;
                  background: var(--oi-highlight) !important;
                  cursor: pointer;
                  border: 2px solid var(--oi-highlight) !important;
                  margin-top: -4px;
               }

               .setting-value {
                  color: var(--oi-highlight);
                  font-weight: bold;
                  min-width: 45px;
                  text-align: right;
                  font-size: 0.75rem;
               }

               .se-select-wrap {
                  position: relative;
                  width: 100%;
                  z-index: 1;
               }

               .se-select-wrap.se-select-open {
                  z-index: 20;
               }

               .se-select-btn {
                  background-color: var(--oi-card-bg);
                  color: var(--oi-text-primary);
                  border: 1px solid var(--oi-border-color);
                  padding: 0 0.8rem;
                  cursor: pointer;
                  font-size: 0.8rem;
                  font-weight: 600;
                  font-family: var(--oi-font-family);
                  text-transform: uppercase;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  transition: all var(--oi-transition-speed);
                  height: 36px;
                  box-sizing: border-box;
                  width: 100%;
                  position: relative;
               }

               .se-select-btn:hover {
                  border-bottom-color: var(--oi-highlight-color);
                  color: var(--oi-highlight-color);
                  background: var(--oi-hover-bg);
                  box-shadow: var(--oi-shadow-drop);
               }

               .se-select-btn:active {
                  box-shadow: var(--oi-shadow-inset);
               }

               .se-select-btn .se-select-arrow {
                  font-size: 0.7rem;
                  transition: transform var(--oi-transition-speed);
                  color: var(--oi-text-muted);
               }

               .se-select-btn.se-open {
                  border-bottom-color: transparent;
                  background: var(--oi-bg-tertiary);
               }

               .se-select-btn.se-open:hover {
                  border-bottom-color: var(--oi-highlight-color);
                  color: var(--oi-highlight-color);
                  background: var(--oi-hover-bg);
               }

               .se-select-btn.se-open:active {
                  box-shadow: var(--oi-shadow-inset);
               }

               .se-select-btn.se-open .se-select-arrow {
                  transform: rotate(180deg);
                  color: var(--oi-highlight-color);
               }

               .se-select-list {
                  position: absolute;
                  top: 100%;
                  left: 0;
                  right: 0;
                  background-color: var(--oi-panel-bg);
                  border: 1px solid var(--oi-border-color);
                  border-top: none;
                  z-index: 1000;
                  display: none;
                  box-shadow: var(--oi-shadow-drop);
                  max-height: 200px;
                  overflow-y: auto;
               }

               .se-select-list.se-visible {
                  display: block;
               }

               .se-select-item {
                  padding: 0 0.5rem;
                  cursor: pointer;
                  font-size: 0.8rem;
                  font-weight: 600;
                  font-family: var(--oi-font-family);
                  color: var(--oi-text-primary);
                  border-bottom: 1px solid var(--oi-border-color);
                  border-left: 3px solid transparent;
                  display: flex;
                  align-items: center;
                  transition: all var(--oi-transition-speed);
                  height: 32px;
                  box-sizing: border-box;
                  text-transform: uppercase;
               }

               .se-select-item:last-child {
                  border-bottom: none;
               }

               .se-select-item .se-select-prefix {
                  margin-right: 0.5rem;
                  opacity: 0;
                  color: var(--oi-highlight-color);
                  transition: opacity var(--oi-transition-speed);
                  font-weight: 700;
               }

               .se-select-item:hover,
               .se-select-item.se-selected {
                  background-color: var(--oi-bg-color);
                  color: var(--oi-highlight-color);
                  border-left: 3px solid var(--oi-highlight-color);
               }

               .se-select-item:hover .se-select-prefix,
               .se-select-item.se-selected .se-select-prefix {
                  opacity: 1;
               }

               .settings-overlay {
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  z-index: 1200;
                  opacity: 0;
                  pointer-events: none;
                  transition: opacity 0.3s ease;
                  background: rgba(0, 0, 0, 0.4);
               }

               .settings-overlay.active {
                  opacity: 1;
                  pointer-events: auto;
               }

               .settings-sidebar {
                  position: fixed;
                  top: 0;
                  right: 0;
                  width: 600px;
                  max-width: 90%;
                  height: 100vh;
                  background: var(--oi-panel-bg);
                  border-left: 2px solid var(--oi-border-color);
                  box-shadow: var(--oi-shadow-drop);
                  z-index: 1201;
                  display: flex;
                  flex-direction: column;
                  transform: translateX(100%);
                  transition: transform 0.3s ease;
                  overflow: hidden;
                  font-family: var(--oi-font-family);
                  color: var(--oi-text-color);
               }

               .settings-sidebar.active {
                  transform: translateX(0);
               }

               .settings-sidebar-header {
                  background-color: var(--oi-bg-color);
                  border-bottom: 1px solid var(--oi-border-color);
                  color: var(--oi-highlight);
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  flex-shrink: 0;
                  padding: 0.5rem 1rem;
                  box-shadow: var(--oi-shadow-drop);
                  background-image: var(--oi-bg-mode);
                  height: 45px;
                  box-sizing: border-box;
               }

               .settings-sidebar-title {
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 2px;
                  font-size: 0.9rem;
               }

               .settings-sidebar-header .close-settings {
                  background: var(--oi-bg-tertiary);
                  border: 1px solid var(--oi-border-color);
                  color: var(--oi-text-muted);
                  transition: all 0.2s ease;
                  width: 30px;
                  height: 30px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  cursor: pointer;
               }

               .settings-sidebar-header .close-settings:hover {
                  color: var(--oi-danger-color);
                  background: var(--oi-hover-bg);
               }

               .settings-sidebar-body {
                  flex: 1;
                  overflow-y: auto;
                  padding: 0;
                  position: relative;
               }

               .settings-sidebar .settings-tabs {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 0;
                  position: sticky;
                  top: 0;
                  z-index: 10;
                  background: var(--oi-bg-tertiary);
                  border-bottom: 1px solid var(--oi-border-color);
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  transition: background var(--oi-transition-speed);
               }

               .settings-sidebar .settings-tabs:hover {
                  background: var(--oi-hover-bg);
               }

               .settings-sidebar .settings-tabs i {
                  font-size: 1.1em;
                  margin-right: 0.4em;
                  color: var(--oi-highlight-color);
                  transition: color var(--oi-transition-speed);
                  vertical-align: middle;
               }

               .settings-sidebar .settings-tabs .settings-tab.active i {
                  color: var(--oi-text-color);
               }

               .settings-sidebar .settings-tab {
                  flex: 1;
                  min-width: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 0.4rem;
                  font-size: 0.7rem;
                  padding: 10px 8px;
                  background: var(--oi-bg-color);
                  border: none;
                  border-bottom: 2px solid transparent;
                  border-top: 2px solid transparent;
                  color: var(--oi-text-muted);
                  transition: all var(--oi-transition-speed);
                  font-weight: 600;
                  text-transform: uppercase;
                  cursor: pointer;
               }

               .settings-sidebar .settings-tab:hover {
                  background: var(--oi-hover-bg);
                  color: var(--oi-text-primary);
               }

               .settings-sidebar .settings-tab:hover i {
                  color: var(--oi-highlight-color);
               }

               .settings-sidebar .settings-tab.active {
                  background: var(--oi-bg-tertiary);
                  color: var(--oi-highlight-color);
                  border-top-color: var(--oi-highlight-color);
                  border-bottom-color: var(--oi-highlight-color);
               }

               .settings-sidebar .settings-tab-content {
                  display: none;
                  padding: 1rem;
                  border-top: 1px solid var(--oi-border-color);
                  background: var(--oi-bg-tertiary);
               }

               .settings-sidebar .settings-tab-content.active {
                  display: block;
               }

               .settings-sidebar .setting-item {
                  border-bottom: 1px solid var(--oi-border-color);
                  background-color: var(--oi-panel-bg);
                  border-left: 3px solid var(--oi-border-color);
                  box-shadow: var(--oi-shadow-drop);
                  gap: 0.5rem;
                  margin-bottom: 0.4rem;
                  padding: 0.6rem 0.8rem;
                  cursor: pointer;
                  transition: all var(--oi-transition-speed);
               }

               .settings-sidebar .setting-item:hover {
                  border-left-color: var(--oi-highlight-color);
                  padding-left: 1rem;
                  background: var(--oi-hover-bg);
               }

               .settings-sidebar .setting-item:active {
                  box-shadow: var(--oi-shadow-inset);
               }

               .settings-sidebar .setting-item:hover .setting-label {
                  color: var(--oi-highlight-color);
               }

               .setting-label {
                  display: flex;
                  align-items: center;
                  cursor: pointer;
                  color: var(--oi-highlight);
                  font-size: 0.75rem;
                  text-transform: uppercase;
                  user-select: none;
                  gap: 8px;
                  width: 100%;
                  font-weight: 600;
                  letter-spacing: 0.1em;
               }

               .setting-label i {
                  color: var(--oi-text-muted);
                  transition: color 0.2s ease;
               }

               .setting-item:hover .setting-label i {
                  color: var(--oi-text-color);
               }

               .settings-sidebar .setting-item:has(input[type="checkbox"]) .setting-label {
                  margin: -0.6rem -0.8rem;
                  padding: 0.6rem 0.8rem;
                  min-height: 2rem;
               }

               .settings-sidebar-footer {
                  border-top: 1px solid var(--oi-border-color);
                  padding: 15px 20px;
                  flex-shrink: 0;
                  background-image: var(--oi-bg-mode);
                  background-color: var(--oi-panel-bg);
               }

               .settings-footer-info {
                  display: flex;
                  flex-direction: column;
                  gap: 6px;
               }

               .settings-footer-item {
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  font-size: 0.7rem;
                  color: var(--oi-text-muted);
                  font-family: "Share Tech Mono", monospace;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
               }

               .settings-footer-item i {
                  color: var(--oi-highlight);
                  font-size: 0.75rem;
                  width: 18px;
                  text-align: center;
               }
            `;
      document.head.appendChild(style);
    }

    injectDOM() {
      if (document.getElementById("settingsSidebar")) return;

      const container = document.createElement("div");
      container.innerHTML = `
                <div id="settingsOverlay" class="settings-overlay"></div>
                <aside id="settingsSidebar" class="settings-sidebar">
                    <div class="settings-sidebar-header">
                    <span class="settings-sidebar-title">Ustawienia Edytora</span>
                    <button type="button" class="close-settings" aria-label="Zamknij"><i class="fas fa-times"></i></button>
                    </div>
                    <div id="settingsSidebarBody" class="settings-sidebar-body"></div>
                    <div class="settings-sidebar-footer">
                    <div class="settings-footer-info">
                        <div class="settings-footer-item">
                        <i class="fas fa-code-branch"></i><span>Monaco Engine: v0.52.0</span>
                        </div>
                        <div class="settings-footer-item">
                        <i class="fas fa-save"></i><span>Auto-Save: LocalStorage ON</span>
                        </div>
                    </div>
                    </div>
                </aside>
            `;
      document.body.appendChild(container);

      document
        .getElementById("settingsOverlay")
        .addEventListener("click", () => this.closeSettings());
      document
        .querySelector(".close-settings")
        .addEventListener("click", () => this.closeSettings());
    }

    loadSettings() {
      const saved = localStorage.getItem(this.CODE_EDITOR_SETTINGS_KEY);
      if (saved) {
        try {
          this.settings = { ...this.settings, ...JSON.parse(saved) };
        } catch (e) {}
      }
    }

    applyTheme(theme, persist = true) {
      if (window.HubTheme && typeof window.HubTheme.applyTheme === "function") {
        return window.HubTheme.applyTheme(theme, persist);
      }

      const normalizedTheme = theme === "light" ? "light" : "dark";
      document.documentElement.setAttribute("theme", normalizedTheme);

      if (persist) {
        localStorage.setItem(this.THEME_KEY, normalizedTheme);
      }

      if (window.monaco?.editor) {
        window.monaco.editor.setTheme(
          normalizedTheme === "light" ? "terminal-light" : "terminal-dark",
        );
      }

      const button = document.getElementById("themeToggleBtn");
      if (button) {
        const nextTheme = normalizedTheme === "dark" ? "jasny" : "ciemny";
        button.setAttribute("aria-label", `Włącz motyw ${nextTheme}`);
        button.setAttribute("title", `Włącz motyw ${nextTheme}`);
        button.dataset.theme = normalizedTheme;

        const sun = button.querySelector(".nav-pill__icon--sun");
        const moon = button.querySelector(".nav-pill__icon--moon");
        if (sun) sun.hidden = normalizedTheme !== "dark";
        if (moon) moon.hidden = normalizedTheme !== "light";
      }
      return normalizedTheme;
    }

    toggleTheme() {
      const currentTheme =
        document.documentElement.getAttribute("theme") ||
        localStorage.getItem(this.THEME_KEY) ||
        "dark";
      return this.applyTheme(currentTheme === "dark" ? "light" : "dark");
    }

    bindThemeToggle() {
      const btn = document.getElementById("themeToggleBtn");
      if (!btn || btn.dataset.bound === "1") return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", () => this.toggleTheme());
    }

    bindGlobalEvents() {
      document.addEventListener("click", (e) => {
        if (e.target.closest(".se-select-wrap")) return;
        document
          .querySelectorAll(".se-select-list.se-visible")
          .forEach((l) => l.classList.remove("se-visible"));
        document
          .querySelectorAll(".se-select-btn.se-open")
          .forEach((b) => b.classList.remove("se-open"));
        document
          .querySelectorAll(".se-select-wrap.se-select-open")
          .forEach((w) => w.classList.remove("se-select-open"));
      });
    }

    getEditorOptions() {
      const currentTheme = localStorage.getItem(this.THEME_KEY) || "dark";
      const monacoTheme =
        currentTheme === "light" ? "terminal-light" : "terminal-dark";
      const st = this.settings;

      return {
        fontSize: st.fontSize,
        fontFamily: st.fontFamily,
        lineHeight: st.lineHeight || 0,
        automaticLayout: true,
        wordWrap: st.wordWrap || "off",
        minimap: { enabled: st.minimap },
        lineNumbersMinChars: 2,
        lineDecorationsWidth: 8,
        theme: monacoTheme,
        cursorBlinking: st.cursorBlinking || "blink",
        cursorStyle: st.cursorStyle || "line",
        cursorSmoothCaretAnimation: st.cursorSmoothCaretAnimation || false,
        cursorSurroundingLines: st.cursorSurroundingLines || 0,
        cursorSurroundingLinesStyle:
          st.cursorSurroundingLinesStyle || "default",
        scrollBeyondLastLine: st.scrollBeyondLastLine !== false,
        roundedSelection: st.roundedSelection || false,
        renderLineHighlight: st.renderLineHighlight || "all",
        renderIndentGuides: st.renderIndentGuides !== false,
        tabSize: st.tabSize || 4,
        insertSpaces: st.insertSpaces !== false,
        renderWhitespace: st.renderWhitespace || "none",
        formatOnPaste: st.formatOnPaste || false,
        formatOnType: st.formatOnType || false,
        autoIndent: st.autoIndent || "full",
        bracketPairColorization: {
          enabled: st.bracketPairColorization !== false,
        },
        matchBrackets: st.matchBrackets || "always",
        guides: st.guides || { bracketPairs: true },
        autoClosingBrackets: st.autoClosingBrackets || "always",
        autoClosingQuotes: st.autoClosingQuotes || "always",
        suggestOnTriggerCharacters: st.suggestOnTriggerCharacters !== false,
        acceptSuggestionOnEnter: st.acceptSuggestionOnEnter || "on",
        acceptSuggestionOnCommitCharacter: true,
        quickSuggestions: st.quickSuggestions || {
          other: true,
          comments: false,
          strings: true,
        },
        quickSuggestionsDelay: st.quickSuggestionsDelay || 100,
        snippetSuggestions: "top",
        wordBasedSuggestions: "matchingDocuments",
        suggestSelection: "first",
        tabCompletion: "on",
        suggestLocality: "recentFiles",
        occurrencesHighlight: st.occurrencesHighlight !== false,
        selectionHighlight: st.selectionHighlight !== false,
        colorDecorators: st.colorDecorators !== false,
        folding: st.folding !== false,
        showFoldingControls: st.showFoldingControls || "mouseover",
        codeLens: st.codeLens || false,
        links: st.links !== false,
        mouseWheelZoom: st.mouseWheelZoom || false,
        multiCursorModifier: st.multiCursorModifier || "alt",
        dragAndDrop: st.dragAndDrop !== false,
        emptySelectionClipboard: st.emptySelectionClipboard !== false,
        copyWithSyntaxHighlighting: st.copyWithSyntaxHighlighting !== false,
        smoothScrolling: st.smoothScrolling || false,
        stickyScroll: st.stickyScroll || { enabled: false },
      };
    }

    applyEditorOptions() {
      const opts = this.getEditorOptions();
      if (
        this.inputEditor &&
        typeof this.inputEditor.updateOptions === "function"
      )
        this.inputEditor.updateOptions(opts);
      if (
        this.outputEditor &&
        typeof this.outputEditor.updateOptions === "function"
      )
        this.outputEditor.updateOptions(opts);
      this.editors.forEach(
        (ed) =>
          ed &&
          typeof ed.updateOptions === "function" &&
          ed.updateOptions(opts),
      );
    }

    init(...editors) {
      editors.filter(Boolean).forEach((ed) => {
        if (this.editors.indexOf(ed) === -1) this.editors.push(ed);
      });
      this.applyEditorOptions();
      return this;
    }

    setEditors(inputEditor, outputEditor) {
      this.inputEditor = inputEditor;
      this.outputEditor = outputEditor;
      this.applyEditorOptions();
    }

    updateSetting(key, value) {
      this.settings[key] = value;
      localStorage.setItem(
        this.CODE_EDITOR_SETTINGS_KEY,
        JSON.stringify(this.settings),
      );
      this.applyEditorOptions();
    }

    buildseSelect(settingKey, options, currentValue) {
      const esc = (v) =>
        String(v)
          .replace(/&/g, "&amp;")
          .replace(/"/g, "&quot;")
          .replace(/</g, "&lt;");
      const currentOption =
        options.find((o) => String(o.value) === String(currentValue)) ||
        options[0];

      const items = options
        .map(
          (o) =>
            `<div class="se-select-item ${String(o.value) === String(currentValue) ? "se-selected" : ""}" data-value="${esc(o.value)}"><span class="se-select-prefix">»</span>${esc(o.label)}</div>`,
        )
        .join("");

      return `
            <div class="se-select-wrap" data-setting="${esc(settingKey)}">
                <button type="button" class="se-select-btn">
                    <span class="se-select-label">${esc(currentOption.label)}</span>
                    <span class="se-select-arrow">▼</span>
                </button>
                <div class="se-select-list">${items}</div>
            </div>`;
    }

    bindseSelects(container) {
      if (!container) return;
      const closeAll = () => {
        container
          .querySelectorAll(".se-select-list.se-visible")
          .forEach((l) => l.classList.remove("se-visible"));
        container
          .querySelectorAll(".se-select-btn.se-open")
          .forEach((b) => b.classList.remove("se-open"));
        container
          .querySelectorAll(".se-select-wrap.se-select-open")
          .forEach((w) => w.classList.remove("se-select-open"));
      };

      container.querySelectorAll(".se-select-wrap").forEach((wrap) => {
        const btn = wrap.querySelector(".se-select-btn");
        const list = wrap.querySelector(".se-select-list");
        const labelEl = wrap.querySelector(".se-select-label");

        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const isOpen = list.classList.contains("se-visible");
          closeAll();
          if (!isOpen) {
            list.classList.add("se-visible");
            btn.classList.add("se-open");
            wrap.classList.add("se-select-open");
          }
        });

        wrap.querySelectorAll(".se-select-item").forEach((item) => {
          item.addEventListener("click", () => {
            const key = wrap.dataset.setting;
            let v = item.getAttribute("data-value");
            if (v === "true") v = true;
            else if (v === "false") v = false;

            this.updateSetting(key, v);

            const prefix = item.querySelector(".se-select-prefix");
            labelEl.textContent = prefix
              ? item.textContent.replace(prefix.textContent, "").trim()
              : item.textContent.trim();

            wrap
              .querySelectorAll(".se-select-item")
              .forEach((i) => i.classList.remove("se-selected"));
            item.classList.add("se-selected");
            closeAll();
          });
        });
      });
    }

    closeSettings() {
      const s = this.elements;
      if (s.sidebar) s.sidebar.classList.remove("active");
      if (s.overlay) s.overlay.classList.remove("active");
    }

    switchSettingsTab(tabId) {
      document
        .querySelectorAll(".settings-tab")
        .forEach((el) => el.classList.remove("active"));
      document
        .querySelectorAll(".settings-tab-content")
        .forEach((el) => el.classList.remove("active"));

      const tab = document.querySelector(
        '.settings-tab[data-tab="' + tabId + '"]',
      );
      if (tab) tab.classList.add("active");

      const content = document.getElementById("settings-" + tabId);
      if (content) content.classList.add("active");
    }

    showSettings() {
      // Upewniamy się, że HTML został wstrzyknięty przed otwarciem
      this.injectDOM();

      const sb = this.elements.body;
      const s = this.elements;
      if (!sb || !s.sidebar || !s.overlay) return;
      const st = this.settings;

      sb.innerHTML = `
                <div class="settings-tabs">
                    <div class="settings-tab active" data-tab="general"><i class="fas fa-cog settings-tab-icon"></i> GENERAL</div>
                    <div class="settings-tab" data-tab="cursor"><i class="fas fa-mouse-pointer settings-tab-icon"></i> CURSOR</div>
                    <div class="settings-tab" data-tab="formatting"><i class="fas fa-code settings-tab-icon"></i> FORMATTING</div>
                    <div class="settings-tab" data-tab="display"><i class="fas fa-eye settings-tab-icon"></i> DISPLAY</div>
                    <div class="settings-tab" data-tab="advanced"><i class="fas fa-sliders-h settings-tab-icon"></i> ADVANCED</div>
                </div>
                
                <div id="settings-general" class="settings-tab-content active">
                    <div class="setting-item setting-range">
                        <label class="setting-label"><i class="fas fa-font setting-icon"></i> Font Size</label>
                        <div class="setting-control">
                            <input type="range" data-setting="fontSize" min="10" max="24" value="${st.fontSize}">
                            <span class="setting-value" id="val-fontSize">${st.fontSize}px</span>
                        </div>
                    </div>
                    <div class="setting-item setting-range">
                        <label class="setting-label"><i class="fas fa-text-height setting-icon"></i> Line Height</label>
                        <div class="setting-control">
                            <input type="range" data-setting="lineHeight" min="0" max="50" value="${st.lineHeight || 0}">
                            <span class="setting-value" id="val-lineHeight">${st.lineHeight === 0 ? "Auto" : st.lineHeight + "px"}</span>
                        </div>
                    </div>
                    <div class="setting-item setting-select">
                        <label class="setting-label"><i class="fas fa-font setting-icon"></i> Font Family</label>
                        ${this.buildseSelect(
                          "fontFamily",
                          [
                            {
                              value: '"JetBrains Mono", monospace',
                              label: "JetBrains Mono",
                            },
                            {
                              value: '"Share Tech Mono", monospace',
                              label: "Share Tech Mono",
                            },
                            {
                              value: '"Courier New", monospace',
                              label: "Courier New",
                            },
                            { value: "monospace", label: "System Monospace" },
                          ],
                          st.fontFamily,
                        )}
                    </div>
                    <div class="setting-item setting-range">
                        <label class="setting-label"><i class="fas fa-indent setting-icon"></i> Tab Size</label>
                        <div class="setting-control">
                            <input type="range" data-setting="tabSize" min="2" max="8" value="${st.tabSize}">
                            <span class="setting-value" id="val-tabSize">${st.tabSize}</span>
                        </div>
                    </div>
                    <div class="setting-item setting-select">
                        <label class="setting-label"><i class="fas fa-text-width setting-icon"></i> Word Wrap</label>
                        ${this.buildseSelect(
                          "wordWrap",
                          [
                            { value: "on", label: "ON" },
                            { value: "off", label: "OFF" },
                          ],
                          st.wordWrap,
                        )}
                    </div>
                    <div class="setting-item">
                        <label class="setting-label"><i class="fas fa-map setting-icon"></i> Minimap <input type="checkbox" data-setting="minimap" ${st.minimap ? "checked" : ""}></label>
                    </div>
                </div>
    
                <div id="settings-cursor" class="settings-tab-content">
                    <div class="setting-item setting-select">
                        <label class="setting-label"><i class="fas fa-mouse-pointer setting-icon"></i> Cursor Style</label>
                        ${this.buildseSelect(
                          "cursorStyle",
                          [
                            { value: "line", label: "LINE" },
                            { value: "block", label: "BLOCK" },
                            { value: "underline", label: "UNDERLINE" },
                            { value: "line-thin", label: "LINE THIN" },
                            { value: "block-outline", label: "BLOCK OUTLINE" },
                          ],
                          st.cursorStyle,
                        )}
                    </div>
                    <div class="setting-item setting-select">
                        <label class="setting-label"><i class="fas fa-circle setting-icon"></i> Cursor Blinking</label>
                        ${this.buildseSelect(
                          "cursorBlinking",
                          [
                            { value: "blink", label: "BLINK" },
                            { value: "smooth", label: "SMOOTH" },
                            { value: "phase", label: "PHASE" },
                            { value: "expand", label: "EXPAND" },
                            { value: "solid", label: "SOLID" },
                          ],
                          st.cursorBlinking,
                        )}
                    </div>
                    <div class="setting-item">
                        <label class="setting-label"><i class="fas fa-magic setting-icon"></i> Smooth Caret Animation <input type="checkbox" data-setting="cursorSmoothCaretAnimation" ${st.cursorSmoothCaretAnimation ? "checked" : ""}></label>
                    </div>
                </div>
    
                <div id="settings-formatting" class="settings-tab-content">
                    <div class="setting-item setting-select">
                        <label class="setting-label"><i class="fas fa-brackets-curly setting-icon"></i> Auto Close Brackets</label>
                        ${this.buildseSelect(
                          "autoClosingBrackets",
                          [
                            { value: "always", label: "ALWAYS" },
                            {
                              value: "languageDefined",
                              label: "LANGUAGE DEFINED",
                            },
                            {
                              value: "beforeWhitespace",
                              label: "BEFORE WHITESPACE",
                            },
                            { value: "never", label: "NEVER" },
                          ],
                          st.autoClosingBrackets,
                        )}
                    </div>
                    <div class="setting-item setting-select">
                        <label class="setting-label"><i class="fas fa-quote-right setting-icon"></i> Auto Close Quotes</label>
                        ${this.buildseSelect(
                          "autoClosingQuotes",
                          [
                            { value: "always", label: "ALWAYS" },
                            {
                              value: "languageDefined",
                              label: "LANGUAGE DEFINED",
                            },
                            {
                              value: "beforeWhitespace",
                              label: "BEFORE WHITESPACE",
                            },
                            { value: "never", label: "NEVER" },
                          ],
                          st.autoClosingQuotes,
                        )}
                    </div>
                    <div class="setting-item">
                        <label class="setting-label"><i class="fas fa-palette setting-icon"></i> Bracket Pair Colorization <input type="checkbox" data-setting="bracketPairColorization" ${st.bracketPairColorization ? "checked" : ""}></label>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label"><i class="fas fa-code-branch setting-icon"></i> Folding <input type="checkbox" data-setting="folding" ${st.folding ? "checked" : ""}></label>
                    </div>
                    <div class="setting-item setting-select">
                        <label class="setting-label"><i class="fas fa-indent setting-icon"></i> Insert Spaces</label>
                        ${this.buildseSelect(
                          "insertSpaces",
                          [
                            { value: true, label: "SPACES" },
                            { value: false, label: "TABS" },
                          ],
                          st.insertSpaces,
                        )}
                    </div>
                    <div class="setting-item setting-select">
                        <label class="setting-label"><i class="fas fa-align-left setting-icon"></i> Auto Indent</label>
                        ${this.buildseSelect(
                          "autoIndent",
                          [
                            { value: "none", label: "NONE" },
                            { value: "keep", label: "KEEP" },
                            { value: "brackets", label: "BRACKETS" },
                            { value: "advanced", label: "ADVANCED" },
                            { value: "full", label: "FULL" },
                          ],
                          st.autoIndent,
                        )}
                    </div>
                    <div class="setting-item">
                        <label class="setting-label"><i class="fas fa-paste setting-icon"></i> Format on Paste <input type="checkbox" data-setting="formatOnPaste" ${st.formatOnPaste ? "checked" : ""}></label>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label"><i class="fas fa-keyboard setting-icon"></i> Format on Type <input type="checkbox" data-setting="formatOnType" ${st.formatOnType ? "checked" : ""}></label>
                    </div>
                    <div class="setting-item setting-select">
                        <label class="setting-label"><i class="fas fa-brackets-curly setting-icon"></i> Match Brackets</label>
                        ${this.buildseSelect(
                          "matchBrackets",
                          [
                            { value: "always", label: "ALWAYS" },
                            { value: "near", label: "NEAR" },
                            { value: "never", label: "NEVER" },
                          ],
                          st.matchBrackets,
                        )}
                    </div>
                </div>
    
                <div id="settings-display" class="settings-tab-content">
                    <div class="setting-item setting-select">
                        <label class="setting-label"><i class="fas fa-eye-slash setting-icon"></i> Render Whitespace</label>
                        ${this.buildseSelect(
                          "renderWhitespace",
                          [
                            { value: "none", label: "NONE" },
                            { value: "boundary", label: "BOUNDARY" },
                            { value: "selection", label: "SELECTION" },
                            { value: "trailing", label: "TRAILING" },
                            { value: "all", label: "ALL" },
                          ],
                          st.renderWhitespace,
                        )}
                    </div>
                    <div class="setting-item">
                        <label class="setting-label"><i class="fas fa-align-left setting-icon"></i> Render Indent Guides <input type="checkbox" data-setting="renderIndentGuides" ${st.renderIndentGuides ? "checked" : ""}></label>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label"><i class="fas fa-arrows-alt-v setting-icon"></i> Scroll Beyond Last Line <input type="checkbox" data-setting="scrollBeyondLastLine" ${st.scrollBeyondLastLine ? "checked" : ""}></label>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label"><i class="fas fa-search-plus setting-icon"></i> Mouse Wheel Zoom <input type="checkbox" data-setting="mouseWheelZoom" ${st.mouseWheelZoom ? "checked" : ""}></label>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label"><i class="fas fa-highlighter setting-icon"></i> Occurrences Highlight <input type="checkbox" data-setting="occurrencesHighlight" ${st.occurrencesHighlight ? "checked" : ""}></label>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label"><i class="fas fa-marker setting-icon"></i> Selection Highlight <input type="checkbox" data-setting="selectionHighlight" ${st.selectionHighlight ? "checked" : ""}></label>
                    </div>
                    <div class="setting-item setting-select">
                        <label class="setting-label"><i class="fas fa-highlighter setting-icon"></i> Render Line Highlight</label>
                        ${this.buildseSelect(
                          "renderLineHighlight",
                          [
                            { value: "none", label: "NONE" },
                            { value: "gutter", label: "GUTTER" },
                            { value: "line", label: "LINE" },
                            { value: "all", label: "ALL" },
                          ],
                          st.renderLineHighlight,
                        )}
                    </div>
                </div>
    
                <div id="settings-advanced" class="settings-tab-content">
                    <div class="setting-item">
                        <label class="setting-label"><i class="fas fa-palette setting-icon"></i> Color Decorators <input type="checkbox" data-setting="colorDecorators" ${st.colorDecorators ? "checked" : ""}></label>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label"><i class="fas fa-link setting-icon"></i> Links <input type="checkbox" data-setting="links" ${st.links !== false ? "checked" : ""}></label>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label"><i class="fas fa-code setting-icon"></i> Code Lens <input type="checkbox" data-setting="codeLens" ${st.codeLens ? "checked" : ""}></label>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label"><i class="fas fa-mouse setting-icon"></i> Drag and Drop <input type="checkbox" data-setting="dragAndDrop" ${st.dragAndDrop !== false ? "checked" : ""}></label>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label"><i class="fas fa-copy setting-icon"></i> Empty Selection Clipboard <input type="checkbox" data-setting="emptySelectionClipboard" ${st.emptySelectionClipboard !== false ? "checked" : ""}></label>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label"><i class="fas fa-highlighter setting-icon"></i> Copy with Syntax Highlighting <input type="checkbox" data-setting="copyWithSyntaxHighlighting" ${st.copyWithSyntaxHighlighting !== false ? "checked" : ""}></label>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label"><i class="fas fa-sliders-h setting-icon"></i> Smooth Scrolling <input type="checkbox" data-setting="smoothScrolling" ${st.smoothScrolling ? "checked" : ""}></label>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label"><i class="fas fa-circle setting-icon"></i> Rounded Selection <input type="checkbox" data-setting="roundedSelection" ${st.roundedSelection ? "checked" : ""}></label>
                    </div>
                    <div class="setting-item setting-select">
                        <label class="setting-label"><i class="fas fa-mouse-pointer setting-icon"></i> Multi Cursor Modifier</label>
                        ${this.buildseSelect(
                          "multiCursorModifier",
                          [
                            { value: "ctrlCmd", label: "CTRL/CMD" },
                            { value: "alt", label: "ALT" },
                          ],
                          st.multiCursorModifier,
                        )}
                    </div>
                    <div class="setting-item setting-select">
                        <label class="setting-label"><i class="fas fa-code-branch setting-icon"></i> Show Folding Controls</label>
                        ${this.buildseSelect(
                          "showFoldingControls",
                          [
                            { value: "always", label: "ALWAYS" },
                            { value: "mouseover", label: "MOUSEOVER" },
                            { value: "never", label: "NEVER" },
                          ],
                          st.showFoldingControls,
                        )}
                    </div>
                    <div class="setting-item">
                        <label class="setting-label"><i class="fas fa-lightbulb setting-icon"></i> Suggest on Trigger Characters <input type="checkbox" data-setting="suggestOnTriggerCharacters" ${st.suggestOnTriggerCharacters !== false ? "checked" : ""}></label>
                    </div>
                    <div class="setting-item setting-select">
                        <label class="setting-label"><i class="fas fa-keyboard setting-icon"></i> Accept Suggestion on Enter</label>
                        ${this.buildseSelect(
                          "acceptSuggestionOnEnter",
                          [
                            { value: "on", label: "ON" },
                            { value: "smart", label: "SMART" },
                            { value: "off", label: "OFF" },
                          ],
                          st.acceptSuggestionOnEnter,
                        )}
                    </div>
                    <div class="setting-item setting-range">
                        <label class="setting-label"><i class="fas fa-clock setting-icon"></i> Quick Suggestions Delay</label>
                        <div class="setting-control">
                            <input type="range" data-setting="quickSuggestionsDelay" min="0" max="1000" step="50" value="${st.quickSuggestionsDelay || 100}">
                            <span class="setting-value" id="val-quickSuggestionsDelay">${st.quickSuggestionsDelay || 100}ms</span>
                        </div>
                    </div>
                </div>
            `;

      this.bindPanelEvents(sb);

      s.sidebar.classList.add("active");
      s.overlay.classList.add("active");
    }

    bindPanelEvents(container) {
      container.querySelectorAll(".settings-tab").forEach((tab) => {
        tab.addEventListener("click", () =>
          this.switchSettingsTab(tab.dataset.tab),
        );
      });

      container
        .querySelectorAll('input[type="checkbox"][data-setting]')
        .forEach((input) => {
          input.addEventListener("change", (e) => {
            this.updateSetting(e.target.dataset.setting, e.target.checked);
          });
        });

      container
        .querySelectorAll('input[type="range"][data-setting]')
        .forEach((input) => {
          input.addEventListener("input", (e) => {
            const setting = e.target.dataset.setting;
            const valueEl = document.getElementById(`val-${setting}`);
            if (!valueEl) return;

            let suffix = "";
            if (["fontSize", "lineHeight"].includes(setting)) suffix = "px";
            if (setting === "quickSuggestionsDelay") suffix = "ms";

            if (setting === "lineHeight" && e.target.value === "0") {
              valueEl.textContent = "Auto";
            } else {
              valueEl.textContent = e.target.value + suffix;
            }
          });

          input.addEventListener("change", (e) => {
            this.updateSetting(
              e.target.dataset.setting,
              parseInt(e.target.value, 10),
            );
          });
        });

      this.bindseSelects(container);
    }
  }

  // Od razu udostępniamy manager w scope globalnym
  window.MonacoEditorSettings = new MonacoEditorSettingsManager();
})();
