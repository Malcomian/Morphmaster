# Morphmaster

A simple starter boilerplate application for building electron applications with AngularJS and Bootstrap on Windows.

Morphmaster also exists as a web application framework. Check out the [github page](https://github.com/Malcomian/Morphmaster-Web) for more details.

## Getting Started

The main feature of this framework is the inclusion of a few command-line utilities that can add some special functionality to your build environment and speed up production.

Here's the typical setup process: first, create a new folder with the name of the project that you want. Then, unzip the contents of this project to that folder and run `npm install` to download all the node modules used in this project. Then, run `npm run morph` to change some of the basic project information in `package.json`. Then you can start generating components based on the application structure that you need or carry on as normal in your development process.

The current project structure makes liberal usage of a unique transpiling script, [abjure](https://www.npmjs.com/package/abjure). Abjure gives the developer a special sort of on-demand intellisense inside of javascript files that helps reveal the contents of other javascript files without affecting the final build. Run `npm run watch` to run [chokidar-cli](https://www.npmjs.com/package/chokidar-cli) on the `src` folder - whenever a file is created, updated, or destroyed in the `src` folder, the build script will be invoked and the project will rebuild. See the [project page](https://www.npmjs.com/package/abjure) for abjure for more details on how it works.

### Morph

The morph script is for changing the project name in `package.json` based upon the name of the folder that the project resides in. So, for example, when you start a new project, you can simply rename the root folder of the project and call it the name of your choice. Then, run the morph script to rename the package name in `package.json` to the name of the folder. There will be a prompt for renaming the product name, which is typically capitalized or different than the project name.

```bash
# run morph script
npm run morph
```

### Zip

The zip script is for archiving the current project using a simple zip cli utility, [zipadeedoodah](https://www.npmjs.com/package/zipadeedoodah). Everything except the `node_modules`, `dist`, `build` and `.git` folders within the root project folder will be put into a single zip file. The name of the resulting zip file will be the project name followed by a timestamp and an optional note, which the script will prompt the user for. The zip file is saved next to the root project folder. This is useful for making snapshots of the project without pushing anything to github.

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

The evoke script is a command line interface utility that handles the generation of angular components within the project. It has three main commands - `gen`, `add`, and `remap`.

#### Gen

The gen command creates AngularJS components based on some simple templates included in `./scripts/lib`. The given name will be used as the component's folder name and will also be used as the name for the base html template in its route file. The given URL will be used in the route file.

```bash
# Note that in bash, a single slash must be escaped as a double slash or else it returns a specific path string
# ... that is, unless there's another slash in the string
# gen <name> <url>
npm run gen "home" //home
npm run gen "users" //users
npm run gen "user" /users/:user
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

In evoke.js, the base appname (angular app name), root (root component name - usually must be loaded first), controller_postfix (extension string for controller files), and route_postfix (extension string for router files) variables can be edited to suit your own coding style. I like to use snake case (underscores) instead of camelcase.

#### Add

The add command will add a file to a given component. Files included in certain folders will be given a certain template when passed the right options.

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

The file `.app.json` is ignored by the watch script (otherwise, changing it would trigger a rebuild loop with abjure), and isn't meant to be edited directly.

### Watch

Watches the source folder using Chokidar and then automatically runs `npm run build` when a new file or folder is added or an existing file or folder is changed within the source folder. Any `.app.json` file is ignored in this watch list.

```bash
npm run watch
```

### Sass

Runs a sass watcher/compiler for the main style.scss file.

```bash
npm run sass
```

---

## Models

The included models are used to help create some basic functionality for getting most types of projects up and running.

### .app.json

This file is automatically generated by the evoke script, and can be manually generated with the command `npm run remap`. It represents the given component structure of the application and is used by the `server.js` model to load all the angular components when the application loads.

### file.js

The File class is used for easily loading, saving, and "copying" the contents of a json file to or from the file system.

**create(path, filename)** creates the file if one does not already exist in the target directory.
**save(path)** writes the file to the given path so long as its filename property exists. Most other methods will set the filename when run.
**load(path, filename)** loads the file and sets all similar properties (non-function properties that are shared by both files) and their values onto this object.
**copy(path, filename)** "copies" the file by copying all the target file's properties and values onto this object.
**ensure(path, filename)** ensures the file exists at the target path.

### finder.js

This is the custom finder tool - pressing `ctrl+f` will open the finder box, which is a kind of "search in page" tool within the app. It's attached to the root scope object in the main controller of the application.

### keybinds.js

This model is a sort of wrapper for [Mousetrap](https://www.npmjs.com/package/mousetrap), which helps bind keyboard combos to actions within the application.

### config.js

This model helps create config.json files in the APPDATA subfolder that matches the name of your current project. It stores some basic application configuration info, like the last known x/y position, width/height, min with/min height, zoom level, and whether the app is maximized. There are a few ipcRenderer/ipcMain connections that coordinate the saving and loading of this configuration file. The app should remember the last state that it was in when it was closed and when it is loaded again, it will launch in exactly the same place with exactly the same size and location parameters.

### md.js

This file exports a simple object that is useful for reading and rendering markdown files within the project. See the "about" component for a working example that renders this same readme file as html.

### server.js

This model looks at `.app.json`, which should've been generated by the evoke remap command, and then assigns all AngularJS controllers, routes, services, filters, and directives as per the given component folder structure.

### sortable.js

This file contains a very handy function that, when given a css selector for a search input and a table, will add search filtering and row sorting functionality to the given table. This is a simple client-based algorithm - it only works on a table that is completely displayed and it doesn't integrate with AngularJS at all, but it's perfect for any basic project. Requires jQuery.

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

**Uniform Resource Locator:** The app allows spaces in the URL of the location bar and omits the root `#!` URL prefix. This functionality is implemented with the native javascript encodeURI and decodeURI functions. This is kind of a neat feature for the purpose of using special URL strings that can represent filenames as route params without having all the ugly URI escape characters that come along with it.

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
* **[highlight.js](https://www.npmjs.com/package/highlight.js):** A library for adding syntax highlighting to rendered markdown files.
* **[jquery](https://jquery.com/):** I'd be equally surprised and impressed if you haven't heard of it. Required for AngularJS apps.
* **[markdown-it](https://www.npmjs.com/package/markdown-it):** A library for rendering markdown files as HTML.
* **[markdown-it-attrs](https://www.npmjs.com/package/markdown-it-attrs):** A plugin for markdown-it that alters element attributes.
* **[mousetrap](https://www.npmjs.com/package/mousetrap):** A library for rebinding hotkeys. Includes options for "global" keybinds that work even when the user is focused inside of text inputs.
* **[popper.js](https://www.npmjs.com/package/popper.js):** Required for Bootstrap's javascript library. Enables tooltips.

### Dev Dependencies

* **[abjure](https://www.npmjs.com/package/abjure):** A command line interface utility that enables a special sort of intellisense by transpiling javascript files that contain certain patterns that "comment in" or "comment out" sections of code.
* **[chokidar-cli](https://www.npmjs.com/package/chokidar-cli):** Watches the `./src` directory for changes to automatically run the build script.
* **[commander](https://www.npmjs.com/package/commander):** A module for creating command line applications. Required for `evoke.js` commands.
* **[electron](https://www.electronjs.org/):** This is an electron app, after all.
* **[electron-builder](https://www.electron.build/):** The flavor of electron builder I chose. The build options are specified within `package.json`. Currently set to build a simple NSIS-based installer executable for windows.
* **[fs-extra](https://www.npmjs.com/package/fs-extra):** A drop-in replacement for the node's native fs module. Required for most of the models used in this project.
* **[zipadeedoodah](https://www.npmjs.com/package/zipadeedoodah):** A simple CLI zip utility based on glob patterns with minimal setup.
