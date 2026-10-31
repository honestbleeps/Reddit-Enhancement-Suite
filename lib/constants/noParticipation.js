/* @flow */

// np.reddit.com, np-nm.reddit.com, nm-np.reddit.com
export const NP_HOSTNAME_REGEX: RegExp = /^(?:\w+-)?np(?:-\w+)?\.reddit\.com$/i;

// Keeps No Participation mode when an NP link is redirected to old.reddit.com
export const NP_SEARCH_PARAM = 'res_np';
