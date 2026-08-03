/**
 * Monaco Advanced Suggestions (HTML / CSS / JS)
 * Część monaco-kit — nie ładuj osobno, użyj monaco-kit.js
 */

(function () {
  // Zmienna przechowująca aktywne subskrypcje autouzupełniania
  let completionProviders = [];
  let initialized = false;

  function initAdvancedSuggestions() {
    if (!window.monaco || !monaco.languages) return false;

    // Wyczyszczenie poprzednich rejestracji przed ponowną inicjalizacją
    completionProviders.forEach((provider) => provider.dispose());
    completionProviders = [];

    // --- 1. PODPOWIEDZI DLA HTML ---
    completionProviders.push(
      monaco.languages.registerCompletionItemProvider("html", {
        triggerCharacters: ["<", " ", "=", '"', "'"],
        provideCompletionItems: function (model, position) {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          const lineContent = model.getLineContent(position.lineNumber);
          const textBeforeCursor = lineContent.substring(
            0,
            position.column - 1,
          );

          const lastOpening = textBeforeCursor.lastIndexOf("<");
          const lastClosing = textBeforeCursor.lastIndexOf(">");
          const isInsideTag = lastOpening > lastClosing;

          if (isInsideTag) {
            const htmlAttributes = [
              {
                label: "class",
                kind: monaco.languages.CompletionItemKind.Property,
                insertText: 'class="$1"',
                documentation: "CSS class name",
              },
              {
                label: "id",
                kind: monaco.languages.CompletionItemKind.Property,
                insertText: 'id="$1"',
                documentation: "Unique identifier",
              },
              {
                label: "style",
                kind: monaco.languages.CompletionItemKind.Property,
                insertText: 'style="$1"',
                documentation: "Inline CSS styles",
              },
              {
                label: "onclick",
                kind: monaco.languages.CompletionItemKind.Event,
                insertText: 'onclick="$1"',
                documentation: "Click event handler",
              },
              {
                label: "src",
                kind: monaco.languages.CompletionItemKind.Property,
                insertText: 'src="$1"',
                documentation: "Source URL",
              },
              {
                label: "href",
                kind: monaco.languages.CompletionItemKind.Property,
                insertText: 'href="$1"',
                documentation: "Hyperlink reference",
              },
              {
                label: "alt",
                kind: monaco.languages.CompletionItemKind.Property,
                insertText: 'alt="$1"',
                documentation: "Alternative text",
              },
              {
                label: "type",
                kind: monaco.languages.CompletionItemKind.Property,
                insertText: 'type="$1"',
                documentation: "Input type",
              },
              {
                label: "placeholder",
                kind: monaco.languages.CompletionItemKind.Property,
                insertText: 'placeholder="$1"',
                documentation: "Placeholder text",
              },
              {
                label: "value",
                kind: monaco.languages.CompletionItemKind.Property,
                insertText: 'value="$1"',
                documentation: "Element value",
              },
              {
                label: "data-*",
                kind: monaco.languages.CompletionItemKind.Property,
                insertText: 'data-$1="$2"',
                documentation: "Custom data attribute",
              },
            ];

            return {
              suggestions: htmlAttributes.map((attr) => ({
                ...attr,
                range: range,
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              })),
            };
          }

          const htmlTags = [
            {
              label: "div",
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: 'div class="$1">\n\t$0\n</div>',
              documentation: "Block-level container",
            },
            {
              label: "span",
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: "span>$1</span>",
              documentation: "Inline container",
            },
            {
              label: "p",
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: "p>$1</p>",
              documentation: "Paragraph element",
            },
            {
              label: "h1",
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: "h1>$1</h1>",
              documentation: "Heading level 1",
            },
            {
              label: "h2",
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: "h2>$1</h2>",
              documentation: "Heading level 2",
            },
            {
              label: "h3",
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: "h3>$1</h3>",
              documentation: "Heading level 3",
            },
            {
              label: "button",
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'button type="${1:button}">$2</button>',
              documentation: "Clickable button",
            },
            {
              label: "input",
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'input type="${1:text}" name="$2" id="$3">',
              documentation: "Input field",
            },
            {
              label: "form",
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: 'form action="$1" method="${2:post}">\n\t$0\n</form>',
              documentation: "Form container",
            },
            {
              label: "img",
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'img src="$1" alt="$2">',
              documentation: "Image element",
            },
            {
              label: "a",
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'a href="$1">$2</a>',
              documentation: "Anchor/link element",
            },
            {
              label: "ul",
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: "ul>\n\t<li>$1</li>\n</ul>",
              documentation: "Unordered list",
            },
            {
              label: "ol",
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: "ol>\n\t<li>$1</li>\n</ol>",
              documentation: "Ordered list",
            },
            {
              label: "li",
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: "li>$1</li>",
              documentation: "List item",
            },
            {
              label: "section",
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: 'section id="$1">\n\t$0\n</section>',
              documentation: "Section element",
            },
            {
              label: "article",
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: "article>\n\t$0\n</article>",
              documentation: "Article element",
            },
            {
              label: "header",
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: "header>\n\t$0\n</header>",
              documentation: "Header element",
            },
            {
              label: "footer",
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: "footer>\n\t$0\n</footer>",
              documentation: "Footer element",
            },
            {
              label: "nav",
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: "nav>\n\t$0\n</nav>",
              documentation: "Navigation element",
            },
            {
              label: "main",
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: "main>\n\t$0\n</main>",
              documentation: "Main content element",
            },
          ];

          return {
            suggestions: htmlTags.map((tag) => ({
              ...tag,
              range: range,
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            })),
          };
        },
      }),
    );

    // --- 2. PODPOWIEDZI DLA CSS (OBSŁUGA !IMPORTANT) ---
    completionProviders.push(
      monaco.languages.registerCompletionItemProvider("css", {
        // Dodano '!' jako wyzwalacz podpowiedzi
        triggerCharacters: [":", " ", "-", "!"],
        provideCompletionItems: function (model, position) {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          const lineContent = model.getLineContent(position.lineNumber);
          const textBeforeCursor = lineContent.substring(
            0,
            position.column - 1,
          );
          const isValueContext = textBeforeCursor.includes(":");

          // Jeśli piszemy w wartościach (po dwukropku :)
          if (isValueContext) {
            const suggestions = [];

            // Zawsze dodawaj !important gdy wciśnięto ! lub do wartości podpowiedzi
            suggestions.push({
              label: "!important",
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: "!important;",
              documentation: "Wymusza wyższy priorytet reguły CSS",
              sortText: "0000", // Priorytet na samej górze listy
              range: range,
            });

            // Standardowe podpowiedzi wartości
            const cssValues = [
              {
                label: "flex",
                kind: monaco.languages.CompletionItemKind.Value,
                insertText: "flex;",
              },
              {
                label: "grid",
                kind: monaco.languages.CompletionItemKind.Value,
                insertText: "grid;",
              },
              {
                label: "block",
                kind: monaco.languages.CompletionItemKind.Value,
                insertText: "block;",
              },
              {
                label: "inline-block",
                kind: monaco.languages.CompletionItemKind.Value,
                insertText: "inline-block;",
              },
              {
                label: "none",
                kind: monaco.languages.CompletionItemKind.Value,
                insertText: "none;",
              },
              {
                label: "center",
                kind: monaco.languages.CompletionItemKind.Value,
                insertText: "center;",
              },
              {
                label: "pointer",
                kind: monaco.languages.CompletionItemKind.Value,
                insertText: "pointer;",
              },
              {
                label: "relative",
                kind: monaco.languages.CompletionItemKind.Value,
                insertText: "relative;",
              },
              {
                label: "absolute",
                kind: monaco.languages.CompletionItemKind.Value,
                insertText: "absolute;",
              },
              {
                label: "fixed",
                kind: monaco.languages.CompletionItemKind.Value,
                insertText: "fixed;",
              },
              {
                label: "transparent",
                kind: monaco.languages.CompletionItemKind.Value,
                insertText: "transparent;",
              },
              {
                label: "inherit",
                kind: monaco.languages.CompletionItemKind.Value,
                insertText: "inherit;",
              },
            ];

            cssValues.forEach((val) => {
              suggestions.push({ ...val, range: range });
            });

            return { suggestions: suggestions };
          }

          // Standardowe właściwości CSS (poza kontekstem wartości)
          const cssProperties = [
            {
              label: "color",
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: "color: $1;",
              documentation: "Text color",
            },
            {
              label: "background",
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: "background: $1;",
              documentation: "Background shorthand",
            },
            {
              label: "background-color",
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: "background-color: $1;",
              documentation: "Background color",
            },
            {
              label: "font-size",
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: "font-size: $1;",
              documentation: "Font size",
            },
            {
              label: "font-family",
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: "font-family: $1;",
              documentation: "Font family",
            },
            {
              label: "font-weight",
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: "font-weight: $1;",
              documentation: "Font weight",
            },
            {
              label: "margin",
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: "margin: $1;",
              documentation: "Margin",
            },
            {
              label: "padding",
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: "padding: $1;",
              documentation: "Padding",
            },
            {
              label: "display",
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: "display: $1;",
              documentation: "Display layout type",
            },
            {
              label: "flex",
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: "flex: $1;",
              documentation: "Flex property",
            },
            {
              label: "justify-content",
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: "justify-content: $1;",
              documentation: "Flexbox justify content",
            },
            {
              label: "align-items",
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: "align-items: $1;",
              documentation: "Flexbox align items",
            },
            {
              label: "border",
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: "border: $1;",
              documentation: "Border shorthand",
            },
            {
              label: "border-radius",
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: "border-radius: $1;",
              documentation: "Border radius",
            },
            {
              label: "width",
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: "width: $1;",
              documentation: "Width",
            },
            {
              label: "height",
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: "height: $1;",
              documentation: "Height",
            },
            {
              label: "position",
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: "position: $1;",
              documentation: "Positioning method",
            },
            {
              label: "cursor",
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: "cursor: $1;",
              documentation: "Cursor style",
            },
            {
              label: "transition",
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: "transition: $1;",
              documentation: "Transition animation",
            },
            {
              label: "transform",
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: "transform: $1;",
              documentation: "2D/3D Transform",
            },
          ];

          return {
            suggestions: cssProperties.map((prop) => ({
              ...prop,
              range: range,
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            })),
          };
        },
      }),
    );

    // --- 3. PODPOWIEDZI DLA JAVASCRIPT ---
    completionProviders.push(
      monaco.languages.registerCompletionItemProvider("javascript", {
        triggerCharacters: [".", "(", " ", "=", "c", "l", "f"],
        provideCompletionItems: function (model, position) {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          const fullText = model.getValue();
          const localSymbols = [];
          const symbolRegex =
            /(?:const|let|var|function)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
          let match;

          while ((match = symbolRegex.exec(fullText)) !== null) {
            const name = match[1];
            if (name !== word.word) {
              localSymbols.push({
                label: name,
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: name,
                documentation: "Local symbol detected in document",
                range: range,
              });
            }
          }

          const jsFunctions = [
            {
              label: "console.log",
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: "console.log($1);",
              documentation: "Log to console",
            },
            {
              label: "console.error",
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: "console.error($1);",
              documentation: "Log error to console",
            },
            {
              label: "console.warn",
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: "console.warn($1);",
              documentation: "Log warning to console",
            },
            {
              label: "document.getElementById",
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: "document.getElementById('$1')",
              documentation: "Get element by ID",
            },
            {
              label: "document.querySelector",
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: "document.querySelector('$1')",
              documentation: "Query selector",
            },
            {
              label: "document.querySelectorAll",
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: "document.querySelectorAll('$1')",
              documentation: "Query selector all",
            },
            {
              label: "addEventListener",
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: "addEventListener('$1', (e) => {\n\t$2\n});",
              documentation: "Add event listener",
            },
            {
              label: "setTimeout",
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: "setTimeout(() => {\n\t$1\n}, ${2:1000});",
              documentation: "Set timeout delay",
            },
            {
              label: "setInterval",
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: "setInterval(() => {\n\t$1\n}, ${2:1000});",
              documentation: "Set repeating interval",
            },
            {
              label: "fetch",
              kind: monaco.languages.CompletionItemKind.Function,
              insertText:
                "fetch('$1')\n\t.then(res => res.json())\n\t.then(data => {\n\t\t$2\n\t});",
              documentation: "Fetch API request",
            },
            {
              label: "async function",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "async function $1($2) {\n\t$3\n}",
              documentation: "Async function declaration",
            },
            {
              label: "arrow function",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "const $1 = ($2) => {\n\t$3\n};",
              documentation: "Arrow function expression",
            },
          ];

          const jsKeywords = [
            {
              label: "const",
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: "const $1 = $2;",
              documentation: "Constant declaration",
            },
            {
              label: "let",
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: "let $1 = $2;",
              documentation: "Let declaration",
            },
            {
              label: "var",
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: "var $1 = $2;",
              documentation: "Var declaration",
            },
            {
              label: "if",
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: "if ($1) {\n\t$2\n}",
              documentation: "If statement",
            },
            {
              label: "for",
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: "for (let i = 0; i < $1; i++) {\n\t$2\n}",
              documentation: "For loop",
            },
            {
              label: "forEach",
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: "forEach(($1) => {\n\t$2\n});",
              documentation: "Array forEach",
            },
            {
              label: "map",
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: "map(($1) => {\n\treturn $2;\n});",
              documentation: "Array map",
            },
            {
              label: "filter",
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: "filter(($1) => {\n\treturn $2;\n});",
              documentation: "Array filter",
            },
          ];

          const defaultItems = [...jsFunctions, ...jsKeywords].map((item) => ({
            ...item,
            range: range,
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          }));

          return {
            suggestions: [...defaultItems, ...localSymbols],
          };
        },
      }),
    );

    initialized = true;
    return true;
  }

  function waitForMonaco(callback, timeoutMs) {
    const deadline = Date.now() + (timeoutMs || 30000);

    function tick() {
      if (window.monaco && monaco.languages) {
        callback();
        return;
      }
      if (Date.now() >= deadline) return;
      setTimeout(tick, 50);
    }

    tick();
  }

  function boot() {
    waitForMonaco(() => {
      if (!initialized) initAdvancedSuggestions();
    });
  }

  if (typeof window !== "undefined") {
    window.initAdvancedSuggestions = initAdvancedSuggestions;

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})();
