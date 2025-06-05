import { getAllStories, addNewStory, getStoryDetail } from './api';

class StoryModel {
  constructor() {
    this._stories = [];
  }

  async getStories(token, page = 1, size = 10, location = 1) {
    try {
      const response = await getAllStories({ token, page, size, location });

      if (!response.error) {
        this._stories = response.listStory || [];
        return {
          stories: this._stories,
          error: false,
        };
      }

      return {
        stories: [],
        error: true,
        message: response.message,
      };
    } catch (error) {
      return {
        stories: [],
        error: true,
        message: 'Terjadi kesalahan saat mengambil data cerita',
      };
    }
  }

  async addStory({ token, description, photo, lat, lon }) {
    try {
      return await addNewStory({ token, description, photo, lat, lon });
    } catch (error) {
      return {
        error: true,
        message: 'Terjadi kesalahan saat menambahkan cerita',
      };
    }
  }
  
  async getStoryDetail(token, id) {
    try {
      return await getStoryDetail({ token, id });
    } catch (error) {
      return {
        error: true,
        message: 'Terjadi kesalahan saat mengambil detail cerita',
      };
    }
  }
}

export default StoryModel;
