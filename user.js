// ==UserScript==
// @name        Bulk open VNDB
// @include     *
// @version     0.1
// @grant       GM_openInTab
// @run-at      document-idle
// ==/UserScript==

function addButton(text, onclick, cssObj) {
  const button = document.createElement('button');
  const btnStyle = button.style;
  document.body.appendChild(button);
  button.innerHTML = text;
  button.onclick = onclick;
  btnStyle.position = 'absolute';
  // eslint-disable-next-line no-return-assign
  Object.keys(cssObj).forEach((key) => btnStyle[key] = cssObj[key]);
  return button;
}

function stuff() {
  const openVNDB = true;
  const openEGS = true;

  let page = null; // 0: VN, 1: Char
  if (document.location.pathname === '/v') {
    page = 0;
  } else if
  (document.location.pathname === '/c') {
    page = 1;
  }

  let selection = '';
  if (page === 0) {
    selection = '.mainbox.vngrid';
  } else if
  (page === 1) {
    selection = '.mainbox.charbgrid';
  }

  const { children } = document.querySelector(selection);

  // eslint-disable-next-line no-restricted-syntax
  for (const child of children) {
    let vndbUrl = '';
    const egsUrl = '';

    if (page === 0) {
      const a = child.querySelector('a');
      const { href } = a;

      alert(href);
      vndbUrl = href;

      if (vndbUrl !== '' && openVNDB) {
        GM_openInTab(vndbUrl, false);
      }

      if (egsUrl !== '' && openEGS) {
        GM_openInTab(egsUrl, false);
      }
    } else if (page === 1) {
      alert('page1');
      const response = fetch(child.href);
      alert(response.text());
    }
  }
}

(function () {
  const cssObj = {
    position: 'absolute', top: '25%', right: '3%', 'z-index': 3,
  };
  addButton('Bulk open VNDB & EGS', stuff, cssObj);
}());
