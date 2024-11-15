// グローバル変数
let habitModal;

document.addEventListener('DOMContentLoaded', function() {
    // モーダルの初期化
    const modalElement = document.getElementById('habitModal');
    if (modalElement) {
        habitModal = new bootstrap.Modal(modalElement);
        
        // モーダルが閉じられたときの処理
        modalElement.addEventListener('hidden.bs.modal', function() {
            const form = document.getElementById('habitForm');
            if (form) {
                form.reset();
                form.classList.remove('was-validated');
            }
        });
    }

    // フォームのバリデーション設定
    const form = document.getElementById('habitForm');
    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            if (!form.checkValidity()) {
                event.stopPropagation();
                form.classList.add('was-validated');
                return;
            }

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form)
                });

                if (response.ok) {
                    if (habitModal) {
                        habitModal.hide();
                    }
                    showToast('習慣を作成しました', 'success');
                    window.location.reload();
                } else {
                    throw new Error('習慣の作成に失敗しました');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('エラーが発生しました', 'danger');
            }
        });
    }
});

function toggleHabitCompletion(element) {
    const habitId = element.getAttribute('data-habit-id');
    const date = element.getAttribute('data-date');
    const isCompleted = element.classList.contains('completed');

    const url = `/habits/${habitId}/${isCompleted ? 'incomplete' : 'complete'}`;
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `date=${date}`
    })
    .then(response => {
        if (response.ok) {
            element.classList.toggle('completed');
            updateStreakDisplay(habitId);
            showToast('習慣を更新しました', 'success');
            // 優先度変更後にページをリロード
            window.location.reload();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('エラーが発生しました', 'danger');
    });
}

function deleteHabit(id) {
    if (confirm('この習慣を削除してもよろしいですか？')) {
        fetch(`/habits/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                showToast('習慣を削除しました', 'success');
                window.location.reload();
            } else {
                throw new Error('削除に失敗しました');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('削除中にエラーが発生しました', 'danger');
        });
    }
}

function editHabit(habitId) {
    window.location.href = `/habits/edit/${habitId}`;
}

function updateStreakDisplay(habitId) {
    fetch(`/habits/${habitId}`)
        .then(response => response.json())
        .then(habit => {
            const streakElement = document.querySelector(`[data-habit-id="${habitId}"] .streak`);
            if (streakElement) {
                streakElement.textContent = habit.currentStreak;
            }
            
            const progressBar = document.querySelector(`[data-habit-id="${habitId}"] .progress-bar`);
            if (progressBar) {
                const completion = habit.completionRate;
                progressBar.style.width = `${completion}%`;
                progressBar.textContent = `${completion.toFixed(1)}%`;
            }
        })
        .catch(error => console.error('Error updating streak:', error));
}

function showToast(message, type) {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center border-0 bg-${type} text-white`;
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

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
    return container;
}


