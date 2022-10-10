chrome.runtime.onInstalled.addListener(() => {
});

let search = document.getElementById("license");

search.addEventListener("keypress", async(e) => {
    if(e.key === 'Enter') {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    console.log("License is " + document.getElementById("license").value);
    chrome.scripting.executeScript({
        target: {tabId: tab.id}, 
        files: ['popup.js'],
        func: getVersionTiming(document.getElementById("license").value),
    });
}
});

function getVersionTiming(licenseName) {
    fetch("https://" + licenseName + ".clubspeedtiming.com/api/index.php/version/current.json?key=cs-dev")
        .then(response => response.json())
        .then(data => document.getElementById("test").innerHTML = data.CurrentVersion)
        .catch(err => { if(err.message.includes("Failed to fetch")) { getVersion(licenseName)} })
}

function getVersion(licenseName) {
    fetch("https://" + licenseName + ".clubspeed.com/api/index.php/version/current.json?key=cs-dev")
    .then(response => response.json())
    .then(data => document.getElementById("test").innerHTML = data.CurrentVersion)
    .catch(err => { console.log(err) });
}