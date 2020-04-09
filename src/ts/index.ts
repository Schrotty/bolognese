import { Howl } from 'howler';

class Bolognese {
    alarm: any;
    timer: Element;
    time: number;
    interval: number;

    counter: number;
    display: number;
    sub_dis: number;
    is_ticking: boolean;

    constructor(time: number) {
        this.timer = document.querySelector("#timer");

        document.querySelector("#pomodoro-button").addEventListener("click", () => this.updateTimer(25));
        document.querySelector("#l-break-button").addEventListener("click", () => this.updateTimer(20));
        document.querySelector("#s-break-button").addEventListener("click", () => this.updateTimer(5));

        document.querySelector("#start").addEventListener("click", () => this.startTimer());
        document.querySelector("#stop").addEventListener("click", () => this.stopTimer());
        document.querySelector("#reset").addEventListener("click", () => this.resetTimer());

        this.alarm = new Howl({
            volume: 0.5,
            html5: true,
            src: ['sounds/owl.mp3']
        });

        this.time = time;
        this.initTimer();
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
    
                this.timer.textContent = pre + ":" + sub;
                if(this.counter === 0) {
                    clearInterval(this.interval);
    
                    this.alarm.play();
                    this.is_ticking = false;
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
    
    updateTimer(t: number) {
        this.stopTimer();
    
        this.time = t;
    
        var value = t.toString();
        if (t < 10) value = 0 + value;
        this.timer.textContent = value + ":" + "00"
    
        this.initTimer();
    }
}

new Bolognese(25);