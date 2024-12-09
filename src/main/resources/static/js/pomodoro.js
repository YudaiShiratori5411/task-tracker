class PomodoroTimer {
    constructor(taskId) {
        console.log('PomodoroTimer initialized with taskId:', taskId);
        this.taskId = taskId;

        // 基本設定
        this.workDuration = 25 * 60;
        this.breakDuration = 5 * 60;
        this.timeLeft = this.workDuration;
        this.isRunning = false;
        this.isBreak = false;
        this.currentSessionId = null;
        
        this.restoreState();
        this.initializeElements();
        this.loadSettings();
        this.requestNotificationPermission();
        this.updateDisplay();
        
        // 保存された状態の復元を試みる
        const restored = this.restoreState();
        if (restored) {
            console.log('State restored successfully');
            this.updateDisplay(); // 復元した状態を表示に反映
            if (this.isRunning) {
                this.start(); // タイマーが実行中だった場合は再開
            }
        }
        
        // 自動保存の設定
        this.setupAutoSave();
        this.setupBeforeUnloadHandler();
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
                // リセットボタンの初期状態を設定
                this.resetButton.disabled = this.timeLeft === this.workDuration;
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
    
        // 状態の保存

    saveState() {
        const state = {
            taskId: this.taskId,
            timeLeft: this.timeLeft,
            isBreak: this.isBreak,
            isRunning: this.isRunning,
            currentSessionId: this.currentSessionId,
            lastSaved: new Date().getTime(),
            workDuration: this.workDuration,
            breakDuration: this.breakDuration
        };
        try {
            localStorage.setItem(`pomodoroState_${this.taskId}`, JSON.stringify(state));
            console.log('State saved:', state);
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    restoreState() {
        try {
            const savedState = localStorage.getItem(`pomodoroState_${this.taskId}`);
            console.log('Found saved state:', savedState);
            
            if (savedState) {
                const state = JSON.parse(savedState);
                const timePassed = Math.floor((new Date().getTime() - state.lastSaved) / 1000);
                
                this.isBreak = state.isBreak;
                this.currentSessionId = state.currentSessionId;
                this.workDuration = state.workDuration;
                this.breakDuration = state.breakDuration;
                this.isRunning = state.isRunning;
                
                // 経過時間を考慮して残り時間を計算
                if (this.isRunning) {
                    this.timeLeft = Math.max(0, state.timeLeft - timePassed);
                } else {
                    this.timeLeft = state.timeLeft;
                }

                // 状態復元後にリセットボタンの状態を更新
                if (this.resetButton) {
                    this.resetButton.disabled = false;
                }
                
                console.log('Restored state:', {
                    timeLeft: this.timeLeft,
                    isBreak: this.isBreak,
                    isRunning: this.isRunning,
                    timePassed
                });
                
                return true;
            }
        } catch (error) {
            console.error('Error restoring state:', error);
        }
        return false;
    }
    
        // 定期的な状態の保存を設定
    setupAutoSave() {
        // 定期的な状態保存
        setInterval(() => {
            if (this.timeLeft > 0) {
                this.saveState();
            }
        }, 1000);
    }

    setupBeforeUnloadHandler() {
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });
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

    // タイマー開始処理の更新
    start() {
        console.log('Starting timer');
        if (!this.isRunning) {
            this.isRunning = true;
            if (this.startButton) this.startButton.style.display = 'none';
            if (this.pauseButton) this.pauseButton.style.display = 'inline-block';
            if (this.resetButton) this.resetButton.disabled = false;
            
            if (!this.isBreak && !this.currentSessionId) {
                this.startNewSession();
            }
            
            this.timer = setInterval(() => {
                this.tick();
                this.saveState();
            }, 1000);
            
            if (this.timerCircle) {
                this.timerCircle.classList.add('active');
            }
        }
    }

    // 一時停止処理の更新
    pause() {
        console.log('Pausing timer');
        if (this.isRunning) {
            this.isRunning = false;
            if (this.startButton) this.startButton.style.display = 'inline-block';
            if (this.pauseButton) this.pauseButton.style.display = 'none';
            clearInterval(this.timer);
            if (this.timerCircle) {
                this.timerCircle.classList.remove('active');
            }
            this.saveState();
        }
    }

    reset() {
        console.log('Resetting timer');
        // タイマーが実行中なら停止
        if (this.isRunning) {
            this.pause();
        }

        // タイマーをリセット
        this.timeLeft = this.isBreak ? this.breakDuration : this.workDuration;
        this.updateDisplay();
        
        // セッション関連の処理
        if (!this.isBreak && this.currentSessionId) {
            this.interruptSession();
        }

        // 状態をリセット
        this.isRunning = false;
        if (this.startButton) this.startButton.style.display = 'inline-block';
        if (this.pauseButton) this.pauseButton.style.display = 'none';
        if (this.resetButton) this.resetButton.disabled = true;
        if (this.timerCircle) this.timerCircle.classList.remove('active');

        // 保存された状態をクリア
        localStorage.removeItem(`pomodoroState_${this.taskId}`);
        
        console.log('Timer reset complete');
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
        if (this.timeDisplay) {
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            this.timeDisplay.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (this.timerStatus) {
                this.timerStatus.textContent = this.isBreak ? '休憩時間' : '作業時間';
            }

            // プログレスバーの更新
            if (this.timerCircle) {
                const totalTime = this.isBreak ? this.breakDuration : this.workDuration;
                const progress = ((totalTime - this.timeLeft) / totalTime) * 100;
                this.timerCircle.style.background = 
                    `conic-gradient(#28a745 ${progress}%, #e9ecef ${progress}%)`;
            }

            // リセットボタンの状態を更新
            if (this.resetButton) {
                const isDefaultState = this.timeLeft === (this.isBreak ? this.breakDuration : this.workDuration);
                this.resetButton.disabled = isDefaultState;
            }

            document.title = `(${this.timeDisplay.textContent}) ${this.timerStatus.textContent} - Pomodoro`;
        }
    }

    // セッション完了処理の更新
    async completeInterval() {
        this.pause();
        this.playNotification();
        
        if (!this.isBreak) {
            await this.completeSession();
            this.showNotification('作業セッション完了！', '休憩時間です');
            this.isBreak = true;
            this.timeLeft = this.breakDuration;
            this.currentSessionId = null;
        } else {
            this.showNotification('休憩時間終了！', '新しいセッションを開始しましょう');
            this.isBreak = false;
            this.timeLeft = this.workDuration;
        }
        
        this.updateDisplay();
        this.resetButton.disabled = true;
        this.saveState();
    }

    // ページを離れる前の処理
    handleBeforeUnload() {
        if (this.isRunning) {
            this.saveState();
        }
    }

    async startNewSession() {
        try {
            console.log('Starting new session for taskId:', taskId); // デバッグ用
            const response = await fetch(`/pomodoro/task/${taskId}/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]').content 
                }
            });
            
            console.log('Response:', response); // デバッグ用
            
            if (response.ok) {
                const data = await response.json();
                this.currentSessionId = data.id;
                console.log('Session started:', data); // デバッグ用
            }
        } catch (error) {
            console.error('Session start error:', error);
            showToast('セッションの開始に失敗しました', 'danger');
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
            await fetch(`/pomodoro/task/${this.currentSessionId}/complete`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]').content
                }
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
            const response = await fetch(`/pomodoro/task/${taskId}/sessions`);
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
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded, taskId:', taskId);
    if (typeof taskId !== 'undefined' && taskId !== null) {
        window.pomodoroTimer = new PomodoroTimer(taskId);
    } else {
        console.error('TaskId is not defined');
    }
});


