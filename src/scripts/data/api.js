const ENDPOINTS = {
  BASE_URL: 'https://story-api.dicoding.dev/v1',
  REGISTER: '/register',
  LOGIN: '/login',
  STORIES: '/stories',
  STORIES_GUEST: '/stories/guest',
  STORY_DETAIL: (id) => `/stories/${id}`,
  NOTIFICATIONS_SUBSCRIBE: '/notifications/subscribe',
};

export async function register({ name, email, password }) {
  const response = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.REGISTER}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
  return await response.json();
}

export async function login({ email, password }) {
  const response = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.LOGIN}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
  return await response.json();
}

export async function getAllStories({ token, page, size, location = 0 }) {
  const url = new URL(`${ENDPOINTS.BASE_URL}${ENDPOINTS.STORIES}`);

  if (page) url.searchParams.append('page', page);
  if (size) url.searchParams.append('size', size);
  if (location) url.searchParams.append('location', location);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
}

export async function getStoryDetail({ token, id }) {
  const response = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.STORY_DETAIL(id)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
}

export async function addNewStory({ token, description, photo, lat, lon }) {
  const formData = new FormData();
  formData.append('description', description);

  if (photo instanceof File) {
    formData.append('photo', photo);
  } else {
    throw new Error('Photo should be a valid File object');
  }

  if (lat) formData.append('lat', lat);
  if (lon) formData.append('lon', lon);

  const response = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.STORIES}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  return await response.json();
}

export async function addNewStoryAsGuest({ description, photo, lat, lon }) {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);

  if (lat) formData.append('lat', lat);
  if (lon) formData.append('lon', lon);

  const response = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.STORIES_GUEST}`, {
    method: 'POST',
    body: formData,
  });
  return await response.json();
}

export async function subscribeNotification({ token, endpoint, keys }) {
  const response = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.NOTIFICATIONS_SUBSCRIBE}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint,
      keys,
    }),
  });
  return await response.json();
}

export async function unsubscribeNotification({ token, endpoint }) {
  const response = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.NOTIFICATIONS_SUBSCRIBE}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint,
    }),
  });
  return await response.json();
}
