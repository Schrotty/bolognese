import { Howl } from 'howler';
import { Settings } from './settings';
var Bolognese = (function () {
    function Bolognese(time) {
        var _this = this;
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
                navigator.serviceWorker.register('/worker.js').then(function (registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, function (err) {
                    console.log('ServiceWorker registration failed: ', err);
                });
            });
        }
        if (!Settings.exists()) {
            Settings.store("pomodoro", 25);
            Settings.store("long-break", 20);
            Settings.store("short-break", 5);
            Settings.store("alarm", "owl");
            Settings.store("volume", 0.5);
        }
        Settings.storeIfNull("debug", true);
        this.timer = document.querySelector("#timer");
        this.timerSub = document.querySelector("#timer-sub");
        document.querySelector("#pomodoro-button").addEventListener("click", function () { return _this.updateTimer(Settings.load("pomodoro")); });
        document.querySelector("#l-break-button").addEventListener("click", function () { return _this.updateTimer(Settings.load("long-break")); });
        document.querySelector("#s-break-button").addEventListener("click", function () { return _this.updateTimer(Settings.load("short-break")); });
        document.querySelector("#start").addEventListener("click", function () { return _this.startTimer(); });
        document.querySelector("#stop").addEventListener("click", function () { return _this.stopTimer(); });
        document.querySelector("#reset").addEventListener("click", function () { return _this.resetTimer(); });
        document.querySelector("#settings").addEventListener("click", function () { return _this.overlayFadeIn(); });
        document.querySelector("#settings-close").addEventListener("click", function () { return _this.overlayFadeOut(); });
        document.querySelector("#c-pomodoro").addEventListener("change", function () {
            Settings.store("pomodoro", document.querySelector("#c-pomodoro").value);
        });
        document.querySelector("#c-l-break").addEventListener("change", function () {
            Settings.store("long-break", document.querySelector("#c-l-break").value);
        });
        document.querySelector("#c-s-break").addEventListener("change", function () {
            Settings.store("short-break", document.querySelector("#c-s-break").value);
        });
        document.querySelector("#custom-alarm").addEventListener("change", function () {
            Settings.store("alarm", document.querySelector("#custom-alarm").value);
        });
        document.querySelector("#volume-control").addEventListener("change", function () {
            Settings.store("volume", document.querySelector("#volume-control").value);
        });
        document.querySelectorAll(".timer").forEach(function (elem) { return _this.registerButtonhandle(elem); });
        this.indexAlarms();
        if (!window.localStorage) {
            document.querySelector("#settings-button").remove();
        }
        document.querySelector("#c-pomodoro").value = Settings.load("pomodoro");
        document.querySelector("#c-l-break").value = Settings.load("long-break");
        document.querySelector("#c-s-break").value = Settings.load("short-break");
        document.querySelector("#volume-control").value = Settings.load("volume");
        this.time = time;
        this.initTimer();
    }
    Bolognese.prototype.initTimer = function () {
        this.counter = this.time * 60;
        this.display = this.time;
        this.sub_dis = 0;
        this.is_ticking = false;
    };
    Bolognese.prototype.startTimer = function () {
        var _this = this;
        var pre;
        var sub;
        if (!this.is_ticking) {
            if (Settings.load("alarm") != "-") {
                this.alarm = new Howl({
                    volume: Settings.load("volume"),
                    html5: true,
                    src: ['sounds/' + Settings.load("alarm") + '.mp3']
                });
            }
            this.is_ticking = true;
            this.interval = setInterval(function () {
                _this.counter = _this.counter - 1;
                _this.display = Math.floor(_this.counter / 60);
                if (_this.sub_dis == 0)
                    _this.sub_dis = 60;
                _this.sub_dis--;
                pre = _this.display.toString();
                sub = _this.sub_dis.toString();
                if (_this.sub_dis < 10)
                    sub = "0" + _this.sub_dis;
                if (_this.display < 10)
                    pre = 0 + _this.display.toString();
                _this.timer.textContent = pre;
                _this.timerSub.textContent = sub;
                if (_this.counter === 0) {
                    clearInterval(_this.interval);
                    _this.alarm.play();
                    _this.is_ticking = false;
                }
            }, 1000);
        }
        ;
    };
    Bolognese.prototype.stopTimer = function () {
        this.is_ticking = false;
        clearInterval(this.interval);
    };
    Bolognese.prototype.resetTimer = function () {
        this.stopTimer();
        this.updateTimer(this.time);
    };
    Bolognese.prototype.updateTimer = function (t) {
        this.stopTimer();
        this.time = t;
        var value = t.toString();
        if (t < 10)
            value = 0 + value;
        this.timer.textContent = value;
        this.timerSub.textContent = "00";
        this.initTimer();
    };
    Bolognese.prototype.registerButtonhandle = function (element) {
        element.addEventListener("click", function () {
            document.querySelectorAll(".timer").forEach(function (elem) { return elem.classList.remove("activated"); });
            element.classList.add("activated");
        });
    };
    Bolognese.prototype.overlayFadeIn = function () {
        var btn = document.querySelector("#overlay");
        btn.classList.remove("hidden");
        this.animateCSS("#overlay", "bounceInDown", null);
    };
    Bolognese.prototype.overlayFadeOut = function () {
        var btn = document.querySelector("#overlay");
        this.animateCSS("#overlay", "bounceOutUp", function () {
            btn.classList.add("hidden");
        });
    };
    Bolognese.prototype.animateCSS = function (element, animationName, callback) {
        var node = document.querySelector(element);
        node.classList.add('animated', animationName);
        function handleAnimationEnd() {
            node.classList.remove('animated', animationName);
            node.removeEventListener('animationend', handleAnimationEnd);
            if (typeof callback === 'function')
                callback();
        }
        node.addEventListener('animationend', handleAnimationEnd);
    };
    Bolognese.prototype.indexAlarms = function () {
        var alarms = ["-", "Owl", "Duck"];
        alarms.forEach(function (a) {
            var alr = document.createElement("option");
            alr.value = a.toLowerCase();
            alr.text = a;
            if (Settings.load("alarm") == a) {
                alr.selected = true;
            }
            document.querySelector("#custom-alarm").add(alr);
        });
    };
    return Bolognese;
}());
new Bolognese(25);
//# sourceMappingURL=index.js.map