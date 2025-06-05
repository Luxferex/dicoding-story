import IdbService from '../../data/idb-service';

export default class SavedStoriesPage {
  constructor() {
    this._stories = [];
  }

  async render() {
    return `
      <section class="container">
        <h1>Cerita Tersimpan</h1>
        
        <div id="loading" class="loading-indicator">
          <p>Memuat data...</p>
        </div>
        
        <div id="error-container" class="error-container"></div>
        
        <div id="stories-container" class="stories-container"></div>
      </section>
    `;
  }

  async afterRender() {
    this.showLoading();
    try {
      const stories = await IdbService.getStories();
      
      if (stories.length === 0) {
        this.showEmpty();
        return;
      }
      
      this.showStories(stories);
    } catch (error) {
      this.showError('Terjadi kesalahan saat memuat data tersimpan');
    } finally {
      this.hideLoading();
    }
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
    storiesContainer.innerHTML = '<p class="empty-message">Tidak ada cerita tersimpan</p>';
    storiesContainer.style.display = 'block';
  }

  showStories(stories) {
    this._stories = stories;
    const storiesContainer = document.getElementById('stories-container');

    let storiesHTML = '';
    stories.forEach((story) => {
      storiesHTML += this._createStoryItemTemplate(story);
    });

    storiesContainer.innerHTML = storiesHTML;
    storiesContainer.style.display = 'block';

    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-story-btn').forEach((button) => {
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        const storyId = event.target.dataset.id;
        await this._deleteStory(storyId);
      });
    });
  }

  async _deleteStory(id) {
    try {
      await IdbService.deleteStory(id);
      
      // Refresh the list
      const stories = await IdbService.getStories();
      
      if (stories.length === 0) {
        this.showEmpty();
        return;
      }
      
      this.showStories(stories);
    } catch (error) {
      this.showError('Terjadi kesalahan saat menghapus cerita');
    }
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
          <div class="story-actions">
            <a href="#/story/${story.id}" class="story-link">Baca Selengkapnya</a>
            <button class="delete-story-btn" data-id="${story.id}">Hapus</button>
          </div>
        </div>
      </div>
    `;
  }
}