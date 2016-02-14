# Firesale

A tutorial on building a Markdown renderer in Electron.
[Here](https://vimeo.com/155240396) is a video walkthrough.

## Getting Started and Acclimated

Clone this repository and install the dependencies using `npm install`.

We'll be working with four files for the duration of this tutorial:

- `lib/main.js`, which will contain code for the main process
- `lib/renderer.js`, which will code for the renderer process
- `lib/index.html`, which will contain the HTML for the user interface
- `lib/style.css`, which will contain the CSS to style the user interface

In a more robust application, you might break stuff into smaller files, but we're not going to for the sake of simplicity.

## Hello World

Now that we have our dependencies and some basic files. Let's get our Electron application to the point where we can launch it.

Everything in Electron lives inside of the `electron` library. Let's start by requiring it inside of `main.js`.

```js
const electron = require('electron');
```

Electron contains many [modules][] that we'll use for building our application. The first—and arguably, most important—that we're going to need is the `app` module. All modules exist as properties on the `electron` object. We're going to be using the `app` module pretty often, so let's store it in its own variable.

[modules]: http://electron.atom.io/docs/v0.36.5/#modules-for-the-main-process

```js
const electron = require('electron');
const app = electron.app;
```

The [`app`][app] module has a number of life-cycle events. Here are a few examples:

[app]: http://electron.atom.io/docs/v0.36.5/api/app/

- `ready`
- `quit`
- `before-quit`
- `will-quit`
- `window-all-closed`

Right now, displaying a user interface when the application is `ready` is our primary concern. So, we'll listen for the `ready` event.

```js
const electron = require('electron');
const app = electron.app;

app.on('ready', function () {
  console.log('The application is ready.');
});
```

There isn't much to look at yet, but if we run `electron .`, you should notice the following.

1. Our message is logged to the console.
1. An Electron icon pops up in the Dock.

Hit `Control-C` to kill the application.

### Firing Up a Renderer Process

Now, that we can spin up our application, it's time to go ahead and build a user interface. In order to create a window for our application, we'll need to pull in the `BrowserWindow` module.

```js
const BrowserWindow = electron.BrowserWindow;
```

We'll create the main window for our application when the application is ready. That said, we need declare a variable to store our main window in the top level scope. This is due to the combination of two facts:

1. JavaScript has function scopes.
1. Our `ready` even listener is a function.

If we declared `mainWindow` variable in our event listener, it would be eligible for garbage collection as soon as that function is done executing, which is bad news.

To avoid this, we'll update `main.js` as follows:

```js
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

var mainWindow = null;

app.on('ready', function () {
  console.log('The application is ready.');

  mainWindow = new BrowserWindow();

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});
```

If the user ever closes the window, we'll set the `mainWindow` back to `null`.

Let's take our application for a spin again by running `electron .` from the command line. You should see something resembling the image below.

![Blank Window](images/01-blank-window.png)

Let's actually load some content, shall we?

```js
app.on('ready', function () {
  console.log('The application is ready.');

  mainWindow = new BrowserWindow();

  mainWindow.loadURL('file://' + __dirname + '/index.html');

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});
```

![Hello World](images/02-hello-world.png)

## Opening a File

One of the big motivations for building an Electron application is the promise of being able to do stuff we wouldn't normally be able to do in the browser. Prime examples of this are activating native OS dialogs and accessing the filesystem.

Actions like accessing the filesystem and calling native dialogs and menus are best handled by the main process. That said, we're eventually going to need to display the results in our renderer process as well as add buttons to our user interface for initiating the process of opening a file.

Let's start by adding some elements to the user interface for displaying our content once it's loaded.

In `index.html`, replace the body with the following:

```html
<section class="controls">
  <button id="open-file">Open File</button>
  <button id="copy-html">Copy HTML</button>
  <button id="save-file">Save HTML</button>
</section>

<section class="content">
  <textarea class="raw-markdown"></textarea>
  <div class="rendered-html"></div>
</section>
```

We'll start by prompting the user for a file to open when the application is ready. In order to make this happen, we'll need Electron's `dialog` module. Add the following to `main.js` just below where we require our other Electron modules.

```js
const dialog = electron.dialog;
```

We're going to want to reuse this functionality, so we'll break it out into its own function.

```js
const openFile = function () {
  var files = dialog.showOpenDialog(mainWindow, {
    properties: ['openFile']
  });

  if (!files) { return; }

  console.log(files);
};
```

We'll call this function immediately when the application is ready for now. If the user cancels the file open dialog, `files` will be `undefined`. If that happens, we're return early so that we don't get any errors down the line.

```js
app.on('ready', function () {
  console.log('The application is ready.');

  mainWindow = new BrowserWindow();

  mainWindow.loadURL('file://' + __dirname + '/index.html');

  openFile();

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});
```

Right now, we just log the name of the files selected to the console when we open a file. Try it out. You should notice the following that it's logging an array to the console. In theory, we're only going to want to open one file at a time in our application. So, we'll just grab the first file from the array.

```js
const openFile = function () {
  var files = dialog.showOpenDialog(mainWindow, {
    properties: ['openFile']
  });

  if (!files) { return; }

  var file = files[0];

  console.log(file);
};
```

Now, that we have the location of our file, let's read from that location. `fs.readFileSync` returns a `Buffer` object. We know we're working with text. So, we'll turn that into a string using the `toString()` method.

Make sure you require the `fs` module towards the beginning of `main.js`:

```js
const fs = require('fs');
```

We'll also update `openFile` as follows:

```js
const openFile = function () {
  var files = dialog.showOpenDialog(mainWindow, {
    properties: ['openFile']
  });

  if (!files) { return; }

  var file = files[0];
  var content = fs.readFileSync(file).toString();

  console.log(content);
};
```

Go ahead and open a text file. You should see the contents of the file logged to the console. With Electron, we can limit the type of files we're willing to open by adding filters to the dialog.

```js
var files = dialog.showOpenDialog(mainWindow, {
  properties: ['openFile'],
  filters: [
    { name: 'Markdown Files', extensions: ['md', 'markdown', 'txt'] }
  ]
});
```

You should now notice that images, PDFs and other assorted files that aren't text files are not available to be selected.

### Sending Content to the Renderer Process

So, we can load files and log them to the terminal. That's great, but it's nothing we couldn't do in Node, right? We need to send the content we've loaded to over to the render process.

Instead of logging to the console, let's send the content to the `mainWindow`. Replace the `console.log` in `openFile` with the following:

```js
mainWindow.webContents.send('file-opened', content);
```

## Writing Renderer Code

All of the code we've written so far has been in the main process. Now, it's time to write some code in the renderer process to—umm—render our content. Let's load up `renderer.js` by adding the following to `index.html`.

```html
<script>
  require('./renderer');
</script>
```

It's going to be helpful to have access to the Chrome Developer Tools in our renderer process. Let's have Electron pull those up when our browser window loads.

```js
app.on('ready', function () {
  // More code above…

  mainWindow.webContents.openDevTools();

  // More code below…
});
```

The main process and our renderer process are completely separate. In order to facilitate communication between the two, we need to use Electron's interprocess communication (IPC) protocol. In `renderer.js`, we'll require Electron and the `ipcRenderer` module.

```js
const electron = require('electron');
const ipc = electron.ipcRenderer;
```

When we load a file, the main process is sending our renderer process a message with the contents over the `file-opened` channel. (This channel name is completely arbitrary could very well be `sandwich`.) Let's set up a listener.

```js
ipc.on('file-opened', function (event, content) {
  console.log(content);
});
```

You should now see the contents of the file you opened in the console of your renderer process.

### Displaying Content on the Page

We'll use jQuery in our renderer process to make things a little more concise. Let's require it in our renderer process as follows:

```js
const $ = require('jquery');
```

We'll also be a little proactive and cache selectors for our markdown view, rendered HTML view, and buttons.

```js
const $markdownView = $('.raw-markdown');
const $htmlView = $('.rendered-html');
const $openFileButton = $('#open-file');
const $saveFileButton = $('#save-file');
const $copyHtmlButton = $('#copy-html');
```

When the renderer process gets a message on the `file-opened` channel from the main process, we'll display those contents in the `$markdownView` element.

```js
ipc.on('file-opened', function (event, content) {
  $markdownView.text(content);
});
```

Next, we'll want to take that content, convert it to HTML, and display it in `$htmlView` element. In our `package.json`, we included the [marked][] library to take care of the conversion for us. That said, we need to require it in `renderer.js`.

[marked]: https://github.com/chjj/marked

```js
const marked = require('marked');
```

We'll probably want to convert Markdown to HTML in multiple places in our application, so let's do it in a function that we can reuse later if we need to. Add the following to `renderer.js`.

```js
function renderMarkdownToHtml(markdown) {
  var html = marked(markdown);
  $htmlView.html(html);
}
```

The first time we'll probably want to do this is when we load a Markdown file. Update your event listener as follows:

```js
ipc.on('file-opened', function (event, content) {
  $markdownView.text(content);
  renderMarkdownToHtml(content);
});
```

Open a file in the application and verify that it works.

### Updating the HTML When the Markdown Changes

Whenever the user enters a key in the Markdown view, we'll want to update the HTML view to reflect the current state of the Markdown view. Let's listen for the `keyup` event and reuse our `renderMarkdownToHtml` function.

```js
$markdownView.on('keyup', function () {
  var content = $(this).val();
  renderMarkdownToHtml(content);
});
```

## Wiring Up the Buttons

In our application, we have three buttons in the top bar:

1. Open File
2. Copy HTML
3. Save HTML

It's true that we already the ability to open a file from within our application—but only from the main process. Generally speaking, renderer processes should _not_ access native OS APIs like spawning file dialogs and whatnot.

So, we're out of luck, right? Not quite. It's true that we can't pull up a file dialog from a render process. But, we _can_ ask the main process to open one up on our behalf.

Electron comes with a `remote` module, which allows us to pull in functionality from other processes. Let's require the `remote` module in `renderer.js`.

```js
const remote = electron.remote;
```

Once we have the remote module, we can use it load up the main process.

```js
const mainProcess = remote.require('./main');
```

### Exporting Functionality

Requiring the main process is not enough. In Node, we need to be explicit about what functionality we're going to export from a module. As of right now, we haven't exported any functionality from `main.js`. We want access to that `openFile` function. So, let's go ahead and export that function in `main.js`.

```js
exports.openFile = openFile;
```

Our `openFile` function is now available on the `mainProcess` object in `renderer.js`.

```js
$openFileButton.on('click', () => {
  mainProcess.openFile();
});
```

When the "Open File" button is clicked, it will call the `openFile` function from the main process and display the file dialog.

It's not necessary, but we can remove the call `openFile()` when the application starts up now that we have a way to do it from inside the application.

## Working with the Clipboard

Now that we have the first button in place, we'll go ahead and get the second button working.

The second button is labelled "Copy HTML." When it's working it should take the rendered HTML output and write it to the clipboard. It shouldn't be surprising to you when I say that Electron has a `clipboard` module that makes it easy to work with the clipboard. Because it works with the OS's clipboard, we'll require it from the main process.

Let's require the `clipboard` module in `renderer.js`:

```js
const clipboard = remote.clipboard;
```

When the user clicks on the "Copy HTML" button, we'll go ahead and write the contents of the `$htmlView` element to the clipboard.

```js
$copyHtmlButton.on('click', () => {
  var html = $htmlView.html();
  clipboard.writeText(html);
});
```

That's all that's required.

## Saving Files

We don't have a mechanism for saving files just yet. As I'm sure you might have guessed, this kind of functionality belongs in the main process—and we'll need to trigger it from the renderer process.

```js
const saveFile = function (content) {
  var fileName = dialog.showSaveDialog(mainWindow, {
    title: 'Save HTML Output',
    defaultPath: app.getPath('documents'),
    filters: [
      { name: 'HTML Files', extensions: ['html'] }
    ]
  });

  if (!fileName) { return; }

  fs.writeFileSync(fileName, content);
};
```

We'll also want to export this functionality in `main.js`:

```js
exports.saveFile = saveFile;
```

Pulling up the save dialog in the renderer process is almost the same as pulling up the open dialog, with the twist that we'll want to send off the data that we'd like written to the file system.

```js
$saveFileButton.on('click', () => {
  var html = $htmlView.html();
  mainProcess.saveFile(html);
});
```

We've successfully implemented a first pass at saving files to the filesystem with Electron.

## Adding Menu Items

Having a button for opening and saving files is pretty neat, but it's not the pattern we're used to in desktop applications. Typically, desktop applications have a "File" menu "Open" and "Save" items. Up to this point, Electron has given us some sensible defaults for menu items. (Fire up your application and check out the menu bar if haven't already.)

Let's go and pull in Electron's `Menu` module.

```js
const Menu = electron.Menu;
```

Unfortunately, Electron's default menu is a "take it or leave it" affair. The moment that we want to add our own custom functionality to the menu, we must first invent the universe. Electron _does_ however give us the ability to create a simple data structure and have it build the menu from a template.

```js
var menu = Menu.buildFromTemplate(template);
```

Once we have a menu object, we can override the default menu that Electron gave us when the `app` fires it's `ready` event.

```js
app.on('ready', function () {
  var menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});
```

Now, this won't work because we don't have a `template` object just yet. Because we have to recreate all of the default functionality, it's going to get a little verbose. I encourage you to copy and paste what follows and we'll discuss it together.

```js
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open',
        accelerator: 'CmdOrCtrl+O',
        click() { openFile(); }
      },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
        click() { saveFile(); }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      },
    ]
  }
];

if (process.platform == 'darwin') {
  var name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide ' + name,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() { app.quit(); }
      },
    ]
  });
}
```

Welcome back! Let's take a closer look some of the moving pieces in the large chunk of code above. The template is an array of menu items. In this case, we have "File" and "Edit"—each with their own submenus. Under "File," we have two menu items: "Save" and "Open." When clicked, they fire `openFile` and `saveFile` respectively. We're also assigning each an "accelerator" (also know as a shortcut or hot key).

In the "Edit" menu, we have some of the familiar commands: undo, redo, copy, cut, paste, select all. We probably don't want to reinvent the wheel. It would be great if each would do their normal thing. Electron allows us to define their "role," which will trigger the native OS behavior.

```js
{
  label: 'Copy',
  accelerator: 'CmdOrCtrl+C',
  role: 'copy'
}
```

You might also notice that we're defining the accelerator as "CmdOrCtrl+C". Electron will make the right choice on our behalf when it compiles for OS X, Windows, and/or Linux.

Application for OS X have an additional menu with the application's name and some common OS-specific menu items. We only want to add this menu if our Electron application is running in OS X.

```js
if (process.platform == 'darwin') { … }
```

[Darwin][] is the UNIX foundation that OS X is built on. The `process.platform` is baked into Node and returns 'darwin', 'freebsd', 'linux', 'sunos' or 'win32' depending on the platform it's being run from.

[Darwin]: https://en.wikipedia.org/wiki/Darwin_(operating_system)

We'll use `unshift` to push it onto the front of the array. OS X will stubbornly continue to use "Electron" as the application title. In order to override this, we'll have to adjust the `plist` file that Electron generates when it builds the file. This is the same process we'll use for a custom application icon.

## Electron's `shell` Module

We have a little bit of a bug in our application. If we have a link in our Markdown file and we click it, it will load inside of application which kind of ruins the illusion that we're building a native application. Even worse: we don't have a back button. So, we can't return to our regularly-schedule application. Luckily, Electron's `shell` module allows us to access the OS's ability to open files as well as expose their location in the file system.

In `renderer.js`, let's bring in Electron's `shell` module:

```js
const shell = electron.shell;
```

Now, we'll listen for link clicks and ask them politely to open in a new window instead of stepping over our little application.

```js
$(document).on('click', 'a[href^="http"]', function (event) {
  event.preventDefault();
  shell.openExternal(this.href);
});
```

## Appending the the Recent Documents Menu

Operating systems keep a record of recent files. We want our application to hook into this functionality. Doing this is fairly, simple. In our `openFile` function, we'll add the following:

```js
app.addRecentDocument(file);
```

![Recent Documents](images/03-recent-documents.png)

As you can see, adding files to the list of recent documents is easy. What we haven't done is set up our application to open any of those files in the recent documents list when they're selected.

Whenever we select a file from the list of recent documents, `app` fires an `open-file` event. We can listen for this event, read the file, and then send it to the renderer process.

```js
app.on('open-file', function (event, file) {
  var content = fs.readFileSync(file).toString();
  mainWindow.webContents.send('file-opened', content);
});
```

## Displaying Notifications

Electron allows us to display hook into the a given operating system's notification API. Right now, our "Copy HTML" button works, but it does it silently. This isn't the best use case notifications, but's a good enough opportunity to take it for a spin.

Let's change the following event listener in `renderer.js`:

```js
$copyHtmlButton.on('click', () => {
  let html = $htmlView.html();
  clipboard.writeText(html);

  new Notification('Output Saved', {
    body: 'Your HTML has been saved to the clipboard.'
  });
});
```

Go ahead and take it for a spin. Hit the "Copy HTML" button and bask the glory of your brand-new notification.
