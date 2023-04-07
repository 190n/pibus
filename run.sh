#!/bin/sh

# if [ src/main.tsx -nt dist/main.js ]; then
# 	npx tsc
# fi

CONFIG_JSON=$(node -e 'console.log(JSON.stringify(require("./config")))')
PIBUS_DIR=$(echo "$CONFIG_JSON" | jq -r .outputDirectory)
PIBUS_INTERVAL=$(echo "$CONFIG_JSON" | jq -r .refreshInterval)

# ensure something is visible before we try to run
cat > $PIBUS_DIR/index.html <<EOF
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<style>
			body {
				background-color: black;
				color: white;
			}
		</style>
	</head>
	<body>
		<p>
			The script has not finished running yet. stderr output, if any, is shown below.
			Reloading in 5 seconds...
		</p>
		<iframe src="errors.html"></iframe>
		<script>
			setTimeout(() => window.location.reload(), 5000);
		</script>
	</body>
</html>
EOF

while true; do
	echo "<style>pre { color: white; }</style><pre>" > $PIBUS_DIR/errors.html
	echo -n "running... "
	# send stdout to tmp.html, and stderr to both errors.html and the console
	node . > $PIBUS_DIR/tmp.html 2>> $PIBUS_DIR/errors.html
	status=$?
	# print actual errors ignoring the <pre> line
	tail -n +2 $PIBUS_DIR/errors.html
	echo done
	echo "</pre>" >> $PIBUS_DIR/errors.html
	if [ $status == 0 ]; then
		mv $PIBUS_DIR/tmp.html $PIBUS_DIR/index.html
	fi

	sleep $PIBUS_INTERVAL
done
