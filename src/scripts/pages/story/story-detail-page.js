import StoryModel from '../../data/story-model';
import AuthModel from '../../data/auth-model';

export default class StoryDetailPage {
  constructor() {
    this._storyModel = new StoryModel();
    this._authModel = new AuthModel();
    this._story = null;
  }

  async render() {
    return `
      <section class="container">
        <h1>Detail Cerita</h1>
        
        <div id="loading" class="loading-indicator">
          <p>Memuat data...</p>
        </div>
        
        <div id="error-container" class="error-container"></div>
        
        <div id="story-detail" class="story-detail"></div>
      </section>
    `;
  }

  async afterRender() {
    const urlParams = window.location.hash.split('/');
    const storyId = urlParams[2];

    if (!storyId) {
      this._showError('ID cerita tidak ditemukan');
      return;
    }

    this._showLoading();

    try {
      const token = this._authModel.getToken();
      const response = await this._storyModel.getStoryDetail(token, storyId);

      if (response.error) {
        this._showError(response.message || 'Gagal memuat detail cerita');
        return;
      }

      this._story = response.story;
      this._renderStoryDetail();
    } catch (error) {
      this._showError('Terjadi kesalahan saat memuat detail cerita');
      console.error(error);
    } finally {
      this._hideLoading();
    }
  }

  _renderStoryDetail() {
    const storyDetailContainer = document.getElementById('story-detail');

    if (!this._story) {
      storyDetailContainer.innerHTML = '<p>Data cerita tidak ditemukan</p>';
      return;
    }

    storyDetailContainer.innerHTML = `
      <div class="story-detail-content">
        <h2 class="story-name">${this._story.name}</h2>
        <p class="story-date">${new Date(this._story.createdAt).toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}</p>
        <div class="story-image">
          <img src="${this._story.photoUrl}" alt="${this._story.name}">
        </div>
        <p class="story-description">${this._story.description}</p>
      </div>
    `;
  }

  _showLoading() {
    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = 'block';
  }

  _hideLoading() {
    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = 'none';
  }

  _showError(message) {
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = `<p>${message}</p>`;
    errorContainer.style.display = 'block';
  }
}
