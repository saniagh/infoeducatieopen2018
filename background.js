chrome.extension.onConnect.addListener(function (port) {
  let oldSites;
  port.onMessage.addListener(function (msg) {
    console.log(msg);

    const xhr = new XMLHttpRequest();
    xhr.open('get', `http://localhost/users/get-user?recoveryKey=${msg}`,
        false);
    xhr.send();

    if (xhr.status === 200) {
      chrome.storage.sync.set({ 'recoveryKey': msg }, function () {

      });

      chrome.storage.sync.get('recoveryKey', function (data) {

      });

      oldSites = JSON.parse(xhr.response);

      chrome.storage.sync.set({ 'sites': oldSites.sites },
          function () {

          });
    }

    port.postMessage(JSON.stringify(oldSites));
  });
});

let nowopen = [], first = true;

chrome.runtime.onInstalled.addListener(function () {
  const xhr = new XMLHttpRequest();
  xhr.open('get', 'http://localhost/users/generate-user', false);
  xhr.send();

  chrome.storage.sync.set(
      { 'recoveryKey': JSON.parse(xhr.response).recoveryKey },
      function () {
        if (xhr.response.recoveryKey)
          console.log(JSON.parse(xhr.response).recoveryKey);
      });
});

chrome.storage.sync.get('sites', function (items) {
  if (!items.sites) {
    chrome.storage.sync.set({ 'sites': [] }, function () {

    });
  }
});

function store(host, time) {
  let storage = [], found = false;

  //console.log('Last host name: ' + host);

  chrome.storage.sync.get('sites', function (items) {

    console.log(items.sites);

    storage = items.sites;
    for (let i = 0; i < storage.length; i++) {
      if (storage[i].host === host) {
        found = i;
        //console.log('Host found at index: ' + i);
      }
    }

    if (host !== 'newtab') {
      if (found !== false) {
        //console.log('FOUND');
        let i = found;
        storage[i].times = storage[i].times + 1;
        storage[i].milis = storage[i].milis + time;
        found = false;
        i = 0;
      } else {
        //console.log('PUSHED');
        storage.push({ host: host, times: 1, milis: time });
      }

      chrome.storage.sync.get('recoveryKey', function (items) {
        let recoveryKey = JSON.stringify(items.recoveryKey);
        recoveryKey = recoveryKey.replace(/['"]+/g, '');
        console.log(recoveryKey);
        const xhr = new XMLHttpRequest();
        xhr.open('post',
            `http://localhost/users/update-user?recoveryKey=${recoveryKey}&sites=${JSON.stringify(
                storage)}`,
            false);
        xhr.send();
      });

      chrome.storage.sync.set({ 'sites': storage }, function () {

      });
    }
  });
}

// gets the hostname
function extractHostname(url) {
  let hostname;
  if (url.indexOf('://') > -1) {
    hostname = url.split('/')[2];
  } else {
    hostname = url.split('/')[0];
  }

  hostname = hostname.split(':')[0];
  //console.log(hostname);
  return hostname;
}

function getByTab(id) {
  for (let i = 0; i < nowopen.length; i++) {
    if (nowopen[i].tab === id) {
      return i;
    }
  }

}

function getByHost(url) {
  for (let i = 0; i < nowopen.length; i++) {
    if (nowopen[i].host === url) {
      return i;
    }
  }
}

chrome.tabs.onCreated.addListener(function (tab) {
  //console.log(tab.url);
  nowopen.push({
    host: extractHostname(tab.url),
    opened: Date.now(),
    tab: tab.id,
    last: tab.url,
  });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (first === true) {
    //console.log(tab.url);
    first = false;
    nowopen.push({
      host: extractHostname(tab.url),
      opened: Date.now(),
      tab: tab.id,
      last: tab.url,
    });
  } else {
    if (changeInfo.url && extractHostname(nowopen[getByTab(tabId)].last) !==
        extractHostname(tab.url)) {

      let last = nowopen[getByTab(tabId)].last;
      nowopen.push({
        host: extractHostname(tab.url),
        opened: Date.now(),
        tab: tabId,
        last: tab.url,
      });
      let nowt = Date.now();
      store(nowopen[getByHost(extractHostname(last))].host,
          nowt - nowopen[getByHost(extractHostname(last))].opened);
      nowopen.splice(getByHost(extractHostname(last)), 1);
    }
  }
});
