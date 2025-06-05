import LoginModel from '../../data/login-model';
import LoginPresenter from '../../presenter/login-presenter';
import AuthModel from '../../data/auth-model';

class LoginPage {
  constructor() {
    this._model = new LoginModel();
    this._authModel = new AuthModel();
    this._presenter = new LoginPresenter({
      view: this,
      model: this._model,
      authModel: this._authModel,
    });

    this._initialUI();
  }

  _initialUI() {
    this.loginContainer = document.createElement('div');
    this.loginContainer.classList.add('login-container');
    this.loginContainer.innerHTML = `
      <div class="login-card">
        <div class="login-header">
          <h2>Masuk ke Dicoding Story</h2>
          <p>Bagikan cerita menarikmu bersama komunitas Dicoding</p>
        </div>
        <form id="loginForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" placeholder="Masukkan email Anda" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Masukkan password Anda" required>
            <div class="password-toggle">
              <input type="checkbox" id="showPassword">
              <label for="showPassword">Tampilkan password</label>
            </div>
          </div>
          <div class="form-group">
            <button type="submit" class="btn-login">Masuk</button>
          </div>
          <div class="form-footer">
            <p>Belum punya akun? <a href="#/register">Daftar sekarang</a></p>
          </div>
        </form>
        <div id="loginMessage" class="message-container"></div>
      </div>
    `;

    this._initializeEventListeners();
  }

  _initializeEventListeners() {
    const loginForm = this.loginContainer.querySelector('#loginForm');
    const showPasswordCheckbox = this.loginContainer.querySelector('#showPassword');
    const passwordInput = this.loginContainer.querySelector('#password');

    showPasswordCheckbox.addEventListener('change', () => {
      passwordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
    });

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = loginForm.email.value;
      const password = loginForm.password.value;

      await this._presenter.login({ email, password });
    });
  }

  showLoading() {
    const messageContainer = this.loginContainer.querySelector('#loginMessage');
    messageContainer.innerHTML = 'Sedang memproses...';
    messageContainer.className = 'message-container';
  }

  showError(message) {
    const messageContainer = this.loginContainer.querySelector('#loginMessage');
    messageContainer.innerHTML = message;
    messageContainer.className = 'message-container error-message';
  }

  showSuccess(message) {
    const messageContainer = this.loginContainer.querySelector('#loginMessage');
    messageContainer.innerHTML = message;
    messageContainer.className = 'message-container success-message';
  }

  render() {
    return this.loginContainer;
  }

  navigateTo(path) {
    window.location.hash = `#${path}`;
  }

  async afterRender() {}
}

export default LoginPage;
