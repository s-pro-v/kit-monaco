# Monaco Kit

W HTML wystarczy:

```html
<script src="monaco-kit/monaco-kit.js"></script>
```

Opcjonalnie przycisk ustawień:

```html
<button onclick="MonacoEditorSettings.showSettings()">⚙️</button>
```

Ładuje automatycznie: motywy, panel ustawień (+ `root-monaco.css`), podpowiedzi HTML/CSS/JS.
Każdy `monaco.editor.create(...)` dostaje opcje z panelu bez ręcznego `init`.
