chrome.alarms.create("pomodoroTimer",{
    periodInMinutes: 1 / 60,
})

chrome.alarms.onAlarm.addListener((alarm) => {
    if(alarm.name === "pomodoroTimer"){
        chrome.storage.local.get(["timer", "isRunning","timeOption","timeLeft"], (res) => {
            if(res.isRunning){
                let timer = res.timer + 1
                let isRunning = true
                let timeLeft = 0
                if(timer === 60*res.timeOption){
                    this.registration.showNotification("Finish The Clock", {
                        body: res.timeOption+" minutes have passed!",
                        icon: "icons-8-hourglass-48.png",
                    })
                    timeLeft += res.timeOption
                    timer = 0
                    isRunning = false
                }
                chrome.storage.local.set({
                    timer,
                    isRunning,
                })
            }

        })
    }
})
chrome.alarms.create("countdownTimer",{
    periodInMinutes:1/60,
})

chrome.alarms.onAlarm.addListener((alarm) => {
    if(alarm.name === "countdownTimer"){
        chrome.storage.local.get(["timeRemains", "runningCountdown","timeLeft"], (res) => {
            if(res.runningCountdown){
                let timeRemains = res.timeRemains + 1
                console.log(timeRemains)
                let runningCountdown = true
                if(timeRemains === 60*res.timeLeft){
                    this.registration.showNotification("Finish The Clock", {
                        body: res.timeOption+" minutes have passed! Return to your work.",
                        icon: "icons-8-hourglass-48.png",
                    })
                    timeRemains = 0
                    runningCountdown = false
                }
                chrome.storage.local.set({
                    timeRemains,
                    runningCountdown,
                })
            }

        })
    }
})



/*chrome.alarms.onAlarm.addListener((alarm)=>{
    if(alarm.name === "countdownTimer"){
        chrome.storage.local.get(["timeLeft","runningCountdown","timeOption"],(res)=>{
            if(res.runningCountdown){
                let timeLeft = res.timeLeft-1
                //let timeLeft = (60*res.timeLeft) -1
                //let timeLeft = res.timeRemains + 1
                console.log(timeLeft)
                let runningCountdown = true
                if(timeLeft === 0){
                    timeLeft = 0
                    runningCountdown = false
                }
                chrome.storage.local.set({
                    timeLeft,
                    runningCountdown,
                })
        
            }
        })
    }
})*/




chrome.storage.local.get(["timer","isRunning"], (res) => {
    chrome.storage.local.set({
        timer: "timer" in res ? res.timer : 0,
        timeOption: "timeOption" in res ? res.timeOption : 25,
        isRunning: "isRunning" in res ? res.isRunning : false,
        runningCountdown: "runningCountdown" in res ? res.runningCountdown : false,
        timeRemains: "timeRemains" in res ? res.timeRemains: 0,
        timeLeft: "timeLeft" in res ? res.timeLeft: 25,
    })
})

function blockRequest() {
    return {
        cancel: true
    };
}
chrome.extension.onRequest.addListener(
    function (request, sender, sendResponse) {
        if (request.urls == 'save') {
            let getStoredURLs = [];
            chrome.storage.local.getBytesInUse('websites', function (bytes) {
                if (bytes) {
                    chrome.storage.local.get("websites", function (res) {
                        if (res != {}) {
                            getStoredURLs = JSON.parse(res.websites);
                            if (getStoredURLs.length > 0) {                                
                                const filter = {
                                    urls: getStoredURLs,
                                };
                                chrome.webRequest.onBeforeRequest.addListener(
                                    blockRequest,
                                    filter, ["blocking"]
                                );
                            } else if (getStoredURLs.length == 0) {

                                if (chrome.webRequest.onBeforeRequest.hasListener(blockRequest)) {
                                    chrome.webRequest.onBeforeRequest.removeListener(blockRequest);
                                }
                            }
                        }
                    });
                } else {
                    getStoredURLs = false;
                }
            });
        }
    }
);