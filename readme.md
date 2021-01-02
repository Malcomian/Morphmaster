# Morphmaster

A special framework for building electron applications with AngularJS and Bootstrap on Windows.

## Getting Started

The main feature of this framework is the inclusion of a few command-line utilities that can add some special functionality to your build environment and speed up production.

Here's the typical setup process: first, create a new folder with the name of the project that you want. Then, unzip the contents of this project to that folder. Then, run `npm run morph` to change some of the basic project information in `package.json`. Then you can start generating components based on the application structure that you need or carry on as normal in your development process.

The current project structure is set up in "build mode". You can either run `watch.js` with `npm run watch` or you can manually build the project after creating or editing files and directories inside of the `src` folder with `npm run build`. You can then start the app in another termainl with `npm start`, which runs `electron .`. See below for more details on the different scripts and setups available.

### Morph

The morph script is for changing the project name in `package.json` based upon the name of the folder that the project resides in. So, for example, when you start a new project, you can simply rename the root folder of the project and call it the name of your choice. Then, run the morph script to rename the package name in `package.json` to the name of the folder. There will be a prompt for renaming the product name, which is typically capitalized or different than the project name.

```bash
# run morph script
npm run morph
```

### Zip

The zip script is for archiving the current project. Everything within the root project folder will be put into a single zip file. The name of the file will be the project name followed by a timestamp and an optional note. The zip file is saved next to the root project folder. Requires 7zip.

```bash
npm run zip
```

### Update Version

The update-version script is for updating the package's version. Simple as can be. Updating to a minor version will reset the patch to zero, and updating to a major version will reset both the minor and patch versions to zero. You can also set the version manually.

```bash
# version 0.0.1
npm run update-version patch
# version 0.0.2
npm run update-version minor
# version 0.1.0
npm run update-version major
# version 1.0.0
npm run update-version set 0.0.1
# version 0.0.1
```

### Evoke

The evoke script is a command line interface utility that can either rewrite javascript files within a given folder or transpile a given folder to another location. It will look for special comment lines and either "comment in" or "comment out" those sections. The main idea is that this method allows for special imports between javascript files that wouldn't normally be able to import or export their code. This allows the developer a type of on-demand special intellisense. There are a couple of different ways to utilize this feature.

#### On/Off/Toggle

Folders can be manually turned on or off or even toggled. It is recommended to use the `toggle` option because if you run the on/off options they will continue to add or remove comments between any special comment sections. `package.json` will be rewritten each time with the `toggle` property set to `on` or `off` each time the toggle script is run.

By default, special comment sections that remove code (comment out) start with `// ! REMOVE ! //` and end with `// ! END-REMOVE ! //`, and sections that add code (comment in) start with `// ! INSERT ! //` and end with `// ! END-INSERT ! //` - all of which can be edited within the evoke.js script.

Anything between the lines of code that match the remove/insert comment strings will be commented in or out depending on which script was run (on/off/toggle). It's cool to use this to export the contents of an index javascript file (or a file that is included in your main html file) so that any scripts that run inside of that index file can then import the main index file's contents, which can help with intellisense support inside of your development environment. Likewise, the insert method can help with altering the way your intellisense works with things like function parameters - particularly in regards to the `$scope` and `$rootScope` services within Angular. Function parameters generally don't have an explicit type within javascipt - especially when it comes to Angular's dependency injection features. This means that one cannot normally see other methods that are attached to the `$scope` object inside of a controller function - which is pretty lame, to say the least. But, if you use the insert and remove methods, you can restore the basic object intellisense for these objects.

Example Javascript file `./src/components/_main/controllers/_main_controller.js`:

```javascript
module.exports = function ($scope, $rootScope) {
  // ! INSERT ! //
  // var vm = $scope // set vm equal to $scope when in production
  // var root = $rootScope // set root equal to $rootScope in production
  // ! END-INSERT ! //
  // ! REMOVE ! //
  var vm = {} // initialize scope object as a basic object in development
  var root = {} // initialize root scope object as a basic object in development
  // ! END-REMOVE ! //
  // ...
  // ! REMOVE ! //
  module.exports = root // rewrite the module exports to be the root scope object
  // ! END-REMOVE ! //
}
```

Note: Most commands have an alias saved in the `package.json` scripts section for easy access.

```bash
npm run toggle
# or
npm run evoke toggle "./src"
# or
npm run "./scripts/evoke.js" toggle "./src"
```

Running one of the commands above with the given example javascript file will generate the following:

```javascript
module.exports = function ($scope, $rootScope) {
  // ! INSERT ! //
  var vm = $scope // set vm equal to $scope when in production
  var root = $rootScope // set root equal to $rootScope in production
  // ! END-INSERT ! //
  // ! REMOVE ! //
  // var vm = {} // initialize scope object as a basic object in development
  // var root = {} // initialize root scope object as a basic object in development
  // ! END-REMOVE ! //
  // ...
  // ! REMOVE ! //
  // module.exports = root // rewrite the module exports to be the root scope object
  // ! END-REMOVE ! //
}
```

Using the above setup, the developer can easily see what is set on the $rootScope object (which is set up in the `_main_controller.js` file) from inside of any other controller file just by requiring it inside of a special comment section at the beginning of that controller file.

#### Build

Obviously, the app will naturally error out when you launch or reload it while certain comment sections are still turned on. Running the toggle script can be useful for enabling this sort of special intellisense for a moment, but it must be turned off again before you refresh or reload the app as it's running.

That's why I included the `build` command.

```bash
npm run build
# or
npm run evoke build "./src" "./build"
```

The build command will still scan the given source directory for javascript files that contain the special comment sections. It will then comment out those sections and output the exact same folder and file structure to the target directory (but will also only copy files that are newer in the source folder than the target build folder). All that needs to change is which html file `main.js` points to when it loads the app.

```javascript
// for "build mode"
win.loadFile(path.join(__dirname, './build/index.html'))
// for "manual mode"
win.loadFile(path.join(__dirname, './src/index.html'))
```

It may behoove the developer to manually exclude their target build folder from their IDE's file explorer and search menus. Otherwise you'll see the duplicate folder structure, and that's not something that needs to be edited.

Example: `.vscode/settings.json`

```json
{
  "files.exclude": {
    "**/build": true
  }
}
```

Note that after the build script is run, a cleanup function will remove any files or folders within the build directory that do not match the source.

#### Gen

The gen command creates AngularJS components based on some simple templates included in `./scripts/lib`. The given name will be used as the component's folder name and will also be used as the name for the base html template in its route file. The given URL will be used in the route file.

```bash
# Note that in bash, a single slash must be escaped as a double slash or else it returns a specific path string
# gen <name> <url>
npm run gen "home" //home
npm run gen "users" //users
npm run gen "user" //users/:user
```

Once complete, the evoke script will then remap the entire component structure and output it as a JSON file at `./src/models/.app.json`. This file is what the server file uses to register all the controllers, routes, filters, services, and directives when first creating the angular application. Some route files ought to be manually changed, as in the case of the `.otherwise` route condition. The current project includes a "404" route as an example.

The component structure should follow this outline:

```text
component_name/
  controllers/
    example_controller.js
  directives/
    example_directive.js
  filters/
    example_filter.js
  routes/
    example_route.js
  services/
    example_service.js
  views/
    pages/
      example_page.html
    templates/
      example_template.html
```

In evoke.js, the base appname (angular app name), root (root component name - usually must be loaded first), controller_postfix (extension string for controller files), and route_postfix (extension string for router files) variables can be edited to suit your own coding style. I like to use underscores instead of camelcase.

#### Add

The add command will add a file to the given component. Files included in certain folders will be given a certain template when passed the right options.

```bash
# add <component> <folder> <filename> [url]
# url is optional - only included when target folder is "routes"
# for example, adding a "/home" route file
npm run add _main routes home_route.js //home
# adds _main/routes/home_route.js with url "/home"
npm run add _main views/templates menu.html
# adds _main/views/templates/menu.html
```

After adding the file, the script will then run the remap method to reconstruct the `.app.json` file in the models folder.

#### Remap

The remap method remaps the current components folder structure and outputs it to `./src/models/.app.json` to be used in the main server file when creating the angular application.

```bash
npm run remap
```

Note that the remap method will not affect the watch command because dotfiles are ignored in the watch script. In other words, because the watch script will ignore dotfiles, the watch script won't trigger an infinite loop of writing and rewriting the same `.app.json` file whenever the file is changed.

### Watch

Watches the source folder using Chokidar and then automatically runs `npm run build` when a new file or folder is added or an existing file or folder is changed within the source folder. Dotfiles are ignored from the watch list, so when the project is rebuilt using the build command, the file `.app.json` will not trigger an infinite loop of rebuilding and remapping the project.

```bash
npm run watch
# equivalent to
node ./scripts/watch.js "./src"
```

---

## Models

The included models are used to help create some basic functionality for getting most types of projects up and running.

### file.js

The File class is used for easily loading, saving, and "yoinking" the contents of a json file to or from the file system.

**create(path, filename)** creates the file if one does not already exist in the target directory.
**save(path)** writes the file to the given path so long as its filename property exists. Most other methods will set the filename when run.
**load(path, filename)** loads the file and sets all similar properties (non-function properties that are shared by both files) and their values onto this object.
**yoink(path, filename)** "yoinks" the file by copying all the target file's properties and values onto this object.
**ensure(path, filename)** ensures the file exists at the target path.

### env.js

This model helps to load some special "environment" settings for the app. When the app launches, this model will scan the APPDATA folder and if a subfolder with the right project name doesn't exist, it will be created.

### config.js

This model helps create config.json files in the APPDATA subfolder that matches the name of your current project. It stores some basic application configuration info, like the last known x/y position, width/height, min with/min height, zoom level, and whether the app is maximized. There are a few ipcRenderer/ipcMain connections that coordinate the saving and loading of this configuration file. The app should remember the last state that it was in when it was closed and when it is loaded again, it will launch in exactly the same place with exactly the same size and location parameters. The object that contains this model is passed to the renderer and is attached to the global object in main.js.

### md.js

This file exports a simple object that is useful for reading and rendering markdown files within the project. See the "about" component for a working example that renders this same readme file as html.

### server.js

This model looks at `.app.json`, which should've been generated by the evoke remap command, and then assigns all AngularJS controllers, routes, services, filters, and directives as per the given component folder structure.

### sortable.js

This file contains a very handy function that, when given a css selector for a search input and a table, will add search filtering and row sorting functionality to the given table. This is a simple client-based algo - it only works on a table that is completely displayed and doesn't integrate with AngularJS at all, but it's perfect for any project. Requires jQuery.

---

## Project Structure

```text
project_name/               root project folder
  .vscode/                  vscode settings folder
    settings.json           removes build folder from search and explorer
  node_modules/             node modules folder
  resources/                resources for building installer
    icon.ico                app icon
    installerSidebar.bmp    installer sidebar graphic
  scripts/                  npm scripts folder
  src/                      main source folder
    components/             components folder
    css/                    css folder contains source and compiled scss
    img/                    images
    models/                 javascript models and app info
    index.html              main index html file
    index.js                main renderer index javascript file
  main.js                   main application file - sets up the main process
  notes.md                  development notes
  package-lock.json         idk what package-lock does and I'm afraid to ask
  package.json              npm package file
  readme.md                 readme markdown file
```

---

## Notable Features

The following are some notable features implemented in the current base project.

**Config:** The x/y location, width/height, and URL of the last open window are saved in a config.json file within the user's `AppData/<appname>` folder. Reopening the app will open a window with this last known configuration.

**New Window:** Any link in the app can open the same app in a new window. `ctrl + left click`, `shift + left click`, and `middle mouse click` can open a new instance of the app at the link's target location. Any link that starts with "http" will open the user's default internet browser at the link's target location.

**Uniform Resource Locator:** The app allows spaces in the url of the location bar and escapes the root `#!` url prefix. Check `_main_controller.js` to see how some basic location bar functionality was added. Note that any double spaces will be changed to single spaces. This is kind of a neat feature for the purpose of using special URL strings that can represent filenames as route params, although not all types of characters are escaped - just single spaces. Be wary of the naming conventions used for components - I'd recommend only using lowercase and spaces and dashes in component names and any filenames that may be used in the URL.

**Angular-VS-Repeat:** A cool package that can change the way repeated elements are displayed within an AngularJS app. It will dramatically decrease load times and search/filtering speeds for very large data sets (like 1,000+ items in a single table). See the [official documentation](https://github.com/kamilkp/angular-vs-repeat) for more details on how to use it. (and yes, the demo page is broken for some reason, but the script actually works)

**Angular Animate:** The AngularJS animation library helps with adding special animations to certain elements when they are loaded or unloaded from the viewmodel.

**Brace:** An ES Module style implementation of Cloud 9's Ace Editor. Extremely useful for displaying and editing any sorts of files within any app.

---

## Packages

The following is a list of packages used in this project.

### Dependencies

* **[@mdi/font](https://www.npmjs.com/package/@mdi/font):** Material design icons font - a great icon library that's easy to use and doesn't require a subsciption.
* **[angular](https://angularjs.org/):** AngularJS 1.X - the base client-side framework for this app.
* **[angular-animate](https://docs.angularjs.org/api/ngAnimate):** Animation library for AngularJS.
* **[angular-route](https://docs.angularjs.org/api/ngRoute):** Routing library for AngularJS.
* **[angular-sanitize](https://docs.angularjs.org/api/ngSanitize):** A library for AngularJS that sanitizes code for usage in certain cases, such as manual interpolation. Can help display outside resources such as embedded youtube videos.
* **[angular-touch](https://docs.angularjs.org/api/ngTouch):** Compatibility library for touch controls.
* **[angular-vs-repeat](https://github.com/kamilkp/angular-vs-repeat):** A virtual repeater for displaying large data sets.
* **[bootstrap](https://getbootstrap.com/):** The base CSS framework, imported into the main `style.scss` file. The Bootstrap javascript library is loaded manually in the main renderer index file.
* **[brace](https://www.npmjs.com/package/brace):** A CommonJS Module style implementation of the Cloud 9 Ace editor.
* **[chokidar](https://www.npmjs.com/package/chokidar):** Watches the `./src` directory for changes to automatically run the build script.
* **[commander](https://www.npmjs.com/package/commander):** A module for creating command line applications. Required for `evoke.js` commands.
* **[fs-extra](https://www.npmjs.com/package/fs-extra):** A drop-in replacement for the node's native fs module. Required for most of the models used in this project.
* **[highlight.js](https://www.npmjs.com/package/highlight.js):** A library for adding syntax highlighting to rendered markdown files.
* **[jquery](https://jquery.com/):** I'd be equally surprised and impressed if you haven't heard of it. Required for AngularJS apps.
* **[js-beautify](https://beautifier.io/):** A library to beautify javascripts. Required for `evoke.js`.
* **[markdown-it](https://www.npmjs.com/package/markdown-it):** A library for rendering markdown files as HTML.
* **[klaw-sync](https://www.npmjs.com/package/klaw-sync):** A utility for recursively scanning directories. Required for `evoke.js`.
* **[mousetrap](https://www.npmjs.com/package/mousetrap):** A library for rebinding hotkeys. Includes options for "global" keybinds that work even when the user is focused inside of text inputs.
* **[popper.js](https://www.npmjs.com/package/popper.js):** Required for Bootstrap's javascript library. Enables tooltips.

### Dev Dependencies

* **[electron](https://www.electronjs.org/):** This is an electron app, after all.
* **[electron-builder](https://www.electron.build/):** The flavor of electron builder I chose. The build options are specified within `package.json`. Currently set to build a simple NSIS-based installer executable for windows.
