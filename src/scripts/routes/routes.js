import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import RegisterPage from '../pages/auth/register-page';
import LoginPage from '../pages/auth/login-page';
import AddStoryPage from '../pages/story/add-story-page';
import StoryDetailPage from '../pages/story/story-detail-page';
import SavedStoriesPage from '../pages/saved/saved-stories-page';

const routes = {
  '/': () => new HomePage(),
  '/about': () => new AboutPage(),
  '/register': () => new RegisterPage(),
  '/login': () => new LoginPage(),
  '/add-story': () => new AddStoryPage(),
  '/story/:id': () => new StoryDetailPage(),
  '/saved-stories': () => new SavedStoriesPage(),
};

export default routes;
