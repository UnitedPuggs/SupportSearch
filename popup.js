let search = document.getElementById("license");

if(search) {
search.addEventListener("keypress", async(e) => {
    if(e.key === 'Enter') {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    console.log("License is " + document.getElementById("license").value);
    chrome.scripting.executeScript({
        target: {tabId: tab.id}, 
        files: ['popup.js'],
        func: findLicenseName(document.getElementById("license").value),//getVersionTiming(document.getElementById("license").value),
    });
}
});
}

function findLicenseName(licenseName) {
    var req = new XMLHttpRequest();
    req.addEventListener('readystatechange', function() {
        if(req.readyState === 4) {
            if(req.status === 200) {
                val = JSON.parse(req.responseText)
                if(val.length === 0) {
                    getVersionTiming(licenseName);
                } else {
                    document.getElementById("versioninfo").innerHTML = "<div>Version:</div>" + val[0].VersionNumber + "<br>" + val[0].LastUpdated;
                }
            } else {
                alert("Error: status " + req.status);
            }
        }
    });
    req.open('GET', 'http://35.235.82.160/receive_license.php?licenseName=' + licenseName, true);
    req.send();
}

function insertLicenseName(licenseName, versionNumber, lastUpdated) {
    var req = new XMLHttpRequest();
    req.addEventListener('readystatechange', function() {
        if(req.readyState === 4) {
            if(req.status === 200) {
            } else {
                alert("Error: status " + req.status);
            }
        }
    });
    req.open('POST', 'http://35.235.82.160/insert_license.php', true);
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    req.send('licenseName=' + encodeURIComponent(licenseName) + "&versionNumber=" + versionNumber + "&lastUpdated=" + lastUpdated);
}

function getVersionTiming(licenseName) {
    fetch("https://" + licenseName + ".clubspeedtiming.com/api/index.php/version/current.json?key=cs-dev")
        .then(response => response.json())
        .then(data => {
            document.getElementById("versioninfo").innerHTML = "<div>Version:</div>" + data.CurrentVersion + "<br>" + data.LastUpdated; 
            insertLicenseName(licenseName, data.CurrentVersion, data.LastUpdated); 
        })
        .catch(err => { if(err.message.includes("Failed to fetch")) { getVersion(licenseName) } })
}

function getVersion(licenseName) {
    fetch("https://" + licenseName + ".clubspeed.com/api/index.php/version/current.json?key=cs-dev")
    .then(response => response.json())
    .then(data => {
        document.getElementById("versioninfo").innerHTML = "<div>Version:</div>" + data.CurrentVersion + "<br>" + data.LastUpdated; 
        insertLicenseName(licenseName, data.CurrentVersion, data.LastUpdated); 
    })
    .catch(err => { console.log(err); document.getElementById("versioninfo").innerHTML = "No response received. Check network connectivity of this site."; });
}