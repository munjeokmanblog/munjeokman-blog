// ?key=admin 으로 들어오면 관리자 페이지로 이동
(function checkAdminEntry() {
  const params = new URLSearchParams(location.search);
  if (params.get('key') === 'admin') {
    location.replace('admin.html');
  }
})();

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function stripMarkdown(text) {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')   // 이미지
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 링크는 텍스트만 남김
    .replace(/\$\$[\s\S]*?\$\$/g, '')        // 블록 수식
    .replace(/\$[^$\n]*\$/g, '')             // 인라인 수식
    .replace(/[#*_`>~-]/g, '');              // 마크다운 기호
}

function excerpt(text, len = 90) {
  const clean = stripMarkdown(text).replace(/\s+/g, ' ').trim();
  return clean.length > len ? clean.slice(0, len) + '…' : clean;
}

async function loadPosts() {
  const listEl = document.getElementById('list');
  const { data, error } = await supabaseClient
    .from('posts')
    .select('id, title, content, created_at, view_count')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    listEl.innerHTML = `<div class="empty">글을 불러오지 못했습니다. (${escapeHtml(error.message)})</div>`;
    return;
  }

  if (!data || data.length === 0) {
    listEl.innerHTML = `<div class="empty">아직 작성된 글이 없습니다.</div>`;
    return;
  }

  listEl.innerHTML = data.map(post => `
    <article class="entry">
      <div>
        <h2 class="entry-title"><a href="post.html?id=${post.id}">${escapeHtml(post.title)}</a></h2>
        <p class="entry-excerpt">${escapeHtml(excerpt(post.content))}</p>
        <div class="entry-date">${formatDate(post.created_at)}</div>
      </div>
      <div class="stamp">
        <div class="n">${post.view_count ?? 0}</div>
        <div class="l">VIEWS</div>
      </div>
    </article>
  `).join('');
}

loadPosts();