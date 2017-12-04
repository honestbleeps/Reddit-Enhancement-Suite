/* @flow */
import _ from 'lodash';

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
	return JSON.stringify(object);
}

export function deserialize(string: Serialized): Deserialized {
	const object = JSON.parse(string);
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
