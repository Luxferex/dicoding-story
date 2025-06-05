class RegisterPresenter {
  constructor({ view, model }) {
    this._view = view;
    this._model = model;
  }

  async register({ name, email, password }) {
    try {
      this._view.showLoading();

      const response = await this._model.register({ name, email, password });

      if (response.error) {
        this._view.showError(response.message || 'Terjadi kesalahan saat mendaftar');
        return;
      }

      this._view.showSuccess('Pendaftaran berhasil! Silakan login.');

      setTimeout(() => {
        this._view.navigateTo('/login');
      }, 2000);
    } catch (error) {
      this._view.showError('Terjadi kesalahan pada server');
      console.error(error);
    }
  }
}

export default RegisterPresenter;
