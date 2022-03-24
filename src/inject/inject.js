var regex = /"\w+-\d+-\w"/ig;
var currentUrl = null;


function computeLinks() {
    if (document.location.href == currentUrl) return;
    currentUrl = document.location.href;
    var retries = 0;
    var readyStateCheckInterval = setInterval(function () {
        ++retries;
        var lines = document.getElementsByClassName("ace_line");
        if (lines.length > 0 || retries > 50) {
            clearInterval(readyStateCheckInterval);

            var texts = Array.from(lines).map(l => l.innerText);
            var ids = texts.flatMap(t => t.match(regex)).filter(Boolean).map(id => id.substring(1, id.length - 1));

            if (ids.length === 0) return;

            var panel = document.getElementById("right-options-panel");
            if (panel) panel = panel.getElementsByClassName("panel-body");
            if (panel && panel.length > 0) {
                var header = document.createElement("h3");
                header.innerText = "Links";
                panel[0].appendChild(header)
                var hr = document.createElement("hr");
                hr.className = "small";
                panel[0].appendChild(hr);
                ids.forEach(id => {
                    var a = document.createElement("a");
                    a.href = `#databases/edit?&database=redi-backend&id=${id}`;
                    a.innerText = id;
                    var div = document.createElement("div");
                    div.className = "virtualRow";
                    div.appendChild(a);
                    panel[0].appendChild(div);
                });
            }
        }
    }, 100);
};

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // listen for messages sent from background.js
        if (request.message === 'recompute') {
            computeLinks();
        }
    });
computeLinks();
