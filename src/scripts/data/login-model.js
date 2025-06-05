import { login } from './api';

class LoginModel {
  async login({ email, password }) {
    try {
      return await login({ email, password });
    } catch (error) {
      return {
        error: true,
        message: 'Terjadi kesalahan pada server',
      };
    }
  }
}

export default LoginModel;