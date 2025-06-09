import IdbService from '../data/idb-service';

class StoryPresenter {
  constructor({ view, model, authModel }) {
    this._view = view;
    this._model = model;
    this._authModel = authModel;
  }

  async getAllStories() {
    this._view.showLoading();

    try {
      const token = this._authModel.getToken();
      const { stories, error, message } = await this._model.getStories(token);

      if (error) {
        this._view.showError(message);
        return;
      }

      if (stories.length === 0) {
        this._view.showEmpty();
        return;
      }

      await IdbService.saveStories(stories);

      this._view.showStories(stories);
    } catch (error) {
      this._view.showError('Terjadi kesalahan saat memuat data');
    } finally {
      this._view.hideLoading();
    }
  }

  async addStory({ description, photo, lat, lon }) {
    try {
      const token = this._authModel.getToken();
      const response = await this._model.addStory({
        token,
        description,
        photo,
        lat,
        lon,
      });

      if (!response.error) {
        this._view.showSuccess('Cerita berhasil ditambahkan!');
      } else {
        this._view.showError(`Error: ${response.message}`);
      }
    } catch (error) {
      this._view.showError('Terjadi kesalahan saat mengirim cerita');
      console.error(error);
    }
  }

  // Tambahkan fungsi untuk menyimpan satu cerita ke IndexedDB
  async saveStoryToIndexedDB(story) {
    try {
      await IdbService.saveStory(story);
      return { error: false, message: 'Cerita berhasil disimpan' };
    } catch (error) {
      console.error('Error saving story to IndexedDB:', error);
      return { error: true, message: 'Gagal menyimpan cerita' };
    }
  }

  // Tambahkan fungsi untuk menghapus cerita dari IndexedDB
  async deleteStoryFromIndexedDB(id) {
    try {
      await IdbService.deleteStory(id);
      return { error: false, message: 'Cerita berhasil dihapus' };
    } catch (error) {
      console.error('Error deleting story from IndexedDB:', error);
      return { error: true, message: 'Gagal menghapus cerita' };
    }
  }
}

export default StoryPresenter;
