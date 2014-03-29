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
				if [ -f $dest$file ];
				then
					rm $dest$file
				fi

				if [ "clean" != "$1" ];
				then
					echo "Re-linking:" $dest$file
					mkdir -p $dest
					ln ./$i $dest
				else
					echo "Cleaned:" $dest$file
				fi
			fi
		done
done
