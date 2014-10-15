RESGulp
=======

Gulpfile for RES Building

**Please report any issues to fox@allthefoxes.me or report them in the issues tab on github!**

**Please**  do not distribute your own binaries of RES (e.g. with bugfixes, etc). The version numbers in RES are important references for tech support so that we can replicate bugs that users report using the same version they are, and when you distribute your own - you run the risk of polluting/confusing that. In addition, if a user overwrites his/her extension with your distributed copy, it may not properly retain their RES settings/data depending on the developer ID used, etc.

---

###Getting Started:

1. Gulp uses node.js. Download node.js [here](http://nodejs.org/download/)

2. Next, you will need the base gulp program. You will use the node.js package manager for this (which should work with all OSes)

3. Navigate to your command line. You will need root/admin priviliges

4. Run 

npm install --global gulp

5. Navigate to your RES folder in the command line. (It is suggested you use git with RES, so you can pull changes easily and keep all your gulp packages where they are)

6. Run

    npm install --save-dev gulp

7. Run

    npm install --save-dev gulp-minify-css gulp-uglify gulp-imagemin gulp-rename gulp-concat gulp-notify del gulp-bump gulp-zip

8. Move gulpfile.js into your RES directory

===

###Usage:


Any task will output its work in the dist directory in your RES data folder

In your RES data folder, you can use the gulp command and run specific tasks, or all tasks. Here are some commands you can run:

    gulp

Running gulp by itself will empty out the dist directory and then build **all five** versions of RES, for each browser. 

    gulp clean

Nukes the dist folder

    gulp [chrome, safari, firefox, oblink, opera]

Builds for just the selected browser. Note this does not clean out the dist directory, so it is suggested you run gulp clean before doing this. Ex. gulp chrome (Builds the chrome version of RES)


##Zip commands

Want to zip up your files? Tasks exist for this, but you will need to edit gulpfile.js

Open gulpfile.js with your favorite text editor (that can handle js)

Scroll down until you see "//Zip Tasks"

Locate the line (for all browsers, or just the one you use)

    .pipe(gulp.dest('../../../var/www/html'))

and change it to whatever you want. Note that the path is relative to the RES Data Directory

Save gulpfile.js, and you can now run

    gulp [chrome, safari, firefox, opera, oblink]zip

This takes the appropriate folder from *dist*, zips it, and places it where you set its destination. 

**If you change your zip tasks and then update to a newer version of this gulpfile, you will need to make your changes again!**

---

Questions? Email fox@allthefoxes.me
