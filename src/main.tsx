import React from 'react';
import { renderToString } from 'react-dom/server';

import routes from '../config';

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

(async () => {
	let data: Array<{ name: string; times: Arrival[] }>;
	try {
		data = await Promise.all(
			routes.map(async (r) => ({
				name: r.name,
				times: await getArrivals(r.stop, r.pattern),
			}))
		);
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
						}, Math.max(0, 60000 - (Date.now() - updatedTime)));
						setTimeout(() => window.location.reload(), 5000);
						`,
						}}
					></script>
				</head>
				<body>
					<main>
						<h1>Bus Arrivals</h1>
						<ul>
							{data.map(({ name, times }) => (
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
						<iframe
							src={`${process.env.PIBUS_BASE_URL ?? ''}/errors.html`}
						></iframe>
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
