class AuthModel {
  constructor() {
    this._token = null;
    this._user = null;
    this._loadFromStorage();
  }

  _loadFromStorage() {
    this._token = localStorage.getItem('token') || null;
    this._user = JSON.parse(localStorage.getItem('user')) || null;
  }

  saveAuthData(token, user) {
    this._token = token;
    this._user = user;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  getToken() {
    return this._token;
  }

  getUser() {
    return this._user;
  }

  isLoggedIn() {
    return !!this._token;
  }

  clearAuthData() {
    this._token = null;
    this._user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

export default AuthModel;
