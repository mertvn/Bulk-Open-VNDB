// ==UserScript==
// @name        Bulk Open VNDB
// @match       https://vndb.org/v
// @match       https://vndb.org/c
// @match       https://vndb.org/v?*
// @match       https://vndb.org/c?*
// @match       https://vndb.org/i*
// @match       https://vndb.org/g*
// @version     0.6
// @author      mertvn
// @downloadURL https://raw.githubusercontent.com/mertvn/Bulk-Open-VNDB/master/user.js
// @grant       GM_openInTab
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-idle
// ==/UserScript==

/* eslint-disable no-console */
/* eslint-disable no-return-assign */

function makeButton(text, onclick, cssObj, id) {
  const button = document.createElement('button');
  const btnStyle = button.style;
  button.id = id;
  button.innerHTML = text;
  button.onclick = onclick;
  Object.keys(cssObj).forEach((key) => btnStyle[key] = cssObj[key]);
  return button;
}

function makeSelect(options, defaultIndex, cssObj, id) {
  const select = document.createElement('select');
  const selectStyle = select.style;
  select.id = id;

  // eslint-disable-next-line no-restricted-syntax
  for (const option of options) {
    const opt = document.createElement('option');
    opt.text = option;
    select.add(opt);
  }

  select.options[defaultIndex].defaultSelected = true;
  Object.keys(cssObj).forEach((key) => selectStyle[key] = cssObj[key]);
  return select;
}

function makeCheckbox(text, checked, cssObj, id) {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = text;
  checkbox.checked = checked;
  checkbox.id = id;

  const label = document.createElement('label');
  label.htmlFor = text;
  label.appendChild(document.createTextNode(text));
  label.style.paddingLeft = '3px';

  const container = document.createElement('container');
  const containerStyle = container.style;

  container.appendChild(checkbox);
  container.appendChild(label);

  Object.keys(cssObj).forEach((key) => containerStyle[key] = cssObj[key]);
  return container;
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function tryFetchText(url) {
  let response = await fetch(url);
  // eslint-disable-next-line no-undef
  let tries = GM_getValue('tries', 1);

  while (response.status !== 200) {
    console.log(response);
    console.log(tries);
    // eslint-disable-next-line no-await-in-loop
    await sleep(3000 * tries);
    // eslint-disable-next-line no-await-in-loop
    response = await fetch(url);
    tries += 4;
  }
  if (tries > 1) {
    tries -= 1;
    await sleep(2500);
  }

  // eslint-disable-next-line no-undef
  GM_setValue('tries', tries);

  return response.text();
}

function egs0(releases) {
  const egsUrls = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const release of releases) {
    const as = [...release.querySelectorAll('a')];
    console.log({ as });
    const egsElement = as.find((v) => v.getAttribute('href').startsWith('https://erogamescape'));
    console.log(egsElement);

    if (egsElement) {
      const egsUrl = egsElement.href;
      egsUrls.push(egsUrl);

      break;
    }
  }

  return egsUrls;
}

async function getEGSUrls(vndbUrl) {
  const egsSelectValue = document.querySelector('#EGSSelect').value;
  let egsUrls = [];

  // alert('getting EGS url');
  const responseText = await tryFetchText(vndbUrl);
  const parser = new DOMParser();
  const doc = parser.parseFromString(responseText, 'text/html');

  const allLangs = doc.querySelector('.mainbox.vnreleases').children;
  console.log({ allLangs });
  // different attribute names are used depending on whether you're logged in or not (???)
  const ja = Array.from(allLangs).find((v) => v.getAttribute('data-save-id') === 'vnlang-ja' || v.getAttribute('data-remember-id') === 'vnlang-ja');
  console.log({ ja });
  const releases = ja.querySelector('tbody').children;
  console.log({ releases });

  if (egsSelectValue === 'First release') {
    egsUrls = egs0(releases);
  } else if (egsSelectValue === 'First 18+ Windows release') {
    // eslint-disable-next-line no-restricted-syntax
    for (const release of releases) {
      if (release.children[1].textContent === '18+'
       && release.children[2].children[0].getAttribute('title') === 'Windows') {
        const as = [...release.querySelectorAll('a')];
        console.log({ as });
        const egsElement = as.find((v) => v.getAttribute('href').startsWith('https://erogamescape'));
        console.log(egsElement);

        if (egsElement) {
          const egsUrl = egsElement.href;
          egsUrls.push(egsUrl);

          break;
        }
      }
    }
    // fallback
    if (egsUrls.length === 0) {
      egsUrls = egs0(releases);
    }
  } else if (egsSelectValue === 'All releases') {
    // eslint-disable-next-line no-restricted-syntax
    for (const release of releases) {
      const as = [...release.querySelectorAll('a')];
      console.log({ as });
      const egsElement = as.find((v) => v.getAttribute('href').startsWith('https://erogamescape'));
      console.log(egsElement);

      if (egsElement) {
        const egsUrl = egsElement.href;
        egsUrls.push(egsUrl);
      }
    }
  } else if (egsSelectValue === 'All 18+ Windows releases') {
    // eslint-disable-next-line no-restricted-syntax
    for (const release of releases) {
      if (release.children[1].textContent === '18+'
   && release.children[2].children[0].getAttribute('title') === 'Windows') {
        const as = [...release.querySelectorAll('a')];
        console.log({ as });
        const egsElement = as.find((v) => v.getAttribute('href').startsWith('https://erogamescape'));
        console.log(egsElement);

        if (egsElement) {
          const egsUrl = egsElement.href;
          egsUrls.push(egsUrl);
        }
      }
    }
    // fallback
    if (egsUrls.length === 0) {
      egsUrls = egs0(releases);
    }
  }

  // unnecessary rn
  // const duplicateUrls = document.querySelector('#DuplicateUrlsCheckbox').checked;
  // if (!duplicateUrls) {
  //   egsUrls = [...new Set(egsUrls)];
  // }

  return egsUrls;
}

async function openLastUrls() {
  const button = document.querySelector('#BulkOpenVNDBAndEGSButton');
  const openVNDB = document.querySelector('#VNDBCheckbox').checked;
  const openEGS = document.querySelector('#EGSCheckbox').checked;
  const duplicateUrls = document.querySelector('#DuplicateUrlsCheckbox').checked;

  // eslint-disable-next-line no-undef
  let vndbUrls = GM_getValue('lastUrls', []);
  const openedEgsUrls = [];
  if (!duplicateUrls) {
    vndbUrls = [...new Set(vndbUrls)];
  }

  for (let index = 0; index < vndbUrls.length; index += 1) {
    const vndbUrl = vndbUrls[index];
    // alert('opening tabs');
    button.textContent = `Opening tabs...${index}`;
    if (openVNDB && vndbUrl !== '') {
      // eslint-disable-next-line no-undef
      GM_openInTab(vndbUrl, false);
    }

    if (openEGS) {
      const egsUrls = await getEGSUrls(vndbUrl);

      // eslint-disable-next-line no-restricted-syntax
      for (const egsUrl of egsUrls) {
        if (egsUrl !== '') {
          if (duplicateUrls || !openedEgsUrls.includes(egsUrl)) {
            openedEgsUrls.push(egsUrl);

            // eslint-disable-next-line no-undef
            GM_openInTab(egsUrl, false);
          }
        }
      }
    }
  }

  button.textContent = 'Bulk open';
  button.onclick = stuff;
}

async function stuff() {
  const button = document.querySelector('#BulkOpenVNDBAndEGSButton');
  // eslint-disable-next-line no-undef
  GM_setValue('lastUrls', []);

  let page = null; // 0: VNs and Tags, 1: Chars and Traits
  if (document.location.pathname === '/v' || document.location.pathname.startsWith('/g')) {
    page = 0;
  } else if
  (document.location.pathname === '/c' || document.location.pathname.startsWith('/i')) {
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
  for (let index = 0; index < children.length; index += 1) {
    const child = children[index];
    if (page === 0) {
      const a = child.querySelector('a');
      const { href } = a;

      vndbUrls.push(href);
      console.log(vndbUrls);
    } else if (page === 1) {
      button.textContent = `Fetching...${index}`;
      const responseText = await tryFetchText(child.href);
      const parser = new DOMParser();
      const doc = parser.parseFromString(responseText, 'text/html');

      const tdAnchors = [...doc.querySelectorAll('td > a')];
      console.log(tdAnchors);
      const vnAnchors = tdAnchors.filter((v) => v.getAttribute('href').startsWith('/v'));
      console.log(vnAnchors);
      vndbUrls = vndbUrls.concat(vnAnchors.map((a) => a.href));
      console.log(vndbUrls);
    }
  }

  // eslint-disable-next-line no-undef
  GM_setValue('lastUrls', vndbUrls);

  let tabCount = vndbUrls.length;
  const duplicateUrls = document.querySelector('#DuplicateUrlsCheckbox').checked;
  if (!duplicateUrls) {
    tabCount = [...new Set(vndbUrls)].length;
  }
  button.textContent = `Press again to open ${tabCount}+ tabs`;
  button.onclick = openLastUrls;
}

(function main() {
  if (!document.querySelector('.mainbox.vngrid') && !document.querySelector('.mainbox.charbgrid')) {
    const button = makeButton('Can\'t find grid', null, {
      position: 'absolute', top: '25%', right: '3%', 'z-index': 3, color: 'grey',
    }, 'NoGridButton');
    button.disabled = true;
    document.body.appendChild(button);

    return;
  }

  const divCSS = {
    position: 'absolute', top: '22%', right: '3%', 'z-index': 3,
  };

  const buttonCSS = {
    margin: '2px',
  };
  const select1CSS = {
    margin: '2px',
  };
  const checkboxesDivCSS = {
    margin: '2px',

  };
  const checkboxCSS = {
    margin: '2px',
  };

  const div = document.createElement('div');
  div.id = 'BulkOpenVNDBAndEGSDiv';
  Object.keys(divCSS).forEach((key) => div.style[key] = divCSS[key]);
  document.body.appendChild(div);

  const checkboxesDiv = document.createElement('div');
  checkboxesDiv.id = 'checkboxesDiv';
  Object.keys(checkboxesDivCSS).forEach((key) => checkboxesDiv.style[key] = checkboxesDivCSS[key]);

  div.appendChild(makeButton('Bulk open', stuff, buttonCSS, 'BulkOpenVNDBAndEGSButton'));
  div.appendChild(document.createElement('br'));
  div.appendChild(makeSelect(['First release', 'First 18+ Windows release', 'All releases', 'All 18+ Windows releases'], 0, select1CSS, 'EGSSelect'));

  checkboxesDiv.appendChild(makeCheckbox('VNDB', true, checkboxCSS, 'VNDBCheckbox'));
  checkboxesDiv.appendChild(makeCheckbox('EGS', true, checkboxCSS, 'EGSCheckbox'));
  const br = document.createElement('br');
  checkboxesDiv.appendChild(br);
  checkboxesDiv.appendChild(makeCheckbox('Allow duplicate urls', false, checkboxCSS, 'DuplicateUrlsCheckbox'));

  div.appendChild(checkboxesDiv);
}());
