document.addEventListener('DOMContentLoaded', function() {
    // ドラッグ&ドロップの初期化
    initializeDragAndDrop();
    
    // タグ管理の初期化
    initializeTagManagement();
    
    // トーストコンテナの作成
    createToastContainer();
});

// トーストコンテナの作成
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'position-fixed bottom-0 end-0 p-3';
    container.style.zIndex = '1050';
    document.body.appendChild(container);
    return container;
}



function initializeDragAndDrop() {
    const taskLists = document.querySelectorAll('.task-list');
    
    taskLists.forEach(taskList => {
        new Sortable(taskList, {
            group: 'tasks',  // これにより、異なるリスト間でドラッグ可能になります
            animation: 150,  // ドラッグアニメーションの時間（ミリ秒）
            ghostClass: 'task-ghost',  // ドラッグ中のプレースホルダーのクラス
            dragClass: 'task-dragging',  // ドラッグ中のアイテムのクラス
            
            onStart: function(evt) {
                evt.item.classList.add('task-dragging');
            },
            
            onEnd: function(evt) {
                const taskId = evt.item.getAttribute('data-task-id');
                const newStatus = evt.to.getAttribute('data-status');
                evt.item.classList.remove('task-dragging');
                
                // ステータス変更の場合のみ更新を実行
                if (evt.from !== evt.to) {
                    updateTaskStatus(taskId, newStatus);
                }
            }
        });
    });
}




// タスクのステータス更新
async function updateTaskStatus(taskId, newStatus) {
    try {
        const response = await fetch(`/tasks/${taskId}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `status=${newStatus}`
        });

        if (!response.ok) {
            throw new Error('ステータスの更新に失敗しました');
        }

        showToast('タスクのステータスを更新しました', 'success');
    } catch (error) {
        console.error('Error:', error);
        showToast('ステータスの更新に失敗しました', 'danger');
        // エラー時は画面をリロードして元の状態に戻す
        location.reload();
    }
}

// タスク削除
async function deleteTask(taskId) {
    if (!confirm('このタスクを削除してもよろしいですか？')) {
        return;
    }
    
    try {
        const response = await fetch(`/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]').content
            }
        });
        
        if (response.ok) {
            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
            taskElement.remove();
            showToast('タスクを削除しました', 'success');
        } else {
            throw new Error('タスクの削除に失敗しました');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('エラーが発生しました', 'danger');
    }
}

// ポモドーロタイマー開始
function startPomodoro(taskId) {
    window.location.href = `/pomodoro/${taskId}`;
}

// タグ管理機能
function initializeTagManagement() {
    const newTagForm = document.getElementById('newTagForm');
    if (newTagForm) {
        newTagForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const formData = new FormData(newTagForm);
            
            try {
                const response = await fetch('/tags', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]').content
                    }
                });
                
                if (response.ok) {
                    location.reload();
                } else {
                    throw new Error('タグの作成に失敗しました');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('エラーが発生しました', 'danger');
            }
        });
    }
}

// タグ削除
async function deleteTag(tagId) {
    if (!confirm('このタグを削除してもよろしいですか？')) {
        return;
    }
    
    try {
        const response = await fetch(`/tags/${tagId}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]').content
            }
        });
        
        if (response.ok) {
            location.reload();
        } else {
            throw new Error('タグの削除に失敗しました');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('エラーが発生しました', 'danger');
    }
}

// トースト通知の表示
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
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

    // トーストが非表示になったら要素を削除
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // 削除確認モーダルの設定
    const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    let taskToDelete = null;

    // 削除ボタンのイベントハンドラ
    window.deleteTask = function(taskId) {
        taskToDelete = taskId;
        deleteConfirmModal.show();
    };

    // 削除実行
    document.getElementById('confirmDelete')?.addEventListener('click', async function() {
        if (taskToDelete) {
            try {
                const response = await fetch(`/tasks/${taskToDelete}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    // タスクの要素を削除
                    const taskElement = document.querySelector(`[data-task-id="${taskToDelete}"]`);
                    if (taskElement) {
                        taskElement.remove();
                    }
                    showToast('タスクを削除しました', 'success');
                } else {
                    throw new Error('削除に失敗しました');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('削除中にエラーが発生しました', 'danger');
            } finally {
                deleteConfirmModal.hide();
                taskToDelete = null;
            }
        }
    });

    // トースト通知を表示する関数
    window.showToast = function(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
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

        // トーストが非表示になったら要素を削除
        toast.addEventListener('hidden.bs.toast', function() {
            toast.remove();
        });
    };
});