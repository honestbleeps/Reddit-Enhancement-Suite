#!/bin/bash
clean=false
if [ "clean" == "$1" ]; then
	clean=true
fi

libfiles="lib"

extensions=("Chrome" "XPI" "Opera" "OperaBlink" "RES.safariextension")
resources=("Chrome" "XPI/data" "Opera/include" "OperaBlink" "RES.safariextension")

build="temp/ext/"

if $clean
then
	rm -rf $build
	echo "Cleaned $build"
	exit
fi

function relink() {
	local path=$1
	local linkdir=$2
	local sourcedir=$3

	local target="$sourcedir/$path"
	local linkname="$linkdir/$path"
	local linkdir=$(dirname $linkname)

	if [ -f $linkname ]; then
		rm $linkname
	fi


	if $clean; then
		echo "Cleaned: $linkname"
	else
		echo "Re-linking: $linkname -> $target"
		mkdir -p $linkdir/$subdir
		ln $target $linkname
	fi
}


for extension in "${extensions[@]}"; do
	sourcedir="$extension"
	targetdir="$extension"

	for file in `find $sourcedir -type f | sed s,^$sourcedir/,,`; do
		relink "$file" "$build$targetdir" "$sourcedir"
	done
done

for resource in "${resources[@]}"; do
	sourcedir="$libfiles"
	targetdir="$resource"

	for file in `find $sourcedir -type f | sed s,^$sourcedir/,,`; do
		relink "$file" "$build$targetdir" "$sourcedir"
	done
done
