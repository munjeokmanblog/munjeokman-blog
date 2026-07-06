// 마크다운 원문 -> 안전한 HTML로 변환 (이미지, 볼드/이탤릭, 목록, 링크 등 지원)
function renderMarkdownContent(raw) {
  const rawHtml = marked.parse(raw || '', { breaks: true });
  return DOMPurify.sanitize(rawHtml, { ADD_ATTR: ['target'] });
}

// 렌더링된 요소 안의 $...$ / $$...$$ / \(...\) / \[...\] 를 수식으로 변환
function renderMathIn(el) {
  if (window.renderMathInElement) {
    renderMathInElement(el, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
      ],
      throwOnError: false,
    });
  }
}

// 글 본문 요소에 마크다운+이미지+수식을 한번에 렌더링
function renderPostBody(el, raw) {
  el.innerHTML = renderMarkdownContent(raw);
  renderMathIn(el);
}