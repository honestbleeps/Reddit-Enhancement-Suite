import packageInfo from 'json!../../package.json';

export const defaultModuleID = 'about';  // Show this module by default when opening settings
export const categories = ['aboutCategory', 'myAccountCategory', 'usersCategory', 'commentsCategory', 'submissionsCategory', 'subredditsCategory', 'appearanceCategory', 'browsingCategory', 'productivityCategory', 'coreCategory'];
export const announcementsSubreddit = 'RESAnnouncements';
export const name = packageInfo.title;
export const version = packageInfo.version;
export const updatedURL = 'https://redditenhancementsuite.com/releases/';
export const homepageURL = packageInfo.homepage;
