const fs = require('fs');
const es = require('event-stream');

const { dialog } = require('electron').remote;

let result = [];
let filePath;
let fileName;
let readerStream;
let numberCount = 8;

function start() {
  result = [];
  document.getElementById('message').innerHTML = 'Подождите...';

  const lessNumber = document.getElementById('lessNumber').checked;
  const duplicate = document.getElementById('Duplicate').checked;

  const totalLines = fs.readFileSync(filePath)
    .toString()
    .split('\n').length;
  let currentLine = 1;
  readerStream = fs.createReadStream(filePath);
  readerStream.pipe(es.split())
    .pipe(
      es
        .mapSync(function (line) {
          document.getElementById('message2').innerHTML = `Обработано ${currentLine} из ${totalLines} строк`;

          if (lessNumber && line.length >= numberCount) {
            toResult(line);
          }
          if (!lessNumber) {
            toResult(line);
          }
          currentLine++;
        }))
    .on('error', function (err) {
      document.getElementById('message').innerHTML = 'Ошибка чтения файла' + err;
    })
    .on('end', function () {
      document.getElementById('message').innerHTML = 'Готово!';
      document.getElementById('save').style.visibility = 'visible';

      if (duplicate) {
        document.getElementById('message').innerHTML = 'Почти готово, удаляем дубликаты';
        const noDuplicateArr = [...new Set(result)];
        document.getElementById('message').innerHTML = `Готово! Строк удалено: ${result.length - noDuplicateArr.length}`;
        result = noDuplicateArr;
      }
    });
}

function toResult(line) {
  result.push(getTranslate(line) + '\r\n');
}

function getTranslate(str) {
  const keys = {
    'а': 'f', 'б': ',', 'в': 'd', 'г': 'u', 'д': 'l',
    'е': 't', 'ё': '\`', 'ж': ';', 'з': 'p', 'и': 'b',
    'к': 'r', 'л': 'k', 'м': 'v', 'н': 'y', 'о': 'j',
    'п': 'g', 'р': 'h', 'с': 'c', 'т': 'n', 'у': 'e',
    'ф': 'a', 'х': '[', 'ц': 'w', 'ч': 'x', 'ш': 'i',
    'ь': 'm', 'ы': 's', 'э': '\'', 'ю': '.', 'я': 'z',
    'щ': 'o', 'ъ': ']', 'й': 'q',

    'А': 'F', 'Б': '<', 'В': 'D', 'Г': 'U', 'Д': 'L',
    'Е': 'T', 'Ё': '~', 'Ж': ':', 'З': 'P', 'И': 'B',
    'К': 'R', 'Л': 'K', 'М': 'V', 'Н': 'Y', 'О': 'J',
    'П': 'G', 'Р': 'H', 'С': 'C', 'Т': 'N', 'У': 'E',
    'Ф': 'A', 'Х': '{', 'Ц': 'W', 'Ч': 'X', 'Ш': 'I',
    'Ь': '<', 'Ы': 'S', 'Э': '\"', 'Ю': '>', 'Я': 'Z',
    'Щ': 'O', 'Ъ': '}', 'Й': 'Q',
  };
  return str.split('')
    .map(char => typeof keys[char] === 'undefined' ? char : keys[char])
    .join('');
}

function save() {
  fileName = fileName.split('.txt')[0];

  dialog.showSaveDialog({
    filters: [{
      name: 'text',
      extensions: ['txt']
    }]
  })
    .then(dial => {
      fs.writeFile(`${dial.filePath}`, result.join(''), function (err) {
        if (err) {
          if (err.toString()
            .indexOf('no such file or directory') === -1) {
            return document.getElementById('message').innerHTML = 'Произошла ошибка при сохранении файла!';
          }
        }
        if (!dial.canceled) {
          document.getElementById('message').innerHTML = 'Файл успешно сохранен!';
          document.getElementById('message2').innerHTML = '';
        }
      });
    });
}

function browse() {
  document.getElementById('save').style.visibility = 'hidden';

  dialog.showOpenDialog({
    properties: ['openFile'], filters: [{
      name: 'text',
      extensions: ['txt']
    }]
  })
    .then(result => {
      const dialogCanceled = result.canceled;
      if (!dialogCanceled) {
        const filePatchSplit = result.filePaths[0].split('\\');

        filePath = result.filePaths[0];
        fileName = filePatchSplit[filePatchSplit.length - 1];

        document.getElementById('start').style.visibility = 'visible';
        document.getElementById('fileLabel').innerHTML = 'Файл: ';
        document.getElementById('fileName').innerHTML = filePath;
      } else {
        readerStream = null;
        filePath = null;
        fileName = null;
        result = [];

        document.getElementById('start').style.visibility = 'hidden';
        document.getElementById('save').style.visibility = 'hidden';

        document.getElementById('message').innerHTML = '';
        document.getElementById('message2').innerHTML = '';
        document.getElementById('fileLabel').innerHTML = '';
        document.getElementById('fileName').innerHTML = '';
      }
    })
    .catch(err => {
      console.log(err);
    });
}
