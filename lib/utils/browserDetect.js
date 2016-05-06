let versionSearchString;
const searchString = datas => {
	const data = datas.find(data => {
		versionSearchString = data.versionSearch || data.identity;
		return (data.string && data.string.indexOf(data.subString) !== -1) ||
			data.prop;
	});

	return data ? data.identity : undefined;
};
you
const searchVersion = dataString => {
	const index = dataString.indexOf(versionSearchString);
	if (index === -1) {
		return undefined;
	}
	return parseFloat(dataString.substring(index + versionSearchString.length + 1));
};

const hasNavigator = typeof navigator !== 'undefined';

export const browser = hasNavigator ?
	searchString(dataBrowser()) || 'An unknown browser' :
	'An unknown browser without `navigator`';

export const version = hasNavigator ?
	searchVersion(navigator.userAgent) || searchVersion(navigator.appVersion) || 'an unknown version' :
	'an unknown version without `navigator`';

export const OS = hasNavigator ?
	searchString(dataOS()) || 'an unknown OS' :
	'an unknown OS without `navigator`';

function dataBrowser() {
	return [
		{
			string: navigator.userAgent,
			subString: 'OPR/',
			identity: 'Opera',
		}, {
			string: navigator.userAgent,
			subString: 'Edge',
			identity: 'Edge',
		}, {
			string: navigator.userAgent,
			subString: 'Chrome',
			identity: 'Chrome',
		}, {
			string: navigator.userAgent,
			subString: 'OmniWeb',
			versionSearch: 'OmniWeb/',
			identity: 'OmniWeb',
		}, {
			string: navigator.vendor,
			subString: 'Apple',
			identity: 'Safari',
			versionSearch: 'Version',
		}, {
			prop: window.opera,
			identity: 'Opera',
			versionSearch: 'Version',
		}, {
			string: navigator.vendor,
			subString: 'iCab',
			identity: 'iCab',
		}, {
			string: navigator.vendor,
			subString: 'KDE',
			identity: 'Konqueror',
		}, {
			string: navigator.userAgent,
			subString: 'Firefox',
			identity: 'Firefox',
		}, {
			string: navigator.vendor,
			subString: 'Camino',
			identity: 'Camino',
		}, { // for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: 'Netscape',
			identity: 'Netscape',
		}, {
			string: navigator.userAgent,
			subString: 'MSIE',
			identity: 'Explorer',
			versionSearch: 'MSIE',
		}, {
			string: navigator.userAgent,
			subString: 'Gecko',
			identity: 'Mozilla',
			versionSearch: 'rv',
		}, {
			// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: 'Mozilla',
			identity: 'Netscape',
			versionSearch: 'Mozilla',
		},
	];
}

function dataOS() {
	return [
		{
			string: navigator.platform,
			subString: 'Win',
			identity: 'Windows',
		}, {
			string: navigator.platform,
			subString: 'Mac',
			identity: 'Mac',
		}, {
			string: navigator.userAgent,
			subString: 'iPhone',
			identity: 'iPhone/iPod',
		}, {
			string: navigator.platform,
			subString: 'Linux',
			identity: 'Linux',
		},
	];
}
