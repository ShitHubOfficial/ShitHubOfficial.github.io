// 添加链接解析函数
function parseInlineLinks(text) {
    // 匹配Markdown风格的链接格式: [链接文本](URL)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    // 替换匹配的链接为HTML <a>标签
    return text.replace(linkRegex, function(match, linkText, url) {
        // 基本URL验证 - 只允许http/https协议和相对路径
        const isValidUrl = /^(https?:\/\/|\/|\.\/|\.\.\/)/.test(url);
        if (!isValidUrl) {
            return match; // 如果不是有效URL，返回原始文本
        }

        return `<a href="${url}" class="article-link" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
    });
}

function renderArticle(articleData) {
    const $article = $('.article');

    // 渲染元数据
    const meta = articleData.meta;
    document.title = meta.title;
    const publishedDate = new Date(meta.publishedDate).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const updatedDate = new Date(meta.updatedDate).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    $article.append(`
                    <div class="article-header">
                        <h1 class="article-title">${meta.title}</h1>
                        <div class="article-meta">
                            <div class="authors">作者: ${meta.authors.join(', ')}</div>
                            <div class="dates">发布时间: ${publishedDate} | 最后更新: ${updatedDate}</div>
                        </div>
                        ${meta.summary?'<div class="article-summary">'+meta.summary+'</div>':''}
                    </div>
                `);

    // 渲染内容块
    articleData.content.forEach(block => {
        let blockHtml = '';

        switch (block.type) {
            case 'heading':
                // 修改标题渲染以支持链接
                blockHtml = `<h${block.data.level} class="heading heading-level-${block.data.level}">${parseInlineLinks(block.data.text)}</h${block.data.level}>`;
                break;

            case 'paragraph':
                // 修改段落渲染以支持链接
                blockHtml = `<p class="paragraph content-block">${parseInlineLinks(block.data.text)}</p>`;
                break;
            case 'center':
                // 修改段落渲染以支持链接
                blockHtml = `<p class="center paragraph content-block">${parseInlineLinks(block.data.text)}</p>`;
                break;

            case 'list':
                const listTag = block.data.style === 'ordered' ? 'ol' : 'ul';
                const listClass = block.data.style === 'ordered' ? 'list-ordered' : 'list-unordered';

                let listItems = '';
                // 修改列表项渲染以支持链接
                block.data.items.forEach(item => {
                    listItems += `<li class="list-item">${parseInlineLinks(item)}</li>`;
                });

                blockHtml = `
                                <div class="content-block">
                                    <${listTag} class="list-container ${listClass}">
                                        ${listItems}
                                    </${listTag}>
                                </div>
                            `;
                break;

            case 'image':
                // 添加宽度和高度支持
                const widthStyle = block.data.width ? `width=${block.data.width}` : '';
                const heightStyle = block.data.height ? `height=${block.data.height};` : '';
                const styleAttr = (widthStyle || heightStyle) ? `${widthStyle} ${heightStyle}` : '';

                blockHtml = `
                                <div class="image-container content-block">
                                    <img src="${block.data.url}" alt="${block.data.alt}" class="article-image" ${styleAttr}>
                                    ${block.data.caption ? `<div class="image-caption">${block.data.caption}</div>` : ''}
                                </div>
                            `;
                break;


            case 'code':
                blockHtml = `
                                <div class="code-container content-block">
                                    <div class="code-header">
                                        <span>代码示例</span>
                                        <span class="language">${block.data.language || 'text'}</span>
                                    </div>
                                    <div class="code-content">
                                        <pre><code class="language-${block.data.language || 'text'}">${block.data.code}</code></pre>
                                    </div>
                                </div>
                            `;
                break;

            case 'quote':
                // 修改引用渲染以支持链接
                blockHtml = `
                                <div class="quote-container content-block">
                                    <div class="quote-text">"${parseInlineLinks(block.data.text)}"</div>
                                    ${block.data.author ? `<div class="quote-author">— ${parseInlineLinks(block.data.author)}</div>` : ''}
                                </div>
                            `;
                break;


            case 'divider':
                blockHtml = `<hr class="divider content-block">`;
                break;

            case 'embed':
                blockHtml = `
                                <div class="embed-container content-block">
                                    <div class="embed-placeholder">
                                        ${block.data.url ? `<a href="${block.data.url}" class="article-link" target="_blank">${block.data.title || "空信息"}</a>` : `<a class="article-link" target="_blank">${block.data.title || "空信息"}</a>`}
                                    </div>
                                </div>
                            `;
                break;

            default:
                blockHtml = `<div class="content-block">未知内容类型: ${block.type}</div>`;
        }

        $article.append(blockHtml);
    });

    // 添加页脚
    $article.append(`
                    <div class="footer">
                        <p>© 2025 ShitHub | JuX</p>
                    </div>
                `);

    // 高亮代码块
    hljs.highlightAll();
}

$(document).ready(function() {

});