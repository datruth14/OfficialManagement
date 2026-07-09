function renderLoginPage() {
  const app = document.getElementById('app');
  app.classList.add('login-mode');

  if (!document.getElementById('page-content')) {
    app.innerHTML = `
      <aside class="sidebar" id="sidebar"></aside>
      <main class="main-content login-mode" id="mainContent">
        <div id="page-content"></div>
      </main>
    `;
  } else {
    const mc = document.getElementById('mainContent');
    if (mc) mc.classList.add('login-mode');
  }

  const sb = document.getElementById('sidebar');
  if (sb) {
    sb.innerHTML = '';
    sb.style.display = 'none';
  }

  const remembered = localStorage.getItem('remembered_username') || '';

  document.getElementById('page-content').innerHTML = `
    <div class="login-page">
      <div class="login-bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
      <div class="login-card">
        <div class="login-logo">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <rect width="52" height="52" rx="14" fill="#f59e0b"/>
            <path d="M26 15c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm-10.5 21c0-3.5 7-5.25 10.5-5.25s10.5 1.75 10.5 5.25v1.75H15.5V36z" fill="#0f172a"/>
          </svg>
        </div>
        <h1>Welcome Back</h1>
        <p class="subtitle">Sign in to your account to continue</p>
        <form id="loginForm" autocomplete="off">
          <div class="form-group">
            <div class="input-icon-wrapper">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input type="text" class="form-control" id="loginUsername" placeholder="Username" required autocomplete="username" value="${remembered}">
            </div>
          </div>
          <div class="form-group">
            <div class="input-icon-wrapper">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input type="password" class="form-control" id="loginPassword" placeholder="Password" required autocomplete="current-password">
              <button type="button" class="password-toggle" id="passwordToggle" tabindex="-1" aria-label="Toggle password visibility">
                <svg class="eye-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg class="eye-off-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="form-row-extra">
            <label class="checkbox-label">
              <input type="checkbox" id="rememberMe" ${remembered ? 'checked' : ''}>
              <span class="checkmark"></span>
              Remember me
            </label>
          </div>
          <div id="loginError" class="alert alert-error" style="display:none"></div>
          <button type="submit" class="btn btn-primary btn-login" id="loginBtn">
            <span class="btn-text">Sign In</span>
            <div class="btn-spinner" style="display:none">
              <div class="spinner-sm"></div>
            </div>
          </button>
        </form>
        <p class="login-footer-text">Officials Management System v2.0</p>
      </div>
    </div>
  `;

  const form = document.getElementById('loginForm');
  const usernameInput = document.getElementById('loginUsername');
  const passwordInput = document.getElementById('loginPassword');
  const errorDiv = document.getElementById('loginError');
  const loginBtn = document.getElementById('loginBtn');
  const btnText = loginBtn.querySelector('.btn-text');
  const btnSpinner = loginBtn.querySelector('.btn-spinner');
  const passwordToggle = document.getElementById('passwordToggle');

  passwordToggle.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    passwordToggle.querySelector('.eye-icon').style.display = isPassword ? 'none' : '';
    passwordToggle.querySelector('.eye-off-icon').style.display = isPassword ? '' : 'none';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const remember = document.getElementById('rememberMe').checked;

    errorDiv.style.display = 'none';
    errorDiv.classList.remove('shake');
    loginBtn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = '';

    if (remember) {
      localStorage.setItem('remembered_username', username);
    } else {
      localStorage.removeItem('remembered_username');
    }

    try {
      await Auth.login(username, password);
      document.getElementById('app').classList.remove('login-mode');
      const mc2 = document.getElementById('mainContent');
      if (mc2) mc2.classList.remove('login-mode');
      renderSidebar();
      const role = Auth.getRole();
      Router.navigate(role === 'super_admin' || role === 'super_user' ? '/super-admin/dashboard' : '/admin/dashboard');
    } catch (err) {
      errorDiv.textContent = err.message;
      errorDiv.style.display = 'block';
      errorDiv.classList.add('shake');
      loginBtn.disabled = false;
      btnText.style.display = '';
      btnSpinner.style.display = 'none';
      passwordInput.value = '';
      passwordInput.focus();
    }
  });
}
