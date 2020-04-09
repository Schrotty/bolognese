import { Howl, Howler } from 'howler';

let time = 25;
let interval: number;

var counter: number;
var display: number;
var sub_dis: number;
var is_ticking: boolean;

var sound = new Howl({
    volume: 0.5,
    html5: true,
    src: ['sounds/owl.mp3']
});

const timer = document.querySelector("#timer");

document.querySelector("#pomodoro-button").addEventListener("click", () => updateTimer(25));
document.querySelector("#l-break-button").addEventListener("click", () => updateTimer(20));
document.querySelector("#s-break-button").addEventListener("click", () => updateTimer(5));

document.querySelector("#start").addEventListener("click", () => startTimer());
document.querySelector("#stop").addEventListener("click", () => stopTimer());
document.querySelector("#reset").addEventListener("click", () => resetTimer());

function initTimer() {
    counter = time * 60;
    display = counter / 60;
    sub_dis = 60;
    is_ticking = false;
}

function startTimer() {    
    if (!is_ticking) {
        let sub = "00";
        let pre = time.toString();

        is_ticking = true;
        interval = setInterval(() => {
            counter = counter - 1;
            display = counter / 60;
            if (sub_dis == 0) sub_dis = 60;
            sub_dis--;
            
            sub = sub_dis.toString();
            if (sub_dis < 10) sub = "0" + sub_dis;
            if (display < 10) pre = 0 + Math.floor(display).toString();

            timer.textContent = pre + ":" + sub;
            if(counter === 0) {
                clearInterval(interval);

                sound.play();
                is_ticking = false;
            }
        }, 1000)
    };
}

function stopTimer() {
    is_ticking = false;
    clearInterval(interval);
}

function resetTimer() {
    stopTimer();
    updateTimer(time);
}

function updateTimer(t: number) {
    stopTimer();

    time = t;

    var value = t.toString();
    if (t < 10) value = 0 + value;
    timer.textContent = value + ":" + "00"

    initTimer();
}