#!/bin/bash

libfiles=("lib/"*)
modulefiles=("lib/modules/"*)
files=("${libfiles[@]}" "${modulefiles[@]}")

paths=("Chrome" "XPI/data" "Opera" "OperaBlink" "RES.safariextension")

for i in "${files[@]}"
do
	for j in "${paths[@]}"
		do
			if [[ -f $i ]]
			then
				file=$(basename $i)
				dir=$(dirname $i)
				if [ "$j" == "Opera" ];
				then
					if [[ "$i" == *.user.js || "$i" == *.css ]];
					then
						dest="./$j/includes/"
					else
						dest="./$j/modules/"
					fi
				else
					if [ "$dir" == "lib/modules" ]
					then
						dest="./$j/modules/"
					else
						dest="./$j/"
					fi
				fi
				echo "Re-linking:" $dest$file
				if [ -f $dest$file ];
				then
					rm $dest$file
				fi

				if [ "clean" != "$1" ];
				then
					mkdir -p $dest
					ln ./$i $dest
				fi
			fi
		done
done
