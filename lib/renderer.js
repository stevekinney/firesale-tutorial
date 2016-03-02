'use strict';

const $ = require('jquery');
const marked = require('marked');
const electron = require('electron');
const ipc = electron.ipcRenderer;
const shell = electron.shell;

const remote = electron.remote;
const mainProcess = remote.require('./main');

const clipboard = remote.clipboard;

var currentFile = null;

const $markdownView = $('.raw-markdown');
const $htmlView = $('.rendered-html');
const $openFileButton = $('#open-file');
const $saveFileButton = $('#save-file');
const $copyHtmlButton = $('#copy-html');
const $showInFileSystemButton = $('#show-in-file-system');
const $openInDefaultEditorButton = $('#open-in-default-editor');

ipc.on('file-opened', function (event, file, content) {
  currentFile = file;

  $showInFileSystemButton.attr('disabled', false);
  $openInDefaultEditorButton.attr('disabled', false);

  $('.raw-markdown').text(content);
  renderMarkdownToHtml(content);
});

function renderMarkdownToHtml(markdown) {
  var html = marked(markdown);
  $htmlView.html(html);
}

$markdownView.on('keyup', function () {
  var content = $(this).val();
  renderMarkdownToHtml(content);
});

$openFileButton.on('click', () => {
  mainProcess.openFile();
});

$saveFileButton.on('click', () => {
  let html = $htmlView.html();
  mainProcess.saveFile(html);
});

$copyHtmlButton.on('click', () => {
  let html = $htmlView.html();
  clipboard.writeText(html);

  new Notification('Output Saved', {
    body: 'Your HTML has been saved to the clipboard.'
  });
});

$showInFileSystemButton.on('click', () => {
  shell.showItemInFolder(currentFile);
});

$openInDefaultEditorButton.on('click', () => {
  shell.openItem(currentFile);
});

$(document).on('click', 'a[href^="http"]', function (event) {
  event.preventDefault();
  shell.openExternal(this.href);
});
