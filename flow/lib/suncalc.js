declare module 'suncalc' {
	declare function getPosition(date: Date, lat: number, long: number): {
		azimuth: number,
		altitude: number,
	};

	declare function getTimes(date: Date, lat: number, long: number): {
		solarNoon: Date,
		nadir: Date,
		sunrise: Date,
		sunset: Date,
		sunriseEnd: Date,
		sunsetStart: Date,
		dawn: Date,
		dusk: Date,
		nauticalDawn: Date,
		nauticalDusk: Date,
		nightEnd: Date,
		night: Date,
		goldenHourEnd: Date,
		goldenHour: Date,
	};

	declare function getMoonPosition(date: Date, lat: number, long: number): {
		azimuth: number,
		altitude: number,
		distance: number,
	};

	declare function getMoonIllumination(date: Date): {
		fraction: number,
		phase: number,
		angle: number,
	};

	declare function getMoonTimes(date: Date, lat: number, long: number, inUTC?: boolean): {
		rise?: number,
		set?: number,
		alwaysUp?: boolean,
		alwaysDown?: boolean,
	};
}
