#!/bin/sh

# if [ src/main.tsx -nt dist/main.js ]; then
# 	npx tsc
# fi

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
