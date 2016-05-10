export default {
	moduleID: 'ctrlv',
	name: 'CtrlV.in',
	logo: '//ctrlv.in/favicon.ico',
	domains: ['ctrlv.in'],
	detect: href => (/^https?:\/\/(?:(?:m|www)\.)?ctrlv\.in\/([0-9]+)/i).exec(href),
	handleLink(elem, [, id]) {
		elem.type = 'IMAGE';
		elem.src = `https://img.ctrlv.in/id/${id}`;
	},
};
