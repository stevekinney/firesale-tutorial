const electron = require('electron');
const remote = electron.remote;
const mainProcess = remote.require('./main.js');
const openFile = mainProcess.openFile;
const ipcRenderer = electron.ipcRenderer;

const $ = require('jquery');
const marked = require('marked');

const $markdownView = $('.raw-markdown');
const $htmlView = $('.rendered-html');

function renderMarkdownToHtml(markdown) {
  var html = marked(markdown, { sanitize: true });
  $htmlView.html(html);
}

$markdownView.on('keyup', function () {
  var content = $(this).val();
  renderMarkdownToHtml(content);
});

$('#open-file').on('click', function () { // A
  mainProcess.openFile();
});

ipcRenderer.on('file-opened', function (event, file, content) {
  $markdownView.text(content);
  renderMarkdownToHtml(content);
});
