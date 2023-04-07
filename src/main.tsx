import React from 'react';
import { renderToString } from 'react-dom/server';

import config from '../config';

type ArrivalsResponse = Array<{
	RouteID: number;
	Arrivals: Array<{
		Minutes: number;
		VehicleID: number;
	}>;
}>;

type Arrival = { minutes: number; vehicle?: number };

async function getArrivals(stop: number, pattern: number): Promise<Arrival[]> {
	const result: ArrivalsResponse = await (
		await fetch(`https://cruzmetro.com/Stop/${stop}/Arrivals`)
	).json();
	const arrivals = result.find((p) => p.RouteID == pattern)?.Arrivals ?? [];
	return arrivals.map((a) => ({
		minutes: a.Minutes,
		vehicle: a.VehicleID == 0 ? undefined : a.VehicleID,
	}));
}

interface RouteListProps {
	routes: Array<{ name: string; times: Arrival[] }>;
}

function RouteList({ routes }: RouteListProps): JSX.Element {
	return (
		<ul>
			{routes.map(({ name, times }) => (
				<li key={name}>
					<strong>{name}</strong>:&nbsp;
					{times.length == 0 ? (
						'(none)'
					) : (
						<>
							{times.map(({ minutes, vehicle }, i) => {
								let className = 'time';
								if (minutes <= 5) {
									className += ' danger';
								} else if (minutes <= 10) {
									className += ' warning';
								}
								return (
									<React.Fragment key={i}>
										<strong className={className}>{minutes}</strong>
										&nbsp;
										<span className="vehicle">
											(
											{typeof vehicle == 'number'
												? `bus ${vehicle}`
												: 'scheduled'}
											)
										</span>
										{i == times.length - 1 ? ' ' : ', '}
									</React.Fragment>
								);
							})}
							minutes
						</>
					)}
				</li>
			))}
		</ul>
	);
}

(async () => {
	let data: Record<string, Array<{ name: string; times: Arrival[] }>> = {};
	try {
		for (const [sectionName, routes] of Object.entries(config.sections)) {
			data[sectionName] = await Promise.all(
				routes.map(async (r) => ({
					name: r.name,
					times: await getArrivals(r.stop, r.pattern),
				}))
			);
		}
	} catch (e) {
		console.error(JSON.stringify(e));
		process.exit(1);
	}

	const date = new Date();

	console.log('<!doctype html>');
	console.log(
		renderToString(
			<html lang="en">
				<head>
					<meta charSet="utf-8" />
					<title>Bus Arrivals</title>
					<style>{`
						html {
							font-family: sans-serif, system-ui;
							font-size: 24px;
							background-color: black;
							color: #a0a0a0;
						}

						footer {
							position: absolute;
							bottom: 0;
						}

						.time {
							color: #fff;
							font-size: 1.5em;
						}

						.danger {
							color: #c00000;
						}

						.warning {
							color: #c08000;
						}

						.vehicle {
							font-size: 0.75em;
						}

						li {
							line-height: 1.5em;
						}

						iframe {
							border: none;
							width: 100%;
							height: 400px;
						}
					`}</style>
					<script
						dangerouslySetInnerHTML={{
							__html: `
						const updatedTime = ${date.getTime()};

						setTimeout(() => {
							document.getElementById('updatedTime').classList.add('danger');
						}, Math.max(0, ${
							// convert to milliseconds, then double
							2 * 1000 * config.refreshInterval
						} - (Date.now() - updatedTime)));
						setTimeout(() => window.location.reload(), 5000);
						`,
						}}
					></script>
				</head>
				<body>
					<main>
						<h1>Bus Arrivals</h1>
						{Object.keys(data).length == 1 ? (
							<RouteList routes={Object.values(data)[0]} />
						) : (
							Object.entries(data).map(([sectionName, routes]) => (
								<section key={sectionName}>
									<h2>{sectionName}</h2>
									<RouteList routes={routes} />
								</section>
							))
						)}
						<iframe src="errors.html"></iframe>
					</main>
					<footer>
						Updated:&nbsp;
						<span id="updatedTime">
							{date.toDateString()} {date.toLocaleTimeString()}
						</span>
					</footer>
				</body>
			</html>
		)
	);
})();
