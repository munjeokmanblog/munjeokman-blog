function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const loginView = document.getElementById('login-view');
const adminView = document.getElementById('admin-view');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const editorForm = document.getElementById('editor-form');
const editorCancel = document.getElementById('editor-cancel');
const postListEl = document.getElementById('post-list');

function showAdmin() {
  loginView.style.display = 'none';
  adminView.style.display = 'block';
  loadPostList();
}

function showLogin() {
  loginView.style.display = 'block';
  adminView.style.display = 'none';
}

// 로그인
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  const password = loginForm.password.value;
  const { error } = await supabaseClient.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password,
  });
  if (error) {
    loginError.textContent = '비밀번호가 올바르지 않습니다.';
    return;
  }
  loginForm.reset();
  showAdmin();
});

// 로그아웃
document.getElementById('logout-btn').addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  showLogin();
});

// 새 글 작성으로 리셋
editorCancel.addEventListener('click', () => resetEditor());

function resetEditor() {
  editorForm.reset();
  editorForm.id.value = '';
  editorForm.published.checked = true;
  document.getElementById('editor-submit').textContent = '글 저장';
  editorCancel.style.display = 'none';
}

// 글 저장 (신규/수정)
editorForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = editorForm.id.value;
  const title = editorForm.title.value.trim();
  const content = editorForm.content.value.trim();
  const published = editorForm.published.checked;
  if (!title || !content) return;

  const btn = document.getElementById('editor-submit');
  btn.disabled = true;

  let error;
  if (id) {
    ({ error } = await supabaseClient
      .from('posts')
      .update({ title, content, published, updated_at: new Date().toISOString() })
      .eq('id', id));
  } else {
    ({ error } = await supabaseClient
      .from('posts')
      .insert({ title, content, published }));
  }

  btn.disabled = false;

  if (error) {
    alert('저장 실패: ' + error.message);
    return;
  }
  resetEditor();
  loadPostList();
});

function editPost(post) {
  editorForm.id.value = post.id;
  editorForm.title.value = post.title;
  editorForm.content.value = post.content;
  editorForm.published.checked = post.published;
  document.getElementById('editor-submit').textContent = '수정 저장';
  editorCancel.style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deletePost(id) {
  if (!confirm('이 글을 삭제할까요? 되돌릴 수 없습니다.')) return;
  const { error } = await supabaseClient.from('posts').delete().eq('id', id);
  if (error) {
    alert('삭제 실패: ' + error.message);
    return;
  }
  loadPostList();
}

async function loadPostList() {
  const { data, error } = await supabaseClient
    .from('posts')
    .select('id, title, published, view_count, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    postListEl.innerHTML = `<div class="empty">목록을 불러오지 못했습니다.</div>`;
    return;
  }
  if (!data || data.length === 0) {
    postListEl.innerHTML = `<div class="empty">작성된 글이 없습니다.</div>`;
    return;
  }

  postListEl.innerHTML = data.map(p => `
    <div class="admin-list-item">
      <div>
        <strong>${escapeHtml(p.title)}</strong>
        ${!p.published ? '<span class="draft-tag">비공개</span>' : ''}
        <div class="meta">${formatDate(p.created_at)} · 조회 ${p.view_count ?? 0}</div>
      </div>
      <div class="actions">
        <button class="ghost" data-edit="${p.id}">수정</button>
        <button class="danger" data-delete="${p.id}">삭제</button>
      </div>
    </div>
  `).join('');

  postListEl.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-edit');
      const { data: post } = await supabaseClient.from('posts').select('*').eq('id', id).single();
      if (post) editPost(post);
    });
  });
  postListEl.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => deletePost(btn.getAttribute('data-delete')));
  });
}

// 세션 확인 후 초기 화면 결정
(async function init() {
  const { data } = await supabaseClient.auth.getSession();
  if (data.session) {
    showAdmin();
  } else {
    showLogin();
  }
})();
