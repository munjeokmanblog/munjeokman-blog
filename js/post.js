function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const postId = new URLSearchParams(location.search).get('id');
const postEl = document.getElementById('post');

async function increaseViewOnce(id) {
  const key = `viewed:${id}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');
  await supabaseClient.rpc('increment_view_count', { post_id_input: id });
}

async function loadComments(id) {
  const { data, error } = await supabaseClient
    .from('comments')
    .select('id, author, content, created_at')
    .eq('post_id', id)
    .order('created_at', { ascending: true });
  if (error) return `<div class="empty">댓글을 불러오지 못했습니다.</div>`;
  if (!data || data.length === 0) return `<div class="empty">아직 댓글이 없습니다. 첫 댓글을 남겨보세요.</div>`;
  return data.map(c => `
    <div class="comment">
      <div class="comment-head">
        <span class="comment-author">${escapeHtml(c.author)}</span>
        <span class="comment-date">${formatDate(c.created_at)}</span>
      </div>
      <div class="comment-body">${escapeHtml(c.content)}</div>
    </div>
  `).join('');
}

async function submitComment(e) {
  e.preventDefault();
  const form = e.target;
  const author = form.author.value.trim();
  const content = form.content.value.trim();
  if (!author || !content) return;

  const btn = form.querySelector('button');
  btn.disabled = true;
  const { error } = await supabaseClient.from('comments').insert({ post_id: postId, author, content });
  btn.disabled = false;

  if (error) {
    alert('댓글 등록에 실패했습니다: ' + error.message);
    return;
  }
  form.reset();
  document.getElementById('comments-list').innerHTML = await loadComments(postId);
}

async function init() {
  if (!postId) {
    postEl.innerHTML = `<div class="empty">잘못된 접근입니다. <a href="index.html">목록으로</a></div>`;
    return;
  }

  const { data: post, error } = await supabaseClient
    .from('posts')
    .select('id, title, content, created_at, view_count')
    .eq('id', postId)
    .eq('published', true)
    .single();

  if (error || !post) {
    postEl.innerHTML = `<div class="empty">글을 찾을 수 없습니다. <a href="index.html">목록으로</a></div>`;
    return;
  }

  await increaseViewOnce(postId);

  const commentsHtml = await loadComments(postId);

  postEl.innerHTML = `
    <a class="back-link" href="index.html">← 목록으로</a>
    <h1 class="post-title" style="margin-top:16px">${escapeHtml(post.title)}</h1>
    <div class="post-meta">
      <span>${formatDate(post.created_at)}</span>
      <span>조회 ${post.view_count ?? 0}</span>
    </div>
    <div class="post-body">${escapeHtml(post.content)}</div>

    <section class="comments">
      <h2>댓글</h2>
      <div id="comments-list">${commentsHtml}</div>
      <form class="comment-form" id="comment-form">
        <div class="row">
          <input type="text" name="author" placeholder="이름" maxlength="30" required />
          <input type="text" name="content" placeholder="댓글을 남겨보세요" maxlength="500" required />
        </div>
        <button type="submit">댓글 등록</button>
      </form>
    </section>
  `;

  document.getElementById('comment-form').addEventListener('submit', submitComment);
}

init();
