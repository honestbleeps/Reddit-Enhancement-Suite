#!/bin/bash

libfiles=("lib/"*)
corefiles=("lib/core/"*)
modulefiles=("lib/modules/"*)
hostsfiles=("lib/modules/hosts/"*)
vendorfiles=("lib/vendor/"*)
files=("${libfiles[@]}" "${corefiles[@]}" "${modulefiles[@]}" "${vendorfiles[@]}" "${hostsfiles[@]}")

paths=("Chrome" "XPI/data" "Opera" "OperaBlink" "RES.safariextension")

for i in "${files[@]}"
do
	for j in "${paths[@]}"
	do
		if [[ -f $i ]]
		then
			file=$(basename $i)
			dir=$(dirname $i)

			if [[ $dir == "lib/core" ]]
			then
				dest="./$j/core/"
			elif [[ $dir == "lib/modules" ]]
			then
				dest="./$j/modules/"
			elif [[ $dir == "lib/modules/hosts" ]]
			then
				dest="./$j/modules/hosts/"
			elif [[ $dir == "lib/vendor" ]]
			then
				dest="./$j/vendor/"
			else
				dest="./$j/"
			fi

			echo "Re-linking:" $dest$file

			if [[ -f $dest$file ]]
			then
				rm $dest$file
			fi

			if [[ $1 != "clean" ]]
			then
				mkdir -p $dest
				ln ./$i $dest
			fi
		fi
	done
done

if [[ -f "OperaBlink/browsersupport-chrome.js" ]]
then
	rm "OperaBlink/browsersupport-chrome.js"
fi

if [[ $1 != "clean" ]]
then
	ln "Chrome/browsersupport-chrome.js" "OperaBlink/browsersupport-chrome.js"
fi
