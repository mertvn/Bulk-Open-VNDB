// ==UserScript==
// @name        Bulk Open VNDB
// @match       https://vndb.org/v
// @match       https://vndb.org/c
// @version     0.1
// @grant       GM_openInTab
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-idle
// ==/UserScript==

/* eslint-disable no-console */
/* eslint-disable no-return-assign */

function addButton(text, onclick, cssObj, id) {
  const button = document.createElement('button');
  const btnStyle = button.style;
  document.body.appendChild(button);
  button.id = id;
  button.innerHTML = text;
  button.onclick = onclick;
  btnStyle.position = 'absolute';
  Object.keys(cssObj).forEach((key) => btnStyle[key] = cssObj[key]);
  return button;
}

async function getEGSUrl(vndbUrl) {
  // alert('getting EGS url');
  const response = await fetch(vndbUrl);
  const parser = new DOMParser();
  const doc = parser.parseFromString(await response.text(), 'text/html');

  const allLangs = doc.querySelector('.mainbox.vnreleases').children;
  console.log({ allLangs });
  // different attribute names are used depending on whether you're logged in or not (???)
  const ja = Array.from(allLangs).find((v) => v.getAttribute('data-save-id') === 'vnlang-ja' || v.getAttribute('data-remember-id') === 'vnlang-ja');
  console.log({ ja });
  const releases = ja.querySelector('tbody');
  console.log({ releases });
  const abbrs = releases.querySelectorAll('abbr');
  console.log({ abbrs });
  const completeReleases = Array.from(abbrs).filter((v) => v.getAttribute('title') === 'complete');
  console.log({ completeReleases });

  // eslint-disable-next-line no-restricted-syntax
  for (const completeRelease of completeReleases) {
    const as = completeRelease.parentElement.parentElement.querySelectorAll('a');
    console.log({ as });
    const egsElement = Array.from(as).find((v) => v.getAttribute('href').startsWith('https://erogamescape'));
    console.log(egsElement);

    if (egsElement) {
      const egsUrl = egsElement.href;
      console.log(egsUrl);

      return egsUrl;
    }
  }

  return '';
}

async function OpenLastUrls() {
  const openVNDB = true;
  const openEGS = true;

  const vndbUrls = GM_getValue('LastUrls', []);

  // eslint-disable-next-line no-restricted-syntax
  for (const vndbUrl of vndbUrls) {
    const egsUrl = await getEGSUrl(vndbUrl);
    // alert('opening tabs');
    if (vndbUrl !== '' && openVNDB) {
      GM_openInTab(vndbUrl, false);
    }

    if (egsUrl !== '' && openEGS) {
      GM_openInTab(egsUrl, false);
    }

    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 3000));
  }

  const button = document.querySelector('#BulkOpenVNDBAndEGSButton');
  button.textContent = 'Bulk open VNDB & EGS';
  button.onclick = stuff;
}

async function stuff() {
  GM_setValue('LastUrls', []);

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

  let vndbUrls = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const child of children) {
    if (page === 0) {
      const a = child.querySelector('a');
      const { href } = a;

      vndbUrls.push(href);
      console.log(vndbUrls);
    } else if (page === 1) {
      const response = await fetch(child.href);
      const parser = new DOMParser();
      const doc = parser.parseFromString(await response.text(), 'text/html');

      const tdAnchors = [...doc.querySelectorAll('td > a')];
      console.log(tdAnchors);
      const vnAnchors = Array.from(tdAnchors).filter((v) => v.getAttribute('href').startsWith('/v'));
      console.log(vnAnchors);
      vndbUrls = vndbUrls.concat(vnAnchors.map((a) => a.href));
      console.log(vndbUrls);
    }
  }

  GM_setValue('LastUrls', vndbUrls);

  const button = document.querySelector('#BulkOpenVNDBAndEGSButton');
  button.textContent = `Press again to open ${vndbUrls.length}+ tabs`;
  button.onclick = OpenLastUrls;
}

(function main() {
  const cssObj = {
    position: 'absolute', top: '25%', right: '3%', 'z-index': 3,
  };
  addButton('Bulk open VNDB & EGS', stuff, cssObj, 'BulkOpenVNDBAndEGSButton');
}());
