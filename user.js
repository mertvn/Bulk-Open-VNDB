/* eslint-disable no-console */
/* eslint-disable no-return-assign */
/* eslint-disable no-alert */
// ==UserScript==
// @name        Bulk Open VNDB
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
  Object.keys(cssObj).forEach((key) => btnStyle[key] = cssObj[key]);
  return button;
}

async function getEGSUrl(vndbUrl) {
  alert('getting EGS url');
  const response = await fetch(vndbUrl);
  const parser = new DOMParser();
  const doc = parser.parseFromString(await response.text(), 'text/html');

  const allLangs = doc.querySelector('.mainbox.vnreleases').children;
  console.log(allLangs);
  const ja = Array.from(allLangs).find((v) => v.getAttribute('data-save-id') === 'vnlang-ja');
  console.log(ja);
  const releases = ja.querySelector('tbody');
  console.log({ releases });
  const abbrs = releases.querySelectorAll('abbr');
  console.log({ abbrs });
  const firstCompleteRelease = Array.from(abbrs).find((v) => v.getAttribute('title') === 'complete').parentElement.parentElement;
  console.log({ firstCompleteRelease });
  const as = firstCompleteRelease.querySelectorAll('a');
  console.log({ as });
  const egsUrl = Array.from(as).find((v) => v.getAttribute('href').startsWith('https://erogamescape')).href;
  console.log(egsUrl);

  return egsUrl;
}

async function stuff() {
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
    let vndbUrls = [];

    if (page === 0) {
      const a = child.querySelector('a');
      const { href } = a;

      alert(href);
      vndbUrls.push(href);
    } else if (page === 1) {
      alert('page1');
      const response = await fetch(child.href);
      const parser = new DOMParser();
      const doc = parser.parseFromString(await response.text(), 'text/html');

      const tdAnchors = [...doc.querySelectorAll('td > a')];
      console.log(tdAnchors);
      const vnAnchors = Array.from(tdAnchors).filter((v) => v.getAttribute('href').startsWith('/v'));
      console.log(vnAnchors);
      vndbUrls = vnAnchors.map((a) => a.href);
      console.log(vndbUrls);
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const vndbUrl of vndbUrls) {
      const egsUrl = await getEGSUrl(vndbUrl);
      alert('opening tabs');
      if (vndbUrl !== '' && openVNDB) {
        GM_openInTab(vndbUrl, false);
      }

      if (egsUrl !== '' && openEGS) {
        GM_openInTab(egsUrl, false);
      }
    }
  }
}

(function () {
  const cssObj = {
    position: 'absolute', top: '25%', right: '3%', 'z-index': 3,
  };
  addButton('Bulk open VNDB & EGS', stuff, cssObj);
}());
