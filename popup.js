const address = 'http://localhost/';

window.onload = function () {
  let recoveryKey;

  chrome.storage.sync.get('recoveryKey', function (items) {
    recoveryKey = items.recoveryKey;
    if (recoveryKey) {

      document.getElementById('disabledRecoveryKey').value = recoveryKey;

      recoveryKey = recoveryKey.replace(/['"]+/g, '');

      let port = chrome.extension.connect({
        name: 'Get User',
      });
      port.postMessage(recoveryKey);
      port.onMessage.addListener(function (msg) {
        let sites = JSON.parse(msg);

        sites.sites.sort(function (a, b) {
          let key1 = a.milis;
          let key2 = b.milis;

          if (key1 < key2)
            return 1;
          else if (key1 === key2)
            return 0;
          else return -1;
        });

        for (let i = 1; i <= 5; i++) {
          if (sites.sites[i - 1])
            document.getElementById(
                `list-item-left-${i}`).innerHTML = sites.sites[i -
            1].host;

          document.getElementById(
              `list-item-right-${i}`).innerHTML = millisToMinutesAndSeconds(
              sites.sites[i - 1].milis);
        }
      });
    }
  });
};

function redirectUser() {
  let recoveryKey;
  chrome.storage.sync.get('recoveryKey', function (items) {
    recoveryKey = items.recoveryKey;
    if (recoveryKey)
      window.open(`${address}${recoveryKey}`);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('statistics').addEventListener('click', redirectUser);
});

function deleteUser() {
  let recoveryKey;
  chrome.storage.sync.get('recoveryKey', function (items) {
    recoveryKey = items.recoveryKey;
    if (recoveryKey)
      window.open(`${address}delete/${recoveryKey}`);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('deleteButton').addEventListener('click',deleteUser)
});

function millisToMinutesAndSeconds(millis) {
  let minutes = Math.floor(millis / 60000);
  let seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

function getUser() {

  let recoveryKey = document.getElementById('recoveryKeyInput').value;

  let port = chrome.extension.connect({
    name: 'Get User',
  });
  port.postMessage(recoveryKey);
  port.onMessage.addListener(function (msg) {
    let sites = JSON.parse(msg);

    sites.sites.sort(function (a, b) {
      let key1 = a.milis;
      let key2 = b.milis;

      if (key1 < key2)
        return 1;
      else if (key1 === key2)
        return 0;
      else return -1;
    });

    for (let i = 1; i <= 5; i++) {
      if (sites.sites[i - 1])
        document.getElementById(
            `list-item-left-${i}`).innerHTML = sites.sites[i -
        1].host;

      //let time = convertMS(sites.sites[i - 1].milis);

      document.getElementById(
          `list-item-right-${i}`).innerHTML = millisToMinutesAndSeconds(
          sites.sites[i - 1].milis);
    }

  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('recoveryKeyButton').
      addEventListener('click', getUser);
});

