declare const config: {
	// where the shell script should output html files, ex. '/pibus'
	outputDirectory: string;
	// the time in seconds between fetching data from cruzmetro, ex. 30
	// if more than twice this amount of time has elapsed since an update, the update time is shown in red
	refreshInterval: number;
	sections: Record<
		// the key in this object is the name of a section
		string,
		// each element in this array represents a line at a stop
		Array<{
			// first, go to https://cruzmetro.com/Region/0/Routes and find the pattern (a pattern is just a
			// route with a specified direction, where applicable) you want
			// then go to https://cruzmetro.com/Route/<route ID>/Directions (route ID != pattern ID) and find
			// the stop ID you want
			// name is just whatever name should be displayed for this stop
			stop: number;
			pattern: number;
			name: string;
		}>
	>;
};
export default config;
