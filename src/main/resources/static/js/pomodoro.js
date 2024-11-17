class PomodoroTimer {
    constructor(taskId) {
        console.log('PomodoroTimer initialized with taskId:', taskId);
        this.taskId = taskId;

        // 基本設定
        this.workDuration = 25 * 60; // 25分をデフォルトに
        this.breakDuration = 5 * 60; // 5分をデフォルトに
        this.timeLeft = this.workDuration;
        this.isRunning = false;
        this.isBreak = false;
        this.currentSessionId = null;

        // 初期化処理
        this.initializeElements();
        this.loadSettings();
        this.requestNotificationPermission();
        this.updateDisplay(); // 初期表示の更新
    }

    initializeElements() {
        // すべての要素取得を試み、結果をログ出力
        try {
            // タイマー表示関連
            this.timeDisplay = document.getElementById('timeDisplay');
            console.log('timeDisplay found:', !!this.timeDisplay);

            this.timerStatus = document.getElementById('timerStatus');
            console.log('timerStatus found:', !!this.timerStatus);

            this.timerCircle = document.querySelector('.timer-circle');
            console.log('timerCircle found:', !!this.timerCircle);

            // コントロールボタン
            this.startButton = document.getElementById('startButton');
            console.log('startButton found:', !!this.startButton);
            if (this.startButton) {
                this.startButton.addEventListener('click', () => {
                    console.log('Start button clicked');
                    this.start();
                });
            }

            this.pauseButton = document.getElementById('pauseButton');
            console.log('pauseButton found:', !!this.pauseButton);
            if (this.pauseButton) {
                this.pauseButton.addEventListener('click', () => {
                    console.log('Pause button clicked');
                    this.pause();
                });
            }

            this.resetButton = document.getElementById('resetButton');
            console.log('resetButton found:', !!this.resetButton);
            if (this.resetButton) {
                this.resetButton.addEventListener('click', () => {
                    console.log('Reset button clicked');
                    this.reset();
                });
            }

            // 設定関連
            this.workDurationInput = document.getElementById('workDuration');
            console.log('workDurationInput found:', !!this.workDurationInput);
            if (this.workDurationInput) {
                this.workDurationInput.addEventListener('change', () => this.updateSettings());
            }

            this.breakDurationInput = document.getElementById('breakDuration');
            console.log('breakDurationInput found:', !!this.breakDurationInput);
            if (this.breakDurationInput) {
                this.breakDurationInput.addEventListener('change', () => this.updateSettings());
            }

            this.soundSelect = document.getElementById('soundSelect');
            console.log('soundSelect found:', !!this.soundSelect);
            if (this.soundSelect) {
                this.soundSelect.addEventListener('change', () => this.updateSound());
            }

            this.volumeControl = document.getElementById('volumeControl');
            console.log('volumeControl found:', !!this.volumeControl);
            if (this.volumeControl) {
                this.volumeControl.addEventListener('input', () => this.updateVolume());
            }

            this.volumeLevel = document.getElementById('volumeLevel');
            console.log('volumeLevel found:', !!this.volumeLevel);

            // 通知音
            this.notificationSound = document.getElementById('notificationSound');
            console.log('notificationSound found:', !!this.notificationSound);

            // ページを離れる前の警告設定
            window.addEventListener('beforeunload', (e) => {
                if (this.isRunning) {
                    e.preventDefault();
                    e.returnValue = '進行中のセッションがあります。よろしいですか？';
                }
            });

        } catch (error) {
            console.error('Error initializing elements:', error);
        }

        console.log('Elements initialization completed');
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            await Notification.requestPermission();
        }
    }

    loadSettings() {
        try {
            // ローカルストレージから設定を読み込み
            const savedWork = localStorage.getItem('workDuration');
            const savedBreak = localStorage.getItem('breakDuration');
            const savedSound = localStorage.getItem('soundChoice');
            const savedVolume = localStorage.getItem('volume');

            if (this.workDurationInput && savedWork) {
                this.workDurationInput.value = savedWork;
                this.workDuration = savedWork * 60;
            }

            if (this.breakDurationInput && savedBreak) {
                this.breakDurationInput.value = savedBreak;
                this.breakDuration = savedBreak * 60;
            }

            if (this.soundSelect && savedSound) {
                this.soundSelect.value = savedSound;
            }

            if (this.volumeControl && savedVolume) {
                this.volumeControl.value = savedVolume;
                if (this.volumeLevel) {
                    this.volumeLevel.textContent = savedVolume;
                }
                if (this.notificationSound) {
                    this.notificationSound.volume = savedVolume / 100;
                }
            }

            this.timeLeft = this.workDuration;
            console.log('Settings loaded successfully');
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    updateSettings() {
        this.workDuration = this.workDurationInput.value * 60;
        this.breakDuration = this.breakDurationInput.value * 60;
        
        if (!this.isRunning) {
            this.timeLeft = this.isBreak ? this.breakDuration : this.workDuration;
            this.updateDisplay();
        }

        // 設定を保存
        localStorage.setItem('workDuration', this.workDurationInput.value);
        localStorage.setItem('breakDuration', this.breakDurationInput.value);
    }

    updateSound() {
        const soundFile = this.soundSelect.value;
        this.notificationSound.src = `/sound/${soundFile}`;
        localStorage.setItem('soundChoice', soundFile);
    }

    updateVolume() {
        const volume = this.volumeControl.value;
        this.volumeLevel.textContent = volume;
        if (this.notificationSound) this.notificationSound.volume = volume / 100;
        localStorage.setItem('volume', volume);
    }

    async start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startButton.style.display = 'none';
            this.pauseButton.style.display = 'inline-block';
            this.resetButton.disabled = false;
            
            if (!this.isBreak) {
                await this.startNewSession();
            }
            
            this.timer = setInterval(() => this.tick(), 1000);
            this.timerCircle.classList.add('active');
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.startButton.style.display = 'inline-block';
            this.pauseButton.style.display = 'none';
            clearInterval(this.timer);
            this.timerCircle.classList.remove('active');
        }
    }

    reset() {
        this.pause();
        this.timeLeft = this.isBreak ? this.breakDuration : this.workDuration;
        this.updateDisplay();
        this.resetButton.disabled = true;
        
        if (!this.isBreak && this.currentSessionId) {
            this.interruptSession();
        }
    }

    tick() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.updateDisplay();
        } else {
            this.completeInterval();
        }
    }

    updateDisplay() {
        // 時間表示の更新
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timeDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // ステータス表示の更新
        this.timerStatus.textContent = this.isBreak ? '休憩時間' : '作業時間';
        
        // プログレスバーの更新
        const totalTime = this.isBreak ? this.breakDuration : this.workDuration;
        const progress = ((totalTime - this.timeLeft) / totalTime) * 100;
        this.timerCircle.style.background = 
            `conic-gradient(#28a745 ${progress}%, #e9ecef ${progress}%)`;
        
        // タブタイトルの更新
        document.title = `(${this.timeDisplay.textContent}) ${this.timerStatus.textContent} - Pomodoro`;
    }

    async completeInterval() {
        this.pause();
        this.playNotification();
        
        if (!this.isBreak) {
            // 作業セッション完了
            await this.completeSession();
            this.showNotification('作業セッション完了！', '休憩時間です');
            this.isBreak = true;
            this.timeLeft = this.breakDuration;
        } else {
            // 休憩セッション完了
            this.showNotification('休憩時間終了！', '新しいセッションを開始しましょう');
            this.isBreak = false;
            this.timeLeft = this.workDuration;
        }
        
        this.updateDisplay();
        this.resetButton.disabled = true;
        this.currentSessionId = null;
    }

    async startNewSession() {
        try {
            const response = await fetch(`/pomodoro/${this.taskId}/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // CSRFトークンがある場合は追加
                    ...(document.querySelector('meta[name="_csrf"]') && {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]').content
                    })
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.currentSessionId = data.id;
                console.log('セッション開始:', this.currentSessionId); // デバッグ用
            } else {
                throw new Error('セッション開始に失敗しました');
            }
        } catch (error) {
            console.error('セッション開始エラー:', error);
            this.showToast('セッションの開始に失敗しました', 'danger');
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container') 
            || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '11';
        document.body.appendChild(container);
        return container;
    }

    async completeSession() {
        if (this.currentSessionId) {
            try {
                await fetch(`/pomodoro/${this.currentSessionId}/complete`, {
                    method: 'POST'
                });
                this.updateSessionHistory();
            } catch (error) {
                console.error('セッション完了エラー:', error);
                showToast('セッションの完了に失敗しました', 'danger');
            }
        }
    }

    async interruptSession() {
        if (this.currentSessionId) {
            try {
                await fetch(`/pomodoro/${this.currentSessionId}/interrupt`, {
                    method: 'POST'
                });
                this.updateSessionHistory();
            } catch (error) {
                console.error('セッション中断エラー:', error);
            }
        }
    }

    playNotification() {
        if (this.notificationSound) {
            this.notificationSound.play().catch(error => {
                console.error('通知音の再生エラー:', error);
            });
        }
    }

    showNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body });
        }
    }

    async updateSessionHistory() {
        try {
            const response = await fetch(`/pomodoro/${taskId}/sessions`);
            const sessions = await response.json();
            // セッション履歴のUIを更新
            const historyBody = document.getElementById('sessionHistory');
            if (historyBody) {
                historyBody.innerHTML = sessions.map(session => `
                    <tr>
                        <td>${this.formatTime(session.startTime)}</td>
                        <td>${session.endTime ? this.formatTime(session.endTime) : '-'}</td>
                        <td>
                            <span class="badge ${session.completed ? 'bg-success' : 'bg-warning'}">
                                ${session.completed ? '完了' : '中断'}
                            </span>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('履歴の更新エラー:', error);
        }
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    }
}

// タイマーのインスタンス化
// インスタンス化部分も修正
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    if (typeof taskId !== 'undefined' && taskId !== null) {
        console.log('Creating PomodoroTimer instance with taskId:', taskId);
        window.pomodoroTimer = new PomodoroTimer(taskId);
    } else {
        console.error('TaskId is not defined');
    }
});


