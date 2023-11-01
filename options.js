const timeOption = document.getElementById("time-option")
timeOption.addEventListener("change", (event) => {
    const val = event.target.value
    if(val<1 || val> 60){
        timeOption.value = 25
    }
})

const saveBtn = document.getElementById("save-btn")
saveBtn.addEventListener("click", ()=>{
    chrome.storage.local.set({
        timer: 0,
        timeOption: timeOption.value,
        isRunning: false,
    })
})

chrome.storage.local.get(["timeOption"], (res)=>{
    timeOption.value = res.timeOption
})

var background = (function () {
    let tmp = {};
    chrome.runtime.onMessage.addListener(function (request) {
      for (let id in tmp) {
        if (tmp[id] && (typeof tmp[id] === "function")) {
          if (request.path === "background-to-options") {
            if (request.method === id) {
              tmp[id](request.data);
            }
          }
        }
      }
    });
    /*  */
    return {
      "receive": function (id, callback) {
        tmp[id] = callback;
      },
      "send": function (id, data) {
        chrome.runtime.sendMessage({
          "method": id, 
          "data": data,
          "path": "options-to-background"
        }, function () {
          return chrome.runtime.lastError;
        });
      }
    }
  })();
  
  var config = {
    "blocklist": {
      "domains": {}, 
      "iframes": {}
    },
    "update": function () {
      config.fill.blocked.iframes();
      config.fill.blocked.domains();
    },
    "load": function () {
      const test = document.getElementById("test");
      const reload = document.getElementById("reload");
      const support = document.getElementById("support");
      const donation = document.getElementById("donation");
      /*  */
      //test.addEventListener("click", function () {background.send("test")}, false);
      //reload.addEventListener("click", function () {document.location.reload()}, false);
      //support.addEventListener("click", function () {background.send("support")}, false);
      //donation.addEventListener("click", function () {background.send("donation")}, false);
      /*  */
      document.getElementById("add-iframe").addEventListener("click", config.add.iframe);
      document.getElementById("add-domain").addEventListener("click", config.add.domain);
      document.getElementById("block-iframe").addEventListener("keypress", function (e) {if (e.key === "Enter") config.add.iframe()});
      document.getElementById("block-domain").addEventListener("keypress", function (e) {if (e.key === "Enter") config.add.domain()});
      /*  */
      config.update();
      window.removeEventListener("load", config.load, false);
    },
    "add": {
      "domain": function () {config.add.action("block-domain", "blocklist", config.blocklist.domains)},
      "iframe": function () {config.add.action("block-iframe", "blocklist-iframes", config.blocklist.iframes)},
      "action": function (id, key, blocklist) {
        let domain = document.getElementById(id).value.trim();
        if (domain) {
          if (domain.indexOf("*://") === 0) {
            blocklist[domain] = null;
          } else {
            domain = domain.replace("https://", '').replace("http://", '').replace("ftp://", '');
            /*  */
            let hostname = new URL("https://" + domain).hostname;
            blocklist[hostname.replace("www.", '')] = null;
          }
          /*  */
          background.send(key, blocklist);
        }
      }
    },
    "fill": {
      "blocked": {
        "iframes": function () {
          chrome.storage.local.get(null, function (storage) {
            document.getElementById("block-iframe").focus();
            document.getElementById("block-iframe").value = '';
            /*  */
            config.blocklist.iframes = "blocklist-iframes" in storage ? storage["blocklist-iframes"] : {};
            config.iterate("blocklist-iframes", "blocklist-iframes", config.blocklist.iframes);
          });
        },
        "domains": function () {
          chrome.storage.local.get(null, function (storage) {
            document.getElementById("block-domain").focus();
            document.getElementById("block-domain").value = '';
            /*  */
            config.blocklist.domains = "blocklist" in storage ? storage["blocklist"] : {};
            config.iterate("blocklist", "blocklist-domains", config.blocklist.domains);
          });
        }
      }
    },
    "iterate": function (key, id, blocklist) {    
      let count = 1;
      let tbody = document.getElementById(id);
      tbody.textContent = '';
      /*  */
      for (let domain in blocklist) {
        const item = document.createElement("tr");
        const close = document.createElement("td");
        const number = document.createElement("td");
        const blocked = document.createElement("td");
        const redirect = document.createElement("td");
        const input = document.createElement("input");
        /*  */
        close.setAttribute("type", "close");
        number.setAttribute("type", "number");
        blocked.setAttribute("type", "blocked");
        redirect.setAttribute("type", "redirect");
        /*  */
        number.textContent = count;
        blocked.textContent = domain.indexOf("*://") === 0 ? domain : "*://" + domain + "/*";
        /*  */
        input.setAttribute("key", key);
        input.setAttribute("type", "text");
        input.setAttribute("blocked", domain);
        input.value = blocklist[domain] || '';
        input.setAttribute("placeholder", "i.e. https://www.google.com/");
        input.addEventListener("change", function (e) {
          chrome.storage.local.get(null, function (storage) {
            let key = e.target.getAttribute("key");
            let blocklist = key in storage ? storage[key] : {};
            blocklist[e.target.getAttribute("blocked")] = e.target.value;
            background.send(key, blocklist);
          });
        });
        /*  */
        close.setAttribute("key", key);
        close.setAttribute("blocked", domain);
        close.addEventListener("click", function (e) {
          chrome.storage.local.get(null, function (storage) {
            let key = e.target.getAttribute("key");
            let blocklist = key in storage ? storage[key] : {};
            delete blocklist[e.target.getAttribute("blocked")];
            background.send(key, blocklist);
          });
        });
        /*  */
        item.appendChild(number);
        item.appendChild(blocked);
        redirect.appendChild(input);
        item.appendChild(redirect);
        item.appendChild(close);
        tbody.appendChild(item);
        /*  */
        count++;
      }
    }
  };
  
  background.receive("update", config.update);
  window.addEventListener("load", config.load, false);
