var regex = /"\w+[\/-]\d+-\w{1,2}"/ig;
var handlesIds = [];
var browser = browser ?? chrome;

window.addEventListener('popstate', tryCompute);
window.addEventListener('load', tryCompute);

function extractDatabaseFromUrl() {
    var url = document.location.href;
    var matches = url.match(/database=([^&]+)&/gi);
    if (matches && matches.length > 0) {
        var match = matches[0];
        return match.substring('database='.length, match.length);
    }
    return '';
}

function tryCompute() {
    handlesIds = [];
    if (!document.location.href.includes("/edit")) return;
    var retries = 0;
    var readyStateCheckInterval = setInterval(function () {
        ++retries;
        const success = compute();
        if (success || retries > 50) {
            clearInterval(readyStateCheckInterval);
        }
        const target = document.getElementsByClassName("ace_text-layer");
        if (success && !!target) {
            const observer = new MutationObserver(debounce(compute, 300, false));
            observer.observe(target[0], { subtree: true, childList: true });
        }
    }, 400);
}

function compute() {
    var lines = document.getElementsByClassName("ace_line");
    if (lines.length == 0) return false;

    var texts = Array.from(lines).map(l => l.innerText);
    var ids = texts.flatMap(t => t.match(regex)).filter(Boolean).map(id => id.substring(1, id.length - 1));

    if (ids.length === 0) return true;
    ids = ids.filter((value, index, array) => array.indexOf(value) === index);

    var panel = document.getElementById("right-options-panel");
    if (panel) panel = panel.getElementsByClassName("panel-body");
    if (!panel || panel.length == 0) return false;

    if (ids.filter(fresh => handlesIds.indexOf(fresh) == -1).length == 0) return true;

    var hdr = document.getElementById("ext-ravendb-link-hdr");
    if (!hdr) {
        var header = document.createElement("h3");
        header.id = "ext-ravendb-link-hdr";
        header.innerText = "Links";
        panel[0].appendChild(header)
        var hr = document.createElement("hr");
        hr.className = "small";
        panel[0].appendChild(hr);
    }
    var ctr = document.getElementById("ext-ravendb-links-ctr");
    if (!ctr) {
        ctr = document.createElement("div");
        ctr.id = "ext-ravendb-links-ctr";
        panel[0].appendChild(ctr);
    }
    const links = ids.map(id => {
        var a = document.createElement("a");
        a.href = `#databases/edit?&database=${extractDatabaseFromUrl()}&id=${encodeURIComponent(id)}`;
        a.innerText = id;
        var div = document.createElement("div");
        div.className = "virtualRow";
        div.appendChild(a);
        return div;
    });
    ctr.replaceChildren(...links);
    handlesIds = ids;
    return true;
}