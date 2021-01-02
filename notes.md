# Notes

Developer notes on Morphmaster - completed features, todo roadmap, etc.

## TODO

✅ add component generation script

✅ redo component generation and index generation to include "routes" folder that should automatically add routes to the app. This will undo the need for index files in each component.

✅ add directives

❌ add console for running commands - only sort of half implemented with a "hello world" example. Not really necessary, but at least it's there.

✅ add markdown parsing

❓ ace editor

✅ refactor evoke script to add `// ! INSERT ! //` methods which will uncomment certain sections at build time! This will enable TRUE viewmodel intellisense!

✅ Implement a cleanup method for removing files in the build folder that do not match the source folder.

✅ There's some errors that occur when deleting files and folders from the source after generating and deleting components while the watcher is running... -- fixed by editing the evoke script

✅ Implemented automatic rewriting of the .app.json component map whenever the build script is run. Only rewrites the file when the structure actually changes.

✅ Fixed improper new file copying with the scriptoid class. Now the script will only write files that are actually newer or edited in some way or don't exist in the target directory.

❓ Keybinds??? Would be nice to have a page for all the custom keybind data, including globals, but that's probably for another type of project. Maybe for this one, the app will just load a basic set of keybinds that redo the way `ctrl+equals` and `ctrl+minus` work. Like, maybe this is all in a general "settings" page and that page would also include info on the main config.json file... probably just a "version 2.0" feature.

❓ I still have no idea why the elapsed time in the evoke script is sometimes negative.
