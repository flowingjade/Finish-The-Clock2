let tasks = []

function updateTime(){
  chrome.storage.local.get(["timer","timeOption"],(res)=> {
    const time = document.getElementById("time")
    const minutes = `${res.timeOption - Math.ceil(res.timer / 60)}`.padStart(2,"0")
    let seconds = "00"
    if(res.timer % 60 != 0){
      seconds = `${60 - res.timer % 60}`.padStart(2,"0")
    }

    time.textContent = `${minutes}:${seconds}`
  })
}

updateTime()
setInterval(updateTime, 1000)
countdownUpdate()
setInterval(countdownUpdate,1000)

/*function countdownUpdate(){
  chrome.storage.local.get(["timer2"], (res)=>{
    const time2 = document.getElementById("timeLeft")
    time2.textContent=res.timer2
  })
}*/


function countdownUpdate(){
  chrome.storage.local.get(["timer","timeLeft","timeOption","runningCountdown","timeRemains"], (res)=>{
    const cdTime = document.getElementById("timeLeft")
    const minutes = `${res.timeOption-Math.ceil(res.timeRemains/60)}`.padStart(2,"0")
    let seconds = "00"
    if(res.timeRemains % 60 !=0){
      seconds = `${60-res.timeRemains %60}`.padStart(2,"0")
    }
    cdTime.textContent = `${minutes}:${seconds}`
  })
}


const startCountdownBtn = document.getElementById("start-countdown-btn")
startCountdownBtn.addEventListener("click", ()=>{
  chrome.storage.local.get(["runningCountdown"], (res)=>{
    chrome.storage.local.set({
      runningCountdown: !res.runningCountdown,
    },()=>{
      startCountdownBtn.textContent = !res.runningCountdown ? "Pause Countdown" : "Start Countdown"
    })
  })
})

const startTimerBtn = document.getElementById("start-timer-btn")
startTimerBtn.addEventListener("click", () =>{
  chrome.storage.local.get(["isRunning"], (res)=>{
    chrome.storage.local.set({
      isRunning: !res.isRunning,
    }, () => {
      startTimerBtn.textContent = !res.isRunning ? "Pause Timer" : "Start Timer"
    })
  })
  
})

/*const stopCountdownBtn = document.getElementById("stop-countdown-btn")
stopCountdownBtn.addEventListener("click", ()=> {
  chrome.storage.local.set({
    timeRemains: 0,
    runningCountdown: false,
  }, ()=> {
    startCountdownBtn.textContent = "Start Timer"
  })
})*/


const resetTimerBtn = document.getElementById("reset-timer-btn")
resetTimerBtn.addEventListener("click", ()=> {
  chrome.storage.local.set({
    timer: 0,
    isRunning: false,
  }, ()=> {
    startTimerBtn.textContent = "Start Timer"
  })
})


const addTaskBtn = document.getElementById("add-task-btn")
addTaskBtn.addEventListener("click",()=> addTask())

chrome.storage.sync.get(["tasks"], (res)=>{
  tasks = res.tasks ? res.tasks : []
  renderTasks()
  saveTasks()
})
function saveTasks(){
  chrome.storage.sync.set({
    tasks,
  })
}

function renderTask(taskNum){
  const taskRow = document.createElement("div")

  const text = document.createElement("input")
  text.type = "text"
  text.placeholder = "Enter a task..."
  text.value = tasks[taskNum]
  text.className = "task-input"
  text.addEventListener("change", ()=>{
    tasks[taskNum]= text.value
    saveTasks()
  })

  const deleteBtn = document.createElement("input")
  deleteBtn.type = "button"
  deleteBtn.value = "X"
  deleteBtn.className = "task-delete"
  deleteBtn.addEventListener("click", () => {
    deleteTask(taskNum)
  })

  taskRow.appendChild(text)
  taskRow.appendChild(deleteBtn)

  const taskContainer = document.getElementById("task-container")
  taskContainer.appendChild(taskRow)
}


function addTask() {
  const taskNum = tasks.length
  tasks.push("")
  renderTask(taskNum)
  saveTasks()
}

function deleteTask(taskNum){
  tasks.splice(taskNum, 1)
  renderTasks()
  saveTasks()
}

function renderTasks(){
  const taskContainer = document.getElementById("task-container")
  taskContainer.textContent=""
  tasks.forEach((taskText, taskNum)=>{
    renderTask(taskNum)
  })
}





