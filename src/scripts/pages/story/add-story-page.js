import StoryPresenter from '../../presenter/story-presenter';
import StoryModel from '../../data/story-model';
import AuthModel from '../../data/auth-model';

class AddStoryPage {
  constructor() {
    this._initialUI();
    this._latitude = null;
    this._longitude = null;
    this._imageFile = null;
    this._map = null;
    this._marker = null;
    this._stream = null;
    this._storyModel = new StoryModel();
    this._authModel = new AuthModel();
    this._storyPresenter = new StoryPresenter({
      view: this,
      model: this._storyModel,
      authModel: this._authModel,
    });
  }

  _initialUI() {
    this.addStoryContainer = document.createElement('div');
    this.addStoryContainer.classList.add('add-story-container');
    this.addStoryContainer.innerHTML = `
      <div class="add-story-card">
        <div class="add-story-header">
          <h2>Tambah Cerita Baru</h2>
          <p>Bagikan cerita menarikmu bersama komunitas Dicoding</p>
        </div>
        <form id="addStoryForm">
          <div class="form-group">
            <label for="description">Deskripsi</label>
            <textarea id="description" name="description" placeholder="Ceritakan pengalamanmu..." required aria-describedby="descriptionHelp"></textarea>
            <small id="descriptionHelp" class="form-text">Ceritakan pengalaman menarikmu dengan Dicoding</small>
          </div>
          
          <div class="form-group">
            <label for="photoInput">Foto</label>
            <div class="photo-capture-container">
              <div class="camera-buttons">
                <button type="button" id="startCamera" class="btn-camera" aria-label="Buka kamera">Buka Kamera</button>
                <button type="button" id="capturePhoto" class="btn-camera" disabled aria-label="Ambil foto">Ambil Foto</button>
                <button type="button" id="uploadPhoto" class="btn-camera" aria-label="Upload foto">Upload Foto</button>
                <input type="file" id="photoInput" accept="image/*" style="display: none;" aria-label="Pilih file foto">
              </div>
              <div class="camera-preview-container">
                <video id="cameraPreview" autoplay playsinline style="display: none;" aria-label="Pratinjau kamera"></video>
                <canvas id="photoCanvas" style="display: none;" aria-hidden="true"></canvas>
                <div id="photoPreview" class="photo-preview" aria-live="polite">
                  <p>Belum ada foto yang dipilih</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="mapContainer">Lokasi</label>
            <div class="location-container">
              <div id="mapContainer" class="map-container" tabindex="0" aria-label="Peta untuk memilih lokasi"></div>
              <p class="location-info">Klik pada peta untuk menentukan lokasi</p>
              <div class="location-coordinates" id="locationCoordinates" aria-live="polite">
                <p>Belum ada lokasi yang dipilih</p>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <button type="submit" class="btn-submit">Kirim Cerita</button>
          </div>
        </form>
        <div id="addStoryMessage" class="message-container" role="status" aria-live="polite"></div>
      </div>
    `;
  }

  async render() {
    return this.addStoryContainer;
  }

  async afterRender() {
    this._initMap();
    this._initCamera();
    this._initEventListeners();
  }

  _initMap() {
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) return;

    if (this._map) {
      this._map.remove();
      this._map = null;
    }

    this._map = L.map('mapContainer').setView([-2.5489, 118.0149], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this._map);

    this._map.on('click', (e) => {
      this._setLocation(e.latlng.lat, e.latlng.lng);
    });
  }

  _setLocation(lat, lng) {
    this._latitude = lat;
    this._longitude = lng;

    const locationCoordinates = document.getElementById('locationCoordinates');
    locationCoordinates.innerHTML = `
      <p>Latitude: ${lat.toFixed(6)}</p>
      <p>Longitude: ${lng.toFixed(6)}</p>
    `;
    locationCoordinates.setAttribute('aria-label', `Lokasi dipilih: Latitude ${lat.toFixed(6)}, Longitude ${lng.toFixed(6)}`);

    if (this._marker) {
      this._map.removeLayer(this._marker);
    }

    this._marker = L.marker([lat, lng]).addTo(this._map);
    this._marker.bindPopup('Lokasi cerita Anda').openPopup();
  }

  _initCamera() {
    const startCameraButton = document.getElementById('startCamera');
    const capturePhotoButton = document.getElementById('capturePhoto');
    const uploadPhotoButton = document.getElementById('uploadPhoto');
    const photoInput = document.getElementById('photoInput');
    const cameraPreview = document.getElementById('cameraPreview');
    const photoCanvas = document.getElementById('photoCanvas');
    const photoPreview = document.getElementById('photoPreview');

    startCameraButton.addEventListener('click', async () => {
      try {
        this._stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        cameraPreview.srcObject = this._stream;
        cameraPreview.style.display = 'block';
        photoPreview.style.display = 'none';
        capturePhotoButton.disabled = false;
      } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin dan kamera tersedia.');
      }
    });

    capturePhotoButton.addEventListener('click', () => {
      const context = photoCanvas.getContext('2d');

      photoCanvas.width = cameraPreview.videoWidth;
      photoCanvas.height = cameraPreview.videoHeight;

      context.drawImage(cameraPreview, 0, 0, photoCanvas.width, photoCanvas.height);

      photoCanvas.toBlob(
        (blob) => {
          this._imageFile = new File([blob], 'photo.jpg', { type: 'image/jpeg' });

          const imageUrl = URL.createObjectURL(blob);
          photoPreview.innerHTML = `<img src="${imageUrl}" alt="Foto yang diambil untuk cerita" class="captured-photo">`;
          photoPreview.style.display = 'block';
          cameraPreview.style.display = 'none';

          this._stopCamera();
          capturePhotoButton.disabled = true;
        },
        'image/jpeg',
        0.8
      );
    });

    uploadPhotoButton.addEventListener('click', () => {
      photoInput.click();
    });

    photoInput.addEventListener('change', (event) => {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];

        if (!file.type.startsWith('image/')) {
          alert('File harus berupa gambar');
          return;
        }

        if (file.size > 1024 * 1024) {
          alert('Ukuran gambar tidak boleh melebihi 1MB');
          return;
        }

        this._imageFile = file;

        const imageUrl = URL.createObjectURL(file);
        photoPreview.innerHTML = `<img src="${imageUrl}" alt="Foto yang diunggah untuk cerita" class="captured-photo">`;
        photoPreview.style.display = 'block';
        cameraPreview.style.display = 'none';

        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          stream = null;
        }

        capturePhotoButton.disabled = true;
      }
    });
  }

  // metode untuk mematikan kamera
  _stopCamera() {
    if (this._stream) {
      this._stream.getTracks().forEach((track) => track.stop());
      this._stream = null;
    }
  }

  // metode dispose untuk membersihkan sumber daya
  dispose() {
    this._stopCamera();

    // Bersihkan sumber daya map jika ada
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
  }

  _initEventListeners() {
    const addStoryForm = document.getElementById('addStoryForm');
    const messageContainer = document.getElementById('addStoryMessage');

    const mapContainer = document.getElementById('mapContainer');
    if (mapContainer) {
      mapContainer.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          this._map.getContainer().focus();
        }
      });
    }

    addStoryForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!this._imageFile) {
        this.showError('Silakan pilih atau ambil foto terlebih dahulu');
        return;
      }

      const description = addStoryForm.description.value;
      const token = this._authModel.getToken();

      if (!token) {
        window.location.hash = '#/login';
        return;
      }

      try {
        this.showLoading('Sedang mengirim cerita...');

        await this._storyPresenter.addStory({
          description,
          photo: this._imageFile,
          lat: this._latitude,
          lon: this._longitude,
        });
      } catch (error) {
        this.showError('Terjadi kesalahan saat mengirim cerita');
        console.error(error);
      }
    });
  }

  showLoading(message) {
    const messageContainer = document.getElementById('addStoryMessage');
    messageContainer.innerHTML = message || 'Sedang memproses...';
    messageContainer.className = 'message-container';
  }

  showError(message) {
    const messageContainer = document.getElementById('addStoryMessage');
    messageContainer.innerHTML = message;
    messageContainer.className = 'message-container error';
  }

  showSuccess(message) {
    const messageContainer = document.getElementById('addStoryMessage');
    messageContainer.innerHTML = message;
    messageContainer.className = 'message-container success';

    const addStoryForm = document.getElementById('addStoryForm');
    addStoryForm.reset();
    document.getElementById('photoPreview').innerHTML = '<p>Belum ada foto yang dipilih</p>';
    document.getElementById('locationCoordinates').innerHTML = '<p>Belum ada lokasi yang dipilih</p>';

    if (this._marker) {
      this._map.removeLayer(this._marker);
      this._marker = null;
    }

    this._latitude = null;
    this._longitude = null;
    this._imageFile = null;

    setTimeout(() => {
      window.location.hash = '#/';
    }, 2000);
  }
}

export default AddStoryPage;
