class LoginPresenter {
  constructor({ view, model, authModel }) {
    this._view = view;
    this._model = model;
    this._authModel = authModel;
  }

  async login({ email, password }) {
    this._view.showLoading();
    
    try {
      const response = await this._model.login({ email, password });
      
      if (response.error) {
        this._view.showError(response.message || 'Terjadi kesalahan saat login');
        return;
      }
      
      // Simpan data login menggunakan authModel
      this._authModel.saveAuthData(
        response.loginResult.token,
        {
          id: response.loginResult.userId,
          name: response.loginResult.name,
        }
      );
      
      this._view.showSuccess('Login berhasil! Mengalihkan...');
      
      setTimeout(() => {
        this._view.navigateTo('/');
      }, 1500);
    } catch (error) {
      this._view.showError('Terjadi kesalahan pada server');
      console.error(error);
    }
  }
}

export default LoginPresenter;
