import { openDB } from 'idb';

const DATABASE_NAME = 'dicoding-story-db';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'stories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
  },
});

const IdbService = {
  async getStories() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },

  async getStoryById(id) {
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },

  async saveStories(stories) {
    const db = await dbPromise;
    const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    
    // Clear existing stories first
    await store.clear();
    
    // Add all stories
    for (const story of stories) {
      await store.put(story);
    }
    
    await tx.done;
  },

  async saveStory(story) {
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },

  async deleteStory(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },
};

export default IdbService;