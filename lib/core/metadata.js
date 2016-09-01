import packageInfo from 'json!../../package.json';

export const defaultModuleID = 'about';  // Show this module by default when opening settings
export const categories = ['About RES', 'My account', 'Users', 'Comments', 'Submissions', 'Subreddits', 'Appearance', '*', 'Core'];
export const announcementsSubreddit = 'RESAnnouncements';
export const name = packageInfo.title;
export const version = packageInfo.version;
export const updatedURL = 'https://redditenhancementsuite.com/releases/';
