This project imports several third-party ("vendor") libraries which are unavailable via npm. These files are stored in this directory, along with several ancillary files.

# SCSS vs CSS

Vendor libraries typically ship `.css` files. They are stored here as `.scss` files for compatibility with this project's build system.

# Libraries

## Guiders.js

### Source

https://github.com/pickhardt/Guiders-JS

### Files

* `guiders.js`
* `guiders.scss` 

### Release Version

v2.0.0 @ [69334e7](https://github.com/pickhardt/Guiders-JS/commit/69334e7101948c77c24b95ce3ee5fae6fc938b98#diff-9fa5dfa2572f020ae815e7a5e5a2b5a9)

## HTMLPasteurizer

Sanitize strings for safely inserting into the DOM as raw HTML

### Files

* `HTMLPasteurizer.js`

### Source

This library was contributed directly to Reddit Enhancement Suite by [@JordanMilne](https://github.com/JordanMilne). It has not been released separately.

[Source commit](https://github.com/JordanMilne/Reddit-Enhancement-Suite/commit/a4fb73b6d90bed5701e3a3672b6ee4a9da78d60a#diff-caf84e354a71ff687c7e8bdac5a137b5)
[Merge commit](https://github.com/honestbleeps/reddit-enhancement-suite/commit/a4fb73b6d90bed5701e3a3672b6ee4a9da78d60a)

### Release version

@ [a85653e](https://github.com/JordanMilne/Reddit-Enhancement-Suite/blob/a85653e1e0ff93732672a37d68d0b906c478bb82/lib/HTMLPasteurizer.js)

## jQuery EdgeScroll

### Source

https://github.com/gamefreak/jquery-edgescroll

### Files

* jquery.edgescroll-v0.1.js

### Release Version

v0.1 @ [62b96ac](https://github.com/gamefreak/jquery-edgescroll/commit/62b96acb87820f188a056eb75a74364db02d4ec1)

## jQuery TokenInput

### Source

This library was forked by the Reddit Enhancement Suite team in order to fix a small packaging issue.  That library is installed via package.json. Ancillary files which are not included in the library are stored in this directory.

Original: https://github.com/loopj/jquery-tokeninput
Fork: https://github.com/Reddit-Enhancement-Suite/jquery-tokeninput

### Files

* `token-input-facebook.scss`

# Ancillary Files

Several files are included in this folder to assist in loading the libraries into the project and runtime environment. These files belong to Reddit Enhancement Suite, not any particular vendor library.

### Files

* `README.md`
* `index.js`
* `index.scss`
* `jquery.js`
* `jqueryPlugins.js`
