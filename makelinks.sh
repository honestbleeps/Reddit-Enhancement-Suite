#!/bin/sh

files=("reddit_enhancement_suite.user.js" "res.css" "nightmode.css" "commentBoxes.css")
paths=("./Chrome/" "./XPI/data/" "./Opera/includes/" "./RES.safariextension/")

for i in "${files[@]}"
do
	for j in "${paths[@]}"
	do
		echo "Re-linking:" $j$i
		if [ -f $j$i ];
		then
			rm $j$i
		fi

		ln ./lib/$i $j
	done
done