import StoryModel from '../../data/story-model';
import StoryPresenter from '../../presenter/story-presenter';
import AuthModel from '../../data/auth-model';

export default class HomePage {
  constructor() {
    this._storyModel = new StoryModel();
    this._authModel = new AuthModel();
    this._storyPresenter = new StoryPresenter({
      view: this,
      model: this._storyModel,
      authModel: this._authModel,
    });

    this._stories = [];
    this._map = null;
    this._markers = [];
  }

  async render() {
    return `
      <section class="container">
        <h1>Cerita Terbaru</h1>
        
        <div id="loading" class="loading-indicator">
          <p>Memuat data...</p>
        </div>
        
        <div id="error-container" class="error-container"></div>
        
        <div id="stories-container" class="stories-container"></div>
        
        <div id="map" class="map-container"></div>
      </section>
    `;
  }

  async afterRender() {
    this._initMap();
    await this._storyPresenter.getAllStories();
  }

  _initMap() {
    this._map = L.map('map').setView([-2.5489, 118.0149], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this._map);
  }

  showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('error-container').style.display = 'none';
    document.getElementById('stories-container').style.display = 'none';
  }

  hideLoading() {
    document.getElementById('loading').style.display = 'none';
  }

  showError(message) {
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = `<p>${message}</p>`;
    errorContainer.style.display = 'block';
    document.getElementById('stories-container').style.display = 'none';
  }

  showEmpty() {
    const storiesContainer = document.getElementById('stories-container');
    storiesContainer.innerHTML = '<p class="empty-message">Tidak ada cerita yang tersedia</p>';
    storiesContainer.style.display = 'block';
  }

  showStories(stories) {
    this._stories = stories;
    const storiesContainer = document.getElementById('stories-container');

    let storiesHTML = '';
    stories.forEach((story) => {
      storiesHTML += this._createStoryItemTemplate(story);

      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this._map);
        marker.bindPopup(`
          <div class="map-popup">
            <h3>${story.name}</h3>
            <img src="${story.photoUrl}" alt="${story.name}" width="150">
            <p>${story.description.substring(0, 100)}...</p>
            <a href="#/story/${story.id}">Lihat Detail</a>
          </div>
        `);
        this._markers.push(marker);
      }
    });

    storiesContainer.innerHTML = storiesHTML;
    storiesContainer.style.display = 'block';

    // Tambahkan view-transition-name pada setiap story-item
    document.querySelectorAll('.story-item').forEach((item, index) => {
      item.style.viewTransitionName = `story-item-${index}`;
    });
  }

  _createStoryItemTemplate(story) {
    return `
      <div class="story-item" data-id="${story.id}">
        <div class="story-image">
          <img src="${story.photoUrl}" alt="${story.name}" style="view-transition-name: img-${story.id}">
        </div>
        <div class="story-content">
          <h2 class="story-name" style="view-transition-name: title-${story.id}">${story.name}</h2>
          <p class="story-date">${new Date(story.createdAt).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}</p>
          <p class="story-description">${story.description.substring(0, 150)}...</p>
          <a href="#/story/${story.id}" class="story-link">Baca Selengkapnya</a>
        </div>
      </div>
    `;
  }
}
