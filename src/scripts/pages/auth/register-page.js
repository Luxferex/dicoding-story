import RegisterModel from '../../data/register-model';
import RegisterPresenter from '../../presenter/register-presenter';

class RegisterPage {
  constructor() {
    this._model = new RegisterModel();
    this._presenter = new RegisterPresenter({
      view: this,
      model: this._model,
    });
    
    this._initialUI();
  }

  _initialUI() {
    this.registerContainer = document.createElement('div');
    this.registerContainer.classList.add('register-container');
    this.registerContainer.innerHTML = `
      <div class="register-card">
        <div class="register-header">
          <h2>Daftar Akun Baru</h2>
          <p>Bergabunglah dengan komunitas Dicoding Story</p>
        </div>
        <form id="registerForm">
          <div class="form-group">
            <label for="name">Nama Lengkap</label>
            <input type="text" id="name" name="name" placeholder="Masukkan nama lengkap Anda" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" placeholder="Masukkan email Anda" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Minimal 8 karakter" required minlength="8">
            <div class="password-toggle">
              <input type="checkbox" id="showPassword">
              <label for="showPassword">Tampilkan password</label>
            </div>
          </div>
          <div class="form-group">
            <label for="confirmPassword">Konfirmasi Password</label>
            <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Masukkan password yang sama" required>
          </div>
          <div class="form-group">
            <button type="submit" class="btn-register">Daftar Sekarang</button>
          </div>
          <div class="form-footer">
            <p>Sudah punya akun? <a href="#/login">Masuk di sini</a></p>
          </div>
        </form>
        <div id="registerMessage" class="message-container"></div>
      </div>
    `;

    this._initializeEventListeners();
  }

  _initializeEventListeners() {
    const registerForm = this.registerContainer.querySelector('#registerForm');
    const showPasswordCheckbox = this.registerContainer.querySelector('#showPassword');
    const passwordInput = this.registerContainer.querySelector('#password');
    const confirmPasswordInput = this.registerContainer.querySelector('#confirmPassword');

    showPasswordCheckbox.addEventListener('change', () => {
      passwordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
      confirmPasswordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
    });

    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = registerForm.name.value;
      const email = registerForm.email.value;
      const password = registerForm.password.value;
      const confirmPassword = registerForm.confirmPassword.value;

      if (password !== confirmPassword) {
        this.showError('Password dan konfirmasi password tidak cocok');
        return;
      }

      if (password.length < 8) {
        this.showError('Password harus minimal 8 karakter');
        return;
      }

      await this._presenter.register({ name, email, password });
    });
  }

  showLoading() {
    const messageContainer = this.registerContainer.querySelector('#registerMessage');
    messageContainer.innerHTML = 'Sedang memproses...';
    messageContainer.className = 'message-container';
  }

  showError(message) {
    const messageContainer = this.registerContainer.querySelector('#registerMessage');
    messageContainer.innerHTML = message;
    messageContainer.className = 'message-container error-message';
  }

  showSuccess(message) {
    const messageContainer = this.registerContainer.querySelector('#registerMessage');
    messageContainer.innerHTML = message;
    messageContainer.className = 'message-container success-message';
    
    const registerForm = this.registerContainer.querySelector('#registerForm');
    registerForm.reset();
  }

  render() {
    return this.registerContainer;
  }

  navigateTo(path) {
    window.location.hash = `#${path}`;
  }

  async afterRender() {}
}

export default RegisterPage;
