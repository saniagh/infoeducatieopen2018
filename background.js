chrome.extension.onConnect.addListener(function (port) {
  console.log('Connected .....');
  port.onMessage.addListener(function (msg) {

    const xhr = new XMLHttpRequest();
    xhr.open('get', `http://localhost/users/get-user?recoveryKey=${msg}`,
        false);
    xhr.send();

    if (xhr.status === 200) {
      chrome.storage.sync.set({ 'recoveryKey': msg }, function () {

      });

      console.log(msg);

      chrome.storage.sync.get('recoveryKey', function (data) {
        console.log('DATA FROM STORAGE: ' + JSON.stringify(data.recoveryKey));
      });

    }

    port.postMessage(JSON.stringify(xhr.data.sites));
  });
});

nowopen = [], first = true;

chrome.runtime.onInstalled.addListener(function () {
  const xhr = new XMLHttpRequest();
  xhr.open('get', 'http://localhost/users/generate-user', false);
  xhr.send();
  const recoveryKey = xhr.response.recoveryKey;

  chrome.storage.sync.set({ 'recoveryKey': recoveryKey }, function () {

  });
});

chrome.storage.sync.get('sites', function (items) {
  if (!items.sites) {
    chrome.storage.sync.set({ 'sites': [] }, function () {

    });
  }
});

function getByHost(url) {
  for (let i = 0; i < nowopen.length; i++) {
    if (nowopen[i].host == url) {
      return i;
    }
  }
}

function store(host, time) {
  let storage = [], found = false;
  chrome.storage.sync.get('sites', function (items) {
    storage = items.sites;

    console.log(storage);

    for (let i = 0; i < storage.length; i++) {
      if (storage[i].host == host) {
        found = i;
      }
    }

    if (found != false) {
      let i = found;
      storage[i].times = storage[i].times + 1;
      storage[i].milis = storage[i].milis + time;
    } else {
      storage.push({ host: host, times: 1, milis: time });
    }

    chrome.storage.sync.get('recoveryKey', function (items) {
      let recoveryKey = JSON.stringify(items.recoveryKey);
      recoveryKey = recoveryKey.replace(/['"]+/g, '');
      const xhr = new XMLHttpRequest();
      xhr.open('post',
          `http://localhost/users/update-user?recoveryKey=${recoveryKey}&sites=${JSON.stringify(
              storage)}`, false);
      xhr.send();
    });

    chrome.storage.sync.set({ 'sites': storage }, function () {

    });
  });
}

function extractHostname(url) {
  let hostname;
  if (url.indexOf('://') > -1) {
    hostname = url.split('/')[2];
  } else {
    hostname = url.split('/')[0];
  }

  hostname = hostname.split(':')[0];
  return hostname;
}

function getByTab(id) {
  for (let i = 0; i < nowopen.length; i++) {
    if (nowopen[i].tab == id) {
      return i;
    }
  }

}

chrome.tabs.onCreated.addListener(function (tab) {
  nowopen.push({
    host: extractHostname(tab.url),
    opened: Date.now(),
    tab: tab.id,
    last: tab.url,
  });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (first) {
    first = false;
    nowopen.push({
      host: extractHostname(tab.url),
      opened: Date.now(),
      tab: tab.id,
      last: tab.url,
    });
  } else {
    if (changeInfo.url && extractHostname(nowopen[getByTab(tabId)].last) !=
        extractHostname(tab.url)) {
      last = nowopen[getByTab(tabId)].last;
      nowopen.push({
        host: extractHostname(tab.url),
        opened: Date.now(),
        tab: tabId,
        last: tab.url,
      });
      nowt = Date.now();
      store(nowopen[getByHost(extractHostname(last))].host,
          nowt - nowopen[getByHost(extractHostname(last))].opened);
      nowopen.splice(getByHost(extractHostname(last)), 1);
    }
  }
});
