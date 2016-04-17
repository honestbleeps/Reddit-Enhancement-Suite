import { ajax } from 'environment';
import { string } from '../../utils';

addLibrary('mediaHosts', 'futurism', {
	name: 'futurism',
	attribution: false,
	domains: ['futurism.com', 'futurism.co'],
	detect: () => true,
	async handleLink(elem) {
		let apiURL = string.encode`http://www.futurism.com/wp-content/themes/futurism/res.php?url=${elem.href}`;
		if (elem.href.includes('wp-content/uploads')) {
			apiURL += '&reverse=true';
		}

		const { data, success, status } = await ajax({
			url: apiURL,
			type: 'json'
		});

		if (!success) {
			throw new Error(`Request failure: status ${status}`);
		}

		elem.type = 'IMAGE';
		elem.src = data['image_link'];
	}
});
