import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const article = readFileSync(new URL('../article.css', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('../workspace.css', import.meta.url), 'utf8');
const between = (text, start, end) => text.slice(text.indexOf(start), text.indexOf(end));
const hash = text => createHash('sha256').update(text.replace(/\s+/g, '')).digest('hex');
const parser = runInNewContext(
  between(html, 'const escapeHtml', 'function showToast') +
  between(html, 'function renderInline', 'function setPreviewMode') +
  between(html, 'function renderMarkdown', 'function updatePreview') +
  '\n renderMarkdown'
);
const fixtures = [
  {
    "source": "# 原有文章样式\n\n## 二级标题\n\n正文有 **重点**、*强调*、`内联代码` 和 [链接](https://kimwing.cn)。\n\n> 引用第一行\n> 第二行\n\n- 甲\n- 乙\n\n1. 第一\n2. 第二\n\n---",
    "expected": {
      "html": "<h1 id=\"\">原有文章样式</h1><h2 id=\"\">二级标题</h2><p>正文有 <strong>重点</strong>、<em>强调</em>、<code>内联代码</code> 和 <a href=\"https://kimwing.cn\" target=\"_blank\" rel=\"noreferrer noopener\">链接</a>。</p><blockquote>引用第一行<br>第二行</blockquote><ul><li>甲</li><li>乙</li></ul><ol><li>第一</li><li>第二</li></ol><hr />",
      "stats": {
        "headings": 2,
        "paragraphs": 1,
        "codes": 0
      }
    }
  },
  {
    "source": "```js\nconst value = '<script>'; \nconsole.log(value);\n```\n\n段落一\n段落二",
    "expected": {
      "html": "<pre><code class=\"language-js\">const value = &#39;&lt;script&gt;&#39;; \nconsole.log(value);</code></pre><p>段落一 段落二</p>",
      "stats": {
        "headings": 0,
        "paragraphs": 1,
        "codes": 1
      }
    }
  },
  {
    "source": "| 功能 | 说明 |\n| --- | --- |\n| 标题 | **重点** |\n| 引用 | `注释` |",
    "expected": {
      "html": "<table><thead><tr><th style=\"text-align:left\">功能</th><th style=\"text-align:left\">说明</th></tr></thead><tbody><tr><td style=\"text-align:left\">标题</td><td style=\"text-align:left\"><strong>重点</strong></td></tr><tr><td style=\"text-align:left\">引用</td><td style=\"text-align:left\"><code>注释</code></td></tr></tbody></table>",
      "stats": {
        "headings": 0,
        "paragraphs": 0,
        "codes": 0
      }
    }
  },
  {
    "source": "![本地图片](data:image/png;base64,abc)\n\n![网络图片](https://example.com/image.png)",
    "expected": {
      "html": "<p class=\"lead\"><img alt=\"本地图片\" src=\"data:image/png;base64,abc\" /></p><p><img alt=\"网络图片\" src=\"https://example.com/image.png\" /></p>",
      "stats": {
        "headings": 0,
        "paragraphs": 2,
        "codes": 0
      }
    }
  },
  {
    "source": "<script>alert('x')</script>\n\nA & B > C\n\n# 重复标题\n\n# 重复标题",
    "expected": {
      "html": "<p class=\"lead\">&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;</p><p>A &amp; B &gt; C</p><h1 id=\"\">重复标题</h1><h1 id=\"\">重复标题</h1>",
      "stats": {
        "headings": 2,
        "paragraphs": 2,
        "codes": 0
      }
    }
  },
  {
    "source": "# 简单标题\r\n\r\n中文和 English。\r\n",
    "expected": {
      "html": "<h1 id=\"\">简单标题</h1><p>中文和 English。</p>",
      "stats": {
        "headings": 1,
        "paragraphs": 1,
        "codes": 0
      }
    }
  },
  {
    "source": "#### 小标题\n\n##### 第五级\n\n###### 第六级",
    "expected": {
      "html": "<h4 id=\"\">小标题</h4><h5 id=\"\">第五级</h5><h6 id=\"\">第六级</h6>",
      "stats": {
        "headings": 3,
        "paragraphs": 0,
        "codes": 0
      }
    }
  },
  {
    "source": "只有一个段落，没有特殊格式。",
    "expected": {
      "html": "<p class=\"lead\">只有一个段落，没有特殊格式。</p>",
      "stats": {
        "headings": 0,
        "paragraphs": 1,
        "codes": 0
      }
    }
  }
];

fixtures.forEach(({source, expected}, index) => {
  test('existing article rendering remains unchanged: fixture ' + (index + 1), () => {
    assert.deepEqual(JSON.parse(JSON.stringify(parser(source))), expected);
  });
});

test('original article rules, WeChat styles and HTML export styles are preserved', () => {
  const baseRules = article.split('/* Keep the existing article card')[0]
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/--[\w-]+\s*:[^;]+;/g, '');
  assert.equal(hash(baseRules), '032e6e5e6ed0eb917a353c6f6e43cc2269a3757a1f191356f54410058a0c588d');
  assert.equal(hash(between(html, 'function applyWeChatStyles', 'function renderMarkdown')), '5298de449c35f8411e17c8b462c9e3e720c167ba34bf2141af9b0c1f6701509b');
  assert.equal(hash(between(html, 'function buildExportStyles', 'function buildExportDocument')), 'ab19c6b8b04408f32b9c615e3d8be256bd8ea5cef58f48a8560bebd8ed452bbb');
  assert.match(article, /--preview-serif: "SF Pro Text", "SF Pro Display", "Inter"/);
  assert.match(article, /padding: 44px 52px 58px/);
  assert.match(article, /padding: 36px 36px 46px/);
  assert.match(article, /padding: 28px 22px 38px/);
  assert.doesNotMatch(workspace, /\.paper\s*\{/);
});

test('personal logo and profile link remain intact', () => {
  assert.match(html, /<img src="avatar.jpg" alt="Jackson 的个人 Logo"/);
  assert.match(html, /href="https:\/\/kimwing.cn"[^>]*>@Jackson<\/a>/);
});

test('all referenced element IDs exist and IDs are unique', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]).filter(id => !id.includes('${'));
  assert.equal(new Set(ids).size, ids.length);
  for (const [,id] of html.matchAll(/getElementById\('([^']+)'\)/g)) assert.ok(ids.includes(id), id);
  new Function(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
});

test('sample is read from template content, and IME composition is handled', () => {
  assert.match(html, /getElementById\('tplSample'\)\.content\.textContent/);
  assert.match(html, /addEventListener\('compositionstart'/);
  assert.match(html, /addEventListener\('compositionend'/);
});

