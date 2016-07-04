const { remote, ipcRenderer } = require('electron');
const mainProcess = remote.require('./main.js');
const { showOpenFileDialog } = mainProcess;

const $ = require('jquery');
const marked = require('marked');

const $markdownView = $('.raw-markdown');
const $htmlView = $('.rendered-html');

function renderMarkdownToHtml(markdown) {
  const html = marked(markdown, { sanitize: true });
  $htmlView.html(html);
}

function announceFileChange(content) {
  ipcRenderer.send('file-change', content);
}

$markdownView.on('keyup', function () {
  const content = $(this).val();
  announceFileChange(content);
  renderMarkdownToHtml(content);
});

$('#open-file').on('click', function () { // A
  mainProcess.showOpenFileDialog();
});

ipcRenderer.on('contents-changed', function (event, file, content) {
  $markdownView.val(content);
  renderMarkdownToHtml(content);
});

$(document).on('dragover dragleave drop', function () {
  return false;
});

const getDraggedFile = (event) => event.dataTransfer.files[0];

const fileTypeIsSupported = (file) => {
  return ['text/plain', 'text/markdown'].includes(file.type);
};

$markdownView.on('dragover', function ({ event: originalEvent }) {
  const file = getDraggedFile(event);

  if (fileTypeIsSupported(file)) {
    $markdownView.addClass('drag-over');
  } else {
    $markdownView.addClass('drag-error');
  }
});

$markdownView.on('dragleave', function () {
  $markdownView.removeClass('drag-over')
               .removeClass('drag-error');
});

$markdownView.on('drop', ({ event: originalEvent }) => {
  const file = getDraggedFile(event);

  if (fileTypeIsSupported(file)) {
    ipcRenderer.send('file-drop', file.path);
  } else {
    alert('That file type is not supported');
  }

  $markdownView.removeClass('drag-over')
               .removeClass('drag-error');

  return false;
});
