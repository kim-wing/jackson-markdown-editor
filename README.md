# Jackson Markdown Editor

A clean, minimal Markdown editor built for writing, previewing, and publishing in one place.

It includes:

- Live Markdown editing with a polished reading preview
- Desktop, Mobile, and WeChat rendering modes
- An interaction-first paste → review → publish workflow
- A single primary action for copying WeChat-ready rich text
- Markdown file import
- Local image insertion at the cursor
- Copy as Markdown or WeChat-friendly rich text
- PNG long-image export for the currently selected preview mode
- HTML export for sharing or archiving
- Mobile edit/preview switching, keyboard copy, and undo after clearing
- A focused writing workspace with independent editor and preview scrolling
- Optional synchronized scrolling and a clickable article outline
- Formatting tools and keyboard shortcuts that preserve the selected text
- Automatic local draft recovery, including the document title and preview mode
- Markdown, TXT and image drag-and-drop, and pasted image insertion
- A consolidated export menu for PNG, HTML and Markdown

The personal Logo and original article typography are retained. Article CSS is isolated from the workspace theme, and regression tests protect the Markdown output, WeChat styles and HTML export styles.

Live demo: [jackson-markdown-editor.542186947.workers.dev](https://jackson-markdown-editor.542186947.workers.dev/)

## Why it exists

This project is designed for people who want their Markdown to look good before it gets published.
The layout focuses on calm typography, soft contrast, and a lightweight workflow that feels good to use.

## Files

- `index.html` - the editor markup and application logic
- `article.css` - original article styles, isolated from the workspace theme
- `workspace.css` - responsive editor interface styles
- `avatar.jpg` - the avatar used in the top bar
- `tests/editor.test.mjs` - article rendering and style regression tests

## Live workflow

1. Paste or import Markdown.
2. Check the Web, Mobile, or WeChat preview.
3. Insert images where needed.
4. Copy the finished WeChat layout, or export the current preview as a PNG long image.

Drafts stay in the current browser; there is no server-side document storage. Browser cleanup, private browsing or storage limits can prevent recovery, so download a Markdown copy for important work. The interface reports when local saving fails. Clear and replace operations provide a ten-second undo action.

## Run locally and verify

No build or third-party runtime dependencies are required.

```sh
python3 -m http.server 4173 --bind 127.0.0.1
node --test tests/editor.test.mjs
```

Open [localhost:4173](http://127.0.0.1:4173/). Shortcuts: Ctrl/⌘ B for bold, Ctrl/⌘ I for italic, Ctrl/⌘ K for links, Ctrl/⌘ Enter to copy WeChat formatting, and Ctrl/⌘ S to download the Markdown source.

## Repository

Project homepage: [github.com/kim-wing/jackson-markdown-editor](https://github.com/kim-wing/jackson-markdown-editor)
