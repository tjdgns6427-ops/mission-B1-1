'use strict';

// 상태는 현재 값을 기억하고, render 함수는 그 값을 화면에 반영합니다.
const state = {
  theme: 'light', menuOpen: false,
  projects: { status: 'idle', items: [], error: '' },
  form: { errors: {}, submitted: false },
};
const themeButton = document.querySelector('#theme-toggle');
const menuButton = document.querySelector('#menu-toggle');
const navLinks = document.querySelector('#nav-links');
const projectList = document.querySelector('#project-list');
const projectStatus = document.querySelector('#project-status');
const retryButton = document.querySelector('#retry-button');
const contactForm = document.querySelector('#contact-form');
const formFields = [...contactForm.querySelectorAll('input, textarea')];
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

const renderTheme = () => {
  document.documentElement.dataset.theme = state.theme;
  const isDark = state.theme === 'dark';
  themeButton.textContent = isDark ? '라이트 모드' : '다크 모드';
  themeButton.setAttribute('aria-pressed', String(isDark));
  themeButton.setAttribute('aria-label', isDark ? '라이트 모드로 전환' : '다크 모드로 전환');
};
try {
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') state.theme = savedTheme;
} catch { /* 저장소가 차단되어도 나머지 기능은 계속 동작합니다. */ }
renderTheme();
themeButton.addEventListener('click', () => {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  renderTheme();
  try { localStorage.setItem('portfolio-theme', state.theme); } catch { /* 현재 화면에는 적용됨 */ }
});

const renderMenu = () => {
  navLinks.classList.toggle('active', state.menuOpen);
  menuButton.setAttribute('aria-expanded', String(state.menuOpen));
  menuButton.setAttribute('aria-label', state.menuOpen ? '메뉴 닫기' : '메뉴 열기');
  menuButton.textContent = state.menuOpen ? '×' : '☰';
};
menuButton.addEventListener('click', () => { state.menuOpen = !state.menuOpen; renderMenu(); });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && state.menuOpen) {
    state.menuOpen = false; renderMenu(); menuButton.focus();
  }
});
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => { state.menuOpen = false; renderMenu(); });
});
window.matchMedia('(min-width: 768px)').addEventListener('change', (event) => {
  if (event.matches) { state.menuOpen = false; renderMenu(); }
});

const scrollTopButton = document.querySelector('#scroll-top');
const header = document.querySelector('#header');
const renderScroll = () => {
  scrollTopButton.hidden = window.scrollY < 300;
  header.classList.toggle('scrolled', window.scrollY >= 60);
};
window.addEventListener('scroll', renderScroll, { passive: true });
renderScroll();
scrollTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: motionPreference.matches ? 'instant' : 'smooth' });
  document.querySelector('.logo').focus({ preventScroll: true });
});

if ('IntersectionObserver' in window && !motionPreference.matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('pending');
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.reveal').forEach((element) => {
    element.classList.add('pending'); observer.observe(element);
  });
}

// 외부 문자열은 HTML로 삽입하기 전에 반드시 이스케이프합니다.
const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));
const renderProjects = () => {
  const { status, items, error } = state.projects;
  projectList.setAttribute('aria-busy', String(status === 'loading'));
  projectStatus.classList.toggle('error', status === 'error');
  retryButton.hidden = status !== 'error';
  projectList.innerHTML = '';
  if (status === 'loading') { projectStatus.textContent = '프로젝트를 불러오는 중…'; return; }
  if (status === 'error') { projectStatus.textContent = `프로젝트를 불러올 수 없습니다. ${error}`; return; }
  if (!items.length) { projectStatus.textContent = '표시할 프로젝트가 없습니다.'; return; }
  projectStatus.textContent = `공개 저장소 ${items.length}개`;
  projectList.innerHTML = items.map(({ name, description, language, stargazers_count, html_url }) => {
    // 링크 역시 GitHub의 HTTPS 주소만 허용합니다.
    const url = new URL(html_url);
    const safeURL = url.protocol === 'https:' && url.hostname === 'github.com' ? url.href : 'https://github.com/';
    return `<article class="project-card"><span class="tag">GITHUB REPOSITORY</span>
      <h3><a href="${escapeHTML(safeURL)}" target="_blank" rel="noopener noreferrer">${escapeHTML(name)} ↗</a></h3>
      <p>${escapeHTML(description || '아직 저장소 설명이 없습니다.')}</p>
      <div class="project-meta"><span>${escapeHTML(language || '언어 미지정')}</span><span>★ ${Number(stargazers_count) || 0}</span></div></article>`;
  }).join('');
};

const loadProjects = async () => {
  if (state.projects.status === 'loading') return;
  state.projects = { status: 'loading', items: [], error: '' };
  renderProjects();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    if (!PROFILE.githubUsername) throw new Error('GitHub 아이디를 설정해주세요.');
    const items = [];
    // GitHub는 한 페이지에 최대 100개를 반환하므로 다음 페이지도 확인합니다.
    let page = 1;
    let hasNext = true;
    while (hasNext) {
      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(PROFILE.githubUsername)}/repos?sort=updated&per_page=100&page=${page}`, { signal: controller.signal });
      if (!response.ok) {
        if (response.status === 403 || response.status === 429) throw new Error('요청이 제한되었습니다. 잠시 후 다시 시도해주세요.');
        if (response.status === 404) throw new Error('GitHub 계정을 찾을 수 없습니다.');
        throw new Error(`서버 응답 오류 (${response.status})`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('올바르지 않은 응답입니다.');
      items.push(...data);
      hasNext = (response.headers.get('link') || '').includes('rel="next"');
      page += 1;
    }
    state.projects = { status: 'success', items, error: '' };
    renderProjects();
  } catch (error) {
    state.projects = { status: 'error', items: [], error: error.name === 'AbortError' ? '응답 시간이 초과되었습니다.' : error instanceof TypeError ? '인터넷 연결을 확인해주세요.' : error.message };
    renderProjects();
  } finally { clearTimeout(timeout); }
};
retryButton.addEventListener('click', loadProjects);

const validateField = (field) => {
  if (!field.value.trim()) return `${field.id === 'name' ? '이름을' : field.id === 'email' ? '이메일을' : '메시지를'} 입력해주세요.`;
  if (field.id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) return '올바른 이메일 형식을 입력해주세요. (예: name@example.com)';
  return '';
};
const renderForm = () => {
  formFields.forEach((field) => {
    const error = state.form.errors[field.id] || '';
    document.querySelector(`#${field.id}-error`).textContent = error;
    field.setAttribute('aria-invalid', String(Boolean(error)));
  });
  document.querySelector('#form-status').textContent = state.form.submitted ? '입력 검증에 성공했습니다. 학습용 폼으로 실제 메일은 발송되지 않았습니다.' : '';
};
formFields.forEach((field) => field.addEventListener('input', () => {
  state.form.errors[field.id] = validateField(field);
  state.form.submitted = false;
  renderForm();
}));
contactForm.addEventListener('submit', (event) => {
  event.preventDefault();
  formFields.forEach((field) => { state.form.errors[field.id] = validateField(field); });
  const invalidFields = formFields.filter((field) => state.form.errors[field.id]);
  state.form.submitted = invalidFields.length === 0;
  renderForm();
  if (invalidFields.length) invalidFields[0].focus();
});

document.querySelectorAll('[data-profile-name]').forEach((element) => { element.textContent = PROFILE.name; });
document.title = `${PROFILE.name} | 첫 번째 포트폴리오`;
document.querySelector('#year').textContent = new Date().getFullYear();
if (PROFILE.githubUsername) {
  const githubLink = document.querySelector('#github-link');
  githubLink.href = `https://github.com/${encodeURIComponent(PROFILE.githubUsername)}`;
  githubLink.hidden = false;
}
loadProjects();
