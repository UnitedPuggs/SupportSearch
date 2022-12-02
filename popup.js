let search = document.getElementById("license");
let searchButton = document.getElementById("searchButton");

let mostRecentSearches = []

async function licenseLookup(e) {
    if(e.key === 'Enter' || e.type == "click") {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        console.log("License is " + document.getElementById("license").value);
        chrome.scripting.executeScript({
            target: {tabId: tab.id}, 
            files: ['popup.js'],
            func: findLicenseName((document.getElementById("license").value).trim()),
        });
    }
}

//Just adds event listeners for either pressing enter or clicking on button
if(search) {
    search.addEventListener("keypress", licenseLookup);
    searchButton.addEventListener("click", licenseLookup);
}

function addLinks(url) {
    document.getElementById("versioninfo").innerHTML += "<a href='http://" + url + "/sp_admin' target='_blank'>sp_admin</a>";
    document.getElementById("versioninfo").innerHTML += "<br><a href='http://" + url + "/admin' target='_blank'>admin</a></div>";
}

//Just so it continues on in the promise after 500ms in case the server is down
const control = new AbortController();
const timeout = setTimeout(() => control.abort(), 50);

/*** DATABASE RELATED FUNCTIONS ***/
//Makes a GET request to see if the licenseName is in MySQL db
function findLicenseName(licenseName) {
    fetch(("http://35.215.125.37/receive_license.php?licenseName=" + licenseName), { signal: control.signal })
    .then(response =>  response.json())
    .then(data => { 
        if(data.length == 0) {
            getCSTimingVers(licenseName);
        } else {
            document.getElementById("versioninfo").innerHTML = "<div>Version: " + data[0].VersionNumber + "<br>Last Updated: " + data[0].LastUpdated.substring(0, 10) + "<br>Links:";
            addLinks(data[0].LicenseName);
        }
    })
    .catch(err => {
        getCSTimingVers(licenseName);
        console.log(err);
    });
}

//Makes a POST req to db with whatever params I've got set up
function insertLicenseName(licenseName, versionNumber, lastUpdated) {
    fetch("http://35.215.125.37/insert_license.php", {
        method: "post",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: "licenseName=" + licenseName + "&versionNumber=" + versionNumber + "&lastUpdated=" + lastUpdated,
    })
    .catch(err => console.log(err))
}
/***********************************/

//*** INTERNAL API FUNCTIONS ***/
//Makes an API call for CS timing URL with the license name
function getCSTimingVers(licenseName) {
    fetch("https://" + licenseName + ".clubspeedtiming.com/api/index.php/version/current.json?key=cs-dev")
        .then(response => response.json())
        .then(data => {
            document.getElementById("versioninfo").innerHTML = "<div>Version: " + data.CurrentVersion + "<br>Last Updated: " + data.LastUpdated.substring(0, 10) + "<br>Links:"; 
            addLinks((licenseName + ".clubspeedtiming.com"));
            insertLicenseName((licenseName + ".clubspeedtiming.com"), data.CurrentVersion, data.LastUpdated);
            if(Object.keys(mostRecentSearches).length == 3) {

            } else {

            }
        })
        .catch(err => { 
            if(err.message.includes("Failed to fetch")) { 
                getCSVers(licenseName) //basically just seeing if it errors out and checks for CS url
            } 
        })
}

//Makes an API call for CS url for license name
function getCSVers(licenseName) {
    fetch("https://" + licenseName + ".clubspeed.com/api/index.php/version/current.json?key=cs-dev")
    .then(response => response.json())
    .then(data => {
        document.getElementById("versioninfo").innerHTML = "<div>Version: " + data.CurrentVersion + "<br>Last Updated: " + data.LastUpdated.substring(0, 10) + "<br>Links:"; 
        addLinks((licenseName + ".clubspeed.com"));
        insertLicenseName((licenseName + ".clubspeed.com"), data.CurrentVersion, data.LastUpdated); 
    })
    .catch(err => { 
        console.log(err); 
        document.getElementById("versioninfo").innerHTML = "No response received. Check network connectivity of this site."; 
    });
}
//********************/