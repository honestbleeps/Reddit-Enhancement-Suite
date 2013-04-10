### Building release versions of the extension ###

This document is here for RES developer reference/testing.  Please do not distribute your own binaries unofficially - see README.md for an explanation as to why. Thanks!

**Chrome**
  1. Go to ``Settings->Extensions`` and choose ``Pack extension``. Choose the ``Chrome`` folder for RES. You can also choose to sign the extension with a private key.
  2. This will generate a ``.crx`` and ``.pem`` file for your extension that you can install by dropping the ``.crx`` file in ``Chrome``.

**Firefox**
  1. Make sure you have the addons SDK installed as described in the development section. 
  2. In your terminal, ``cd`` to the ``XPI`` folder and run ``cfx xpi``. This should build an ``.xpi`` file that you can use to install RES.

**Opera**
  1. Opera extensions are simply zip files. So all you need to do is zip up the contents of the ``Opera`` folder, but not the folder itself. So the zip should contain everything inside the ``Opera`` folder. Rename the ``.zip`` file to have the extension ``.oex`` instead. See [here](http://dev.opera.com/articles/view/opera-extensions-hello-world/#packaging) for more information.

**Safari**
  1. Navigate to the ``Extension Builder`` panel as described in the development instructions. Assuming you have followed those instructions and installed RES, you can now choose ``build`` in the top right. This will generate a ``.safariextz`` file (signed by your certificate) that you can use to install RES.
