import { register } from './api';

class RegisterModel {
  async register({ name, email, password }) {
    try {
      return await register({ name, email, password });
    } catch (error) {
      return {
        error: true,
        message: 'Terjadi kesalahan saat mendaftar',
      };
    }
  }
}

export default RegisterModel;
