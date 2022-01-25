// ==UserScript==
// @name        Bulk open VNDB
// @include     *
// @version     0.1
// @grant       GM_openInTab
// @run-at      document-idle
// ==/UserScript==

(function() {
  'use strict';

  var cssObj = {position: 'absolute', top: '25%', right:'3%', 'z-index': 3}
  addButton("Bulk open VNDB & EGS", stuff, cssObj);
})();

async function stuff(){
var openVNDB = true;
var openEGS = true;

var page = null; // 0: VN, 1: Char

if (document.location.pathname == "/v")
 page = 0;
else if (document.location.pathname == "/c")
 page = 1;

  var selection = "";
 if (page == 0)
  selection = ".mainbox.vngrid";
 else if (page == 1)
  selection = ".mainbox.charbgrid";

var children = document.querySelector(selection).children;

for (const child of children) {
  var vndbUrl = "";
  var egsUrl = "";
  
  if (page == 0){
    var a = child.querySelector("a");
    var href = a.href; 
  
    alert(href)
    vndbUrl = href;
    
  
  if (vndbUrl != "" && openVNDB)
    GM_openInTab(vndbUrl, false);
  
  if (egsUrl != "" && openEGS)
    GM_openInTab(egsUrl, false);
  }
  else if (page == 1){
    {
      alert("page1")
      let response = await fetch(child.href);
      alert(await response.text());
    }
  }
  
  
}
}

function addButton(text, onclick, cssObj) {
  let button = document.createElement('button'), btnStyle = button.style
  document.body.appendChild(button)
  button.innerHTML = text
  button.onclick = onclick
  btnStyle.position = 'absolute'
  Object.keys(cssObj).forEach(key => btnStyle[key] = cssObj[key])
  return button
}