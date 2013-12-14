#!/bin/bash

files=("reddit_enhancement_suite.user.js" "res.css" "nightmode.css" "commentBoxes.css" \
	"jquery-1.10.2.min.js" "jquery-fieldselection.min.js" \
	"jquery.dragsort-0.6.js" "jquery.tokeninput.js" \
	"tinycon.js" "snuownd.js" "guiders-1.2.8.js")
paths=("Chrome" "XPI/data" "Opera" "OperaBlink" "RES.safariextension")

for i in "${files[@]}"
do
	for j in "${paths[@]}"
	do
		if [ "$j" == "Opera" ];
		then
			if [[ "$i" == *.user.js || "$i" == *.css ]];
			then
				dest="./$j/includes/"
			else
				dest="./$j/modules/"
			fi
		else
			dest="./$j/"
		fi
		echo "Re-linking:" $dest$i
		if [ -f $dest$i ];
		then
			rm $dest$i
		fi

		if [ "clean" != "$1" ];
		then
			mkdir -p $dest
			ln ./lib/$i $dest
		fi
	done
done
