class PomodoroTimer {
    constructor() {
        this.workTime = 25 * 60; // 25分
        this.breakTime = 5 * 60; // 5分
        this.timeLeft = this.workTime;
        this.isRunning = false;
        this.isBreak = false;
        this.timer = null;
        this.sessionId = null;
        
        this.initializeElements();
        this.initializeEventListeners();
        this.requestNotificationPermission();
    }
    
    initializeElements() {
        this.timeDisplay = document.getElementById('timeDisplay');
        this.startButton = document.getElementById('startButton');
        this.pauseButton = document.getElementById('pauseButton');
        this.resetButton = document.getElementById('resetButton');
        this.streakElement = document.getElementById('streak');
    }
    
    initializeEventListeners() {
        this.startButton.addEventListener('click', () => this.start());
        this.pauseButton.addEventListener('click', () => this.pause());
        this.resetButton.addEventListener('click', () => this.reset());
        
        // ページを離れる前の警告
        window.addEventListener('beforeunload', (e) => {
            if (this.isRunning) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }
    
    async requestNotificationPermission() {
        if ('Notification' in window) {
            await Notification.requestPermission();
        }
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startButton.style.display = 'none';
            this.pauseButton.style.display = 'inline-block';
            this.resetButton.disabled = false;
            
            if (!this.isBreak && !this.sessionId) {
                this.startNewSession();
            }
            
            this.timer = setInterval(() => this.tick(), 1000);
        }
    }
    
    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.startButton.style.display = 'inline-block';
            this.pauseButton.style.display = 'none';
            clearInterval(this.timer);
        }
    }
    
    reset() {
        this.pause();
        this.timeLeft = this.isBreak ? this.breakTime : this.workTime;
        this.updateDisplay();
        this.resetButton.disabled = true;
        
        if (this.sessionId) {
            this.interruptSession();
        }
    }
    
    tick() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.updateDisplay();
            this.updateProgressCircle();
        } else {
            this.completeSession();
        }
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timeDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // タイトルも更新
        document.title = `(${this.timeDisplay.textContent}) ポモドーロタイマー`;
    }
    
    updateProgressCircle() {
        const totalTime = this.isBreak ? this.breakTime : this.workTime;
        const progress = (totalTime - this.timeLeft) / totalTime;
        const circle = document.querySelector('.timer-circle');
        circle.style.background = `conic-gradient(
            #28a745 ${progress * 360}deg,
            #e9ecef ${progress * 360}deg
        )`;
    }
    
    async startNewSession() {
        try {
            const response = await fetch(`/pomodoro/${taskId}/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]').content
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.sessionId = data.id;
            }
        } catch (error) {
            console.error('Error starting session:', error);
            showToast('セッションの開始に失敗しました', 'danger');
        }
    }
    
    async completeSession() {
        this.pause();
        
        if (!this.isBreak) {
            // 作業セッション完了
            try {
                await fetch(`/pomodoro/${this.sessionId}/complete`, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]').content
                    }
                });
                
                this.showNotification('作業セッション完了！', '休憩時間です');
                this.isBreak = true;
                this.timeLeft = this.breakTime;
                this.sessionId = null;
                await this.updateStats();
            } catch (error) {
                console.error('Error completing session:', error);
                showToast('セッションの完了に失敗しました', 'danger');
            }
        } else {
            // 休憩セッション完了
            this.showNotification('休憩時間終了！', '新しいセッションを開始しましょう');
            this.isBreak = false;
            this.timeLeft = this.workTime;
        }
        
        this.updateDisplay();
        this.resetButton.disabled = true;
    }
    
    async interruptSession() {
        if (this.sessionId) {
            try {
                await fetch(`/pomodoro/${this.sessionId}/interrupt`, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]').content
                    }
                });
                this.sessionId = null;
            } catch (error) {
                console.error('Error interrupting session:', error);
            }
        }
    }
    
    showNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body });
        }
        
        // 音声通知
        const audio = new Audio('/sound/notification.mp3');
        audio.play();
    }
    
    async updateStats() {
        try {
            const response = await fetch('/pomodoro/stats');
            const stats = await response.json();
            
            document.getElementById('todaysSessions').textContent = stats.todaysSessions;
            document.getElementById('totalFocusTime').textContent = `${stats.totalFocusTime}分`;
            this.streakElement.textContent = stats.streak;
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }
}

// タイマーのインスタンス化
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});