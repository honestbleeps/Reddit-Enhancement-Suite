export function indexOptionTable(option, keyFieldIndex) {
	const source = option.value;
	const keyIsList = option.fields[keyFieldIndex].type === 'list' ? ',' : false;
	return indexArrayByProperty(source, keyFieldIndex, keyIsList);
}

function indexArrayByProperty(source, keyIndex, keyValueSeparator) {
	let index;
	if (!source || !source.length) {
		index = {
			items: [],
			keys: [],
		};
	} else {
		index = createIndex();
	}

	Reflect.defineProperty(getItem, 'keys', {
		value: index.keys,
		writeable: false,
	});
	Reflect.defineProperty(getItem, 'all', {
		value: getAllItems,
		writeable: false,
	});
	return getItem;

	function createIndex() {
		const itemsByKey = {};
		let allKeys = [];

		for (const item of source) {
			const key = item && item[keyIndex];
			if (!key) continue;

			let keys;
			if (keyValueSeparator) {
				keys = key.split(keyValueSeparator);
			} else {
				keys = [key && key];
			}
			for (const k of keys) {
				const key = k.toLowerCase();
				itemsByKey[key] = itemsByKey[key] || [];
				itemsByKey[key].push(item);
			}

			allKeys = allKeys.concat(keys);
		}

		// remove duplicates
		allKeys = allKeys.filter((value, index, array) => array.indexOf(value, index + 1) === -1);

		return {
			items: itemsByKey,
			keys: allKeys,
		};
	}

	function getItem(key) {
		key = key && key.toLowerCase();
		return index.items[key];
	}

	function getAllItems() {
		return index.keys.map(getItem);
	}
}
