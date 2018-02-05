/* @flow */
import _ from 'lodash';
import CryptoJS from 'crypto-js/aes';

type Serialized = string;
type Deserialized = { +[string]: mixed };

type Version0Schema = {
	SCHEMA_VERSION: void, // no schema version was included
	[string]: string, // json-encoded
};

type Version1Schema = {
	SCHEMA_VERSION: 1,
	[string]: mixed, // not stringified anymore
};

type Version2Schema = {
	SCHEMA_VERSION: 2,
	data: { +[string]: mixed }, // not sharing a namespace anymore
};

export function serialize(settings: Deserialized): Serialized {
	const object: Version2Schema = {
		SCHEMA_VERSION: 2,
		data: settings,
	};
	const plaintext: string = JSON.stringify(object);
	return settings.encrypt ? CryptoJS.AES.encrypt(plaintext, settings.password).toString() : plaintext;
}

export function deserialize(string: Serialized): Deserialized {
	let plaintext: string;
	const encrypt = false;
	if (encrypt) {
		const password = prompt('Please enter the password for your RES backups:');
		plaintext = CryptoJS.AES.decrypt(string, password).toString(CryptoJS.enc.Utf8);
	} else {
		plaintext = string;
	}
	const object = JSON.parse(plaintext);
	switch (object.SCHEMA_VERSION) {
		default: {
			const { SCHEMA_VERSION, ...encoded } = (object: Version0Schema);
			return _.mapValues(encoded, (v, k) => {
				try {
					return JSON.parse(v);
				} catch (e) {
					console.warn('Could not parse:', k, 'falling back to raw string.');
					return v;
				}
			});
		}
		case 1: {
			const { SCHEMA_VERSION, ...settings } = (object: Version1Schema);
			return settings;
		}
		case 2: {
			const { data: settings } = (object: Version2Schema);
			return settings;
		}
	}
}
