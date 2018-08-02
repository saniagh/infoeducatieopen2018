let changeColor = document.getElementById('changeColor');

chrome.storage.sync.get('color', function (data) {
  changeColor.style.backgroundColor = 'black';
  changeColor.setAttribute('value', 'black');
});

changeColor.onclick = function (element) {
  let color = element.target.value;
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.executeScript(
        tabs[0].id,
        { code: 'document.body.style.background = "' + color + '";' });
  });
};

function getUser() {

  let recoveryKey = document.getElementById('recoveryKeyInput').value;

  alert('button has been pressed');

  let port = chrome.extension.connect({
    name: 'Get User',
  });
  port.postMessage(recoveryKey);
  port.onMessage.addListener(function (msg) {
    alert(msg);
  });

  /*
   let port = chrome.extension.connect({
   name: 'Get User',
   });

   port.postMessage({
   message: 'getUser',
   recoveryKey: document.getElementById('recoveryKeyInput').value,
   });
   */
  /*
   const formData = `recoveryKey=${document.getElementById(
   'recoveryKeyInput').value}`;
   const xhr = new XMLHttpRequest();
   xhr.open('post', 'http://localhost/users/get-user', false);
   xhr.send(formData);
   */
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('recoveryKeyButton').
      addEventListener('click', getUser);
});

