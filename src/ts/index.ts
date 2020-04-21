import { Howl } from 'howler';
import { Settings } from './settings';
import { Timer } from './timer';

class Bolognese {
    alarm: any;
    timer: Element;
    timerSub: Element;
    time: number;
    interval: NodeJS.Timeout;

    timerType: Timer;
    counter: number;
    display: number;
    sub_dis: number;
    is_ticking: boolean;

    pomodoroButton: HTMLButtonElement;
    longBreakButton: HTMLButtonElement;
    shortBreakButton: HTMLButtonElement;

    pomodoroAutoCheckbox: HTMLInputElement;
    pomodoroBreaksInput: HTMLInputElement;

    alarmOverlay: Element;

    constructor(time: number) {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/worker.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                });
            });
        }

        this.initSettings();

        this.timerType = Timer.Pomodoro;
        this.timer = document.querySelector("#timer");
        this.timerSub = document.querySelector("#timer-sub");

        this.pomodoroButton = document.querySelector("#pomodoro-button");
        this.pomodoroButton.addEventListener("click", () => this.updateTimer(Settings.load("pomodoro"), Timer.Pomodoro));

        this.longBreakButton = document.querySelector("#l-break-button");
        this.longBreakButton.addEventListener("click", () => this.updateTimer(Settings.load("long-break"), Timer.LongBreak));

        this.shortBreakButton = document.querySelector("#s-break-button");
        this.shortBreakButton.addEventListener("click", () => this.updateTimer(Settings.load("short-break"), Timer.ShortBreak));

        this.pomodoroAutoCheckbox = document.querySelector("#pomodoro-auto-mode");
        this.pomodoroAutoCheckbox.addEventListener("change", () => {
            Settings.store("pomodoro_auto", this.pomodoroAutoCheckbox.checked);
        });

        this.pomodoroBreaksInput = document.querySelector("#pomodoro-breaks");
        this.pomodoroBreaksInput.addEventListener("change", () => {
            Settings.store("max_break", this.pomodoroBreaksInput.value);
            Settings.store("cur_break", 0);
        });

        this.pomodoroAutoCheckbox.checked = JSON.parse(Settings.load("pomodoro_auto"));
        this.pomodoroBreaksInput.value = Settings.load("max_break");

        this.alarmOverlay = document.querySelector("#alarm-overlay");
        this.alarmOverlay.addEventListener("click", () => {
            this.animateCSS("#test", "bounceOut", () => {
                this.alarmOverlay.classList.add("hidden");
            });
        });

        document.querySelector("#start").addEventListener("click", () => this.startTimer());
        document.querySelector("#stop").addEventListener("click", () => this.stopTimer());
        document.querySelector("#reset").addEventListener("click", () => this.resetTimer());

        document.querySelector("#settings").addEventListener("click", () => this.overlayFadeIn());
        document.querySelector("#settings-close").addEventListener("click", () => this.overlayFadeOut());

        document.querySelector("#c-pomodoro").addEventListener("change", () => {
            Settings.store("pomodoro", (<HTMLInputElement>document.querySelector("#c-pomodoro")).value);
        });

        document.querySelector("#c-l-break").addEventListener("change", () => {
            Settings.store("long-break", (<HTMLInputElement>document.querySelector("#c-l-break")).value);
        });

        document.querySelector("#c-s-break").addEventListener("change", () => {
            Settings.store("short-break", (<HTMLInputElement>document.querySelector("#c-s-break")).value);
        });

        document.querySelector("#custom-alarm").addEventListener("change", () => {
            Settings.store("alarm", (<HTMLSelectElement>document.querySelector("#custom-alarm")).value);
        });

        document.querySelector("#volume-control").addEventListener("change", () => {
            Settings.store("volume", (<HTMLInputElement>document.querySelector("#volume-control")).value)
        });

        document.querySelector("#alarm-preview").addEventListener("click", () => {
            new Howl({
                volume: Settings.load("volume"),
                html5: true,
                src: ['sounds/' + Settings.load("alarm") + '.mp3']
            }).play();
        });

        document.querySelectorAll(".timer").forEach(elem => this.registerButtonhandle(elem));

        this.indexAlarms();
        if (!window.localStorage) {
            document.querySelector("#settings-button").remove();
        }

        /* LOAD SETTINGS */
        (<HTMLInputElement>document.querySelector("#c-pomodoro")).value = Settings.load("pomodoro");
        (<HTMLInputElement>document.querySelector("#c-l-break")).value = Settings.load("long-break");
        (<HTMLInputElement>document.querySelector("#c-s-break")).value = Settings.load("short-break");
        (<HTMLInputElement>document.querySelector("#volume-control")).value = Settings.load("volume");

        this.time = time;
        this.updateTimer(this.time, Timer.Pomodoro);
    }

    initTimer() {
        this.counter = this.time * 60;
        this.display = this.time;
        this.sub_dis = 0;
        this.is_ticking = false;
    }

    startTimer() {
        let pre: string;
        let sub: string;

        if (!this.is_ticking) {
            if (Settings.load("alarm") != "-") {
                this.alarm = new Howl({
                    volume: Settings.load("volume"),
                    html5: true,
                    src: ['sounds/' + Settings.load("alarm") + '.mp3']
                });
            }

            this.is_ticking = true;
            this.interval = setInterval(() => {
                this.counter = this.counter - 1;
                this.display = Math.floor(this.counter / 60);

                if (this.sub_dis == 0) this.sub_dis = 60;
                this.sub_dis--;

                pre = this.display.toString();
                sub = this.sub_dis.toString();
                if (this.sub_dis < 10) sub = "0" + this.sub_dis;
                if (this.display < 10) pre = 0 + this.display.toString();

                this.timer.textContent = pre;
                this.timerSub.textContent = sub;
                if (Settings.load("timer-in-title")) this.refreshTitle(pre + ":" + sub);
                if (this.counter === 0) {
                    this.alarm.play();
                    this.is_ticking = false;
                    clearInterval(this.interval);

                    if (JSON.parse(Settings.load("kill-it-alarm"))) {
                        this.alarmOverlay.classList.remove("hidden");
                        this.animateCSS("#alarm-overlay", "bounceInDown", null);
                    }

                    if (JSON.parse(Settings.load("pomodoro_auto"))) {
                        if (this.timerType == Timer.Pomodoro) {
                            Settings.store("cur_break", +Settings.load("cur_break") + 1);
                            if (Settings.load("cur_break") < Settings.load("max_break")) {
                                this.shortBreakButton.click();
                                return;
                            }

                            Settings.store("cur_break", 0);
                            this.longBreakButton.click();
                            return;
                        }

                        if (this.timerType == Timer.ShortBreak || this.timerType == Timer.LongBreak) {
                            this.pomodoroButton.click();
                            return;
                        }
                    }
                }
            }, 1000)
        };
    }

    stopTimer() {
        this.is_ticking = false;
        clearInterval(this.interval);
    }

    resetTimer() {
        this.stopTimer();
        this.updateTimer(this.time);
    }

    updateTimer(t: number, type?: Timer) {
        this.stopTimer();

        this.time = t;
        this.timerType = type;

        var value = t.toString();
        if (t < 10) value = 0 + value;
        this.timer.textContent = value;
        this.timerSub.textContent = "00";

        this.initTimer();
    }

    registerButtonhandle(element: Element) {
        element.addEventListener("click", () => {
            document.querySelectorAll(".timer").forEach(elem => elem.classList.remove("activated"));
            element.classList.add("activated");
        });
    }

    overlayFadeIn() {
        const btn = document.querySelector("#overlay");

        btn.classList.remove("hidden");
        this.animateCSS("#overlay", "bounceInDown", null);
    }

    overlayFadeOut() {
        const btn = document.querySelector("#overlay");

        this.animateCSS("#overlay", "bounceOutUp", () => {
            btn.classList.add("hidden");
        });

        if (!this.is_ticking) {
            this.refreshCurrentAlarm();
        }
    }

    animateCSS(element: string, animationName: string, callback: any) {
        const node = document.querySelector(element)
        node.classList.add('animated', animationName)

        function handleAnimationEnd() {
            node.classList.remove('animated', animationName)
            node.removeEventListener('animationend', handleAnimationEnd)

            if (typeof callback === 'function') callback()
        }

        node.addEventListener('animationend', handleAnimationEnd)
    }

    indexAlarms() {
        const alarms = ["-", "Owl", "Duck"];
        alarms.forEach(a => {
            var alr = document.createElement("option");
            alr.value = a.toLowerCase();
            alr.text = a;

            if (Settings.load("alarm") === a.toLowerCase()) {
                alr.selected = true;
            }

            (<HTMLSelectElement>document.querySelector("#custom-alarm")).add(alr);
        });
    }

    refreshCurrentAlarm() {
        if (this.timerType == Timer.Pomodoro) {
            this.pomodoroButton.click();
        }

        if (this.timerType == Timer.LongBreak) {
            this.longBreakButton.click();
        }

        if (this.timerType == Timer.ShortBreak) {
            this.shortBreakButton.click();
        }
    }

    refreshTitle(time: string) {
        document.title = "BologneseTime - " + time;
    }

    initSettings() {
        Settings.storeIfNull("pomodoro", 25);
        Settings.storeIfNull("long-break", 20);
        Settings.storeIfNull("short-break", 5);
        Settings.storeIfNull("alarm", "owl");
        Settings.storeIfNull("volume", 0.5);
        Settings.storeIfNull("pomodoro_auto", false);
        Settings.storeIfNull("max_break", 4);
        Settings.storeIfNull("cur_break", 0);
        Settings.storeIfNull("timer-in-title", false);
        Settings.storeIfNull("kill-it-alarm", false);
    }
}

window.addEventListener('DOMContentLoaded', function() {
    new Bolognese(Settings.load("pomodoro"));
});