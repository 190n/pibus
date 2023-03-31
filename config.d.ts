// each element in this array represents a line at a stop
// first, go to https://cruzmetro.com/Region/0/Routes and find the pattern (a pattern is just a
// route with a specified direction, where applicable) you want
// then go to https://cruzmetro.com/Route/<route ID>/Directions (route ID != pattern ID) and find
// the stop ID you want
// name is just whatever name should be displayed for this stop
declare const config: Array<{
	stop: number;
	pattern: number;
	name: string;
}>;
export default config;
