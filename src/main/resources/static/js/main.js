document.addEventListener('DOMContentLoaded', function() {
    // ドラッグ&ドロップの初期化
    initializeDragAndDrop();
    
    // タグ管理の初期化
    initializeTagManagement();
    
    // トーストコンテナの作成
    createToastContainer();
    
    // フィルターボタンの初期化
    initializePriorityFilter();
    
    initializePrioritySort();
    
    initializePriorityChange();
    
    initializeTaskCardHover();
    
    initializeTaskActions();
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


function initializePriorityFilter() {
    const filterButtons = document.querySelectorAll('[data-priority]');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // アクティブなボタンのスタイルを更新
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const selectedPriority = this.dataset.priority;
            filterTasksByPriority(selectedPriority);
        });
    });
}

function filterTasksByPriority(priority) {
    const taskLists = document.querySelectorAll('.task-list');
    
    taskLists.forEach(taskList => {
        const cards = taskList.querySelectorAll('.task-card');
        const emptyMessage = taskList.querySelector('.text-center.text-muted');
        let visibleCards = 0;

        cards.forEach(card => {
            if (priority === 'ALL') {
                card.style.display = '';
                visibleCards++;
            } else {
                if (card.classList.contains(`priority-${priority}`)) {
                    card.style.display = '';
                    visibleCards++;
                } else {
                    card.style.display = 'none';
                }
            }
        });

        // 表示されているカードの数に応じてメッセージの表示/非表示を切り替え
        if (emptyMessage) {
            emptyMessage.style.display = visibleCards === 0 ? '' : 'none';
        }
    });
}

function updateEmptyStateMessages() {
    const taskLists = document.querySelectorAll('.task-list');
    
    taskLists.forEach(list => {
        const visibleTasks = list.querySelectorAll('.task-card[style="display: "]').length;
        const emptyMessage = list.querySelector('.empty-state');
        
        if (visibleTasks === 0) {
            if (!emptyMessage) {
                const message = document.createElement('div');
                message.className = 'empty-state text-center text-muted py-3';
                message.innerHTML = 'タスクがありません';
                list.appendChild(message);
            }
        } else {
            if (emptyMessage) {
                emptyMessage.remove();
            }
        }
    });
}



// 優先度の重み付け
const PRIORITY_WEIGHTS = {
    'HIGH': 3,
    'MEDIUM': 2,
    'LOW': 1
};

function initializePrioritySort() {
    const sortButton = document.getElementById('sortByPriority');
    if (sortButton) {
        sortButton.addEventListener('click', function() {
            this.classList.toggle('active');
            const isDescending = this.classList.contains('active');
            sortTasksByPriority(isDescending);
            
            // ソートアイコンの更新
            const icon = this.querySelector('i');
            icon.className = isDescending ? 
                'fas fa-sort-amount-down' : 'fas fa-sort-amount-up';
        });
    }
}

function sortTasksByPriority(isDescending) {
    const taskLists = document.querySelectorAll('.task-list');
    
    taskLists.forEach(list => {
        const tasks = Array.from(list.querySelectorAll('.task-card'));
        
        tasks.sort((a, b) => {
            const priorityA = getPriorityWeight(a);
            const priorityB = getPriorityWeight(b);
            
            // 期限による二次ソート
            if (priorityA === priorityB) {
                const deadlineA = getDeadline(a);
                const deadlineB = getDeadline(b);
                return deadlineA - deadlineB;
            }
            
            return isDescending ? 
                priorityB - priorityA : 
                priorityA - priorityB;
        });
        
        // DOMの更新
        tasks.forEach(task => {
            task.style.opacity = '0';
            list.appendChild(task);
            // フェードインアニメーション
            setTimeout(() => {
                task.style.opacity = '1';
            }, 50);
        });
    });
}

function getPriorityWeight(taskElement) {
    if (taskElement.classList.contains('priority-HIGH')) return PRIORITY_WEIGHTS.HIGH;
    if (taskElement.classList.contains('priority-MEDIUM')) return PRIORITY_WEIGHTS.MEDIUM;
    if (taskElement.classList.contains('priority-LOW')) return PRIORITY_WEIGHTS.LOW;
    return 0;
}

function getDeadline(taskElement) {
    const deadlineElement = taskElement.querySelector('.task-meta span');
    if (deadlineElement) {
        return new Date(deadlineElement.textContent).getTime();
    }
    return Number.MAX_VALUE;  // 期限なしのタスクは最後に
}


function initializePriorityChange() {
    // 優先度変更ボタンの作成と配置
    document.querySelectorAll('.task-card').forEach(card => {
        const actionsDiv = card.querySelector('.task-actions');
        const priorityButton = createPriorityButton(card);
        actionsDiv.insertBefore(priorityButton, actionsDiv.firstChild);

        // ドロップダウンボタンのイベントリスナー
        const dropdownToggle = priorityButton.querySelector('.dropdown-toggle');
        if (dropdownToggle) {
            // ドロップダウンが開いたときのイベント
            dropdownToggle.addEventListener('shown.bs.dropdown', function() {
                card.dataset.dropdownOpen = 'true';
                card.style.zIndex = '1010';
            });

            // ドロップダウンが閉じたときのイベント
            dropdownToggle.addEventListener('hidden.bs.dropdown', function() {
                delete card.dataset.dropdownOpen;
                card.style.zIndex = '';
            });
        }

        // 優先度変更のイベントリスナー
        priorityButton.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                e.preventDefault();
                const newPriority = e.target.closest('.dropdown-item').dataset.priority;
                const dropdown = e.target.closest('.dropdown');
                const bootstrapDropdown = bootstrap.Dropdown.getInstance(dropdown.querySelector('.dropdown-toggle'));
                
                await changePriority(card, newPriority);
                
                // 優先度変更後にドロップダウンを閉じる
                if (bootstrapDropdown) {
                    bootstrapDropdown.hide();
                }
            });
        });
    });

    // 他のタスクカードへのホバー時の処理
    document.querySelectorAll('.task-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            // 他の全てのタスクカードのドロップダウンを閉じる
            document.querySelectorAll('.task-card').forEach(otherCard => {
                if (otherCard !== card && otherCard.dataset.dropdownOpen === 'true') {
                    const dropdownToggle = otherCard.querySelector('.dropdown-toggle');
                    if (dropdownToggle) {
                        const bootstrapDropdown = bootstrap.Dropdown.getInstance(dropdownToggle);
                        if (bootstrapDropdown) {
                            bootstrapDropdown.hide();
                        }
                    }
                }
            });
        });
    });
}


function createPriorityButton(card) {
    const currentPriority = getPriorityFromCard(card);
    const button = document.createElement('div');
    button.className = 'dropdown';
    button.innerHTML = `
        <button class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                type="button" 
                data-bs-toggle="dropdown">
            <i class="fas fa-flag"></i> 優先度
        </button>
        <ul class="dropdown-menu">
            <li><a class="dropdown-item ${currentPriority === 'HIGH' ? 'active' : ''}" 
                   href="#" data-priority="HIGH">
                   <i class="fas fa-arrow-up text-danger"></i> 高
            </a></li>
            <li><a class="dropdown-item ${currentPriority === 'MEDIUM' ? 'active' : ''}" 
                   href="#" data-priority="MEDIUM">
                   <i class="fas fa-minus text-warning"></i> 中
            </a></li>
            <li><a class="dropdown-item ${currentPriority === 'LOW' ? 'active' : ''}" 
                   href="#" data-priority="LOW">
                   <i class="fas fa-arrow-down text-secondary"></i> 低
            </a></li>
        </ul>
    `;

    // ドロップダウンのイベントリスナーを設定
    button.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            const newPriority = e.target.closest('.dropdown-item').dataset.priority;
            const dropdown = e.target.closest('.dropdown');
            const bootstrapDropdown = bootstrap.Dropdown.getInstance(dropdown.querySelector('.dropdown-toggle'));
            
            await changePriority(card, newPriority);
            
            // 優先度変更後にドロップダウンを閉じる
            if (bootstrapDropdown) {
                bootstrapDropdown.hide();
            }
        });
    });

    return button;
}


async function changePriority(card, newPriority) {
    const taskId = card.dataset.taskId;
    try {
        const response = await fetch(`/tasks/${taskId}/priority`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `priority=${newPriority}`
        });

        if (!response.ok) {
            throw new Error('優先度の更新に失敗しました');
        }

        // アニメーションと見た目の更新
        updateCardPriority(card, newPriority);
        showToast('優先度を更新しました', 'success');
    } catch (error) {
        console.error('Error:', error);
        showToast('優先度の更新に失敗しました', 'danger');
    }
}

function updateCardPriority(card, newPriority) {
    // 現在の優先度クラスを削除
    card.classList.remove('priority-HIGH', 'priority-MEDIUM', 'priority-LOW');
    // 新しい優先度クラスを追加
    card.classList.add(`priority-${newPriority}`);

    // 優先度バッジの更新
    const badge = card.querySelector('.priority-badge');
    if (badge) {
        // クラスの更新
        badge.className = `priority-badge priority-${newPriority}`;
        
        // アイコンの更新
        const icon = badge.querySelector('i');
        if (icon) {
            icon.className = 'fas ' + 
                (newPriority === 'HIGH' ? 'fa-arrow-up' : 
                 newPriority === 'MEDIUM' ? 'fa-minus' : 
                 'fa-arrow-down');
        }

        // テキストの更新
        const textSpan = badge.querySelector('span');
        if (textSpan) {
            textSpan.textContent = 
                newPriority === 'HIGH' ? '高' :
                newPriority === 'MEDIUM' ? '中' : '低';
        }
    }

    // ドロップダウンメニューの更新
    const dropdownItems = card.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        const itemPriority = item.dataset.priority;
        if (itemPriority === newPriority) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // アニメーションの適用
    card.classList.add('priority-change');
    const cardBody = card.querySelector('.card-body');
    if (cardBody) {
        cardBody.classList.add('priority-flash');
    }

    // アニメーションクラスの削除
    setTimeout(() => {
        card.classList.remove('priority-change');
        if (cardBody) {
            cardBody.classList.remove('priority-flash');
        }
    }, 500);

    // カードのスタイル更新
    const cardElement = card.querySelector('.card');
    if (cardElement) {
        // ボーダーカラーの更新
        const borderColor = 
            newPriority === 'HIGH' ? '#dc3545' :
            newPriority === 'MEDIUM' ? '#ffc107' : '#6c757d';
        cardElement.style.borderLeftColor = borderColor;
    }
}

function getPriorityFromCard(card) {
    if (card.classList.contains('priority-HIGH')) return 'HIGH';
    if (card.classList.contains('priority-MEDIUM')) return 'MEDIUM';
    if (card.classList.contains('priority-LOW')) return 'LOW';
    return 'MEDIUM'; // デフォルト
}

function getPriorityDisplayName(priority) {
    const names = {
        'HIGH': '高',
        'MEDIUM': '中',
        'LOW': '低'
    };
    return names[priority];
}



function initializeTaskCardHover() {
    const taskCards = document.querySelectorAll('.task-card');
    
    taskCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // 他のすべてのタスクカードのドロップダウンを閉じる
            taskCards.forEach(otherCard => {
                if (otherCard !== card) {
                    const dropdown = otherCard.querySelector('.dropdown');
                    if (dropdown) {
                        const dropdownMenu = dropdown.querySelector('.dropdown-menu');
                        const bootstrapDropdown = bootstrap.Dropdown.getInstance(dropdown.querySelector('.dropdown-toggle'));
                        if (bootstrapDropdown && dropdownMenu.classList.contains('show')) {
                            bootstrapDropdown.hide();
                        }
                    }
                }
            });
        });
    });

    // ドロップダウンが開いたときのイベントを追加
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('shown.bs.dropdown', function() {
            const currentCard = this.closest('.task-card');
            if (currentCard) {
                currentCard.dataset.dropdownOpen = 'true';
            }
        });

        toggle.addEventListener('hidden.bs.dropdown', function() {
            const currentCard = this.closest('.task-card');
            if (currentCard) {
                delete currentCard.dataset.dropdownOpen;
            }
        });
    });
}


function initializeTaskActions() {
    // 全てのタスクカードに対してアクションボタンを初期化
    document.querySelectorAll('.task-card').forEach(card => {
        const actionsDiv = card.querySelector('.task-actions');
        if (!actionsDiv) return;

        // 優先度ボタンを追加（既存のボタンがない場合のみ）
        if (!actionsDiv.querySelector('.dropdown')) {
            const priorityButton = createPriorityButton(card);
            actionsDiv.insertBefore(priorityButton, actionsDiv.firstChild);
        }

        // 編集ボタンのアイコンを追加/更新
        const editButton = actionsDiv.querySelector('a[href*="/edit/"]');
        if (editButton && !editButton.querySelector('.fas.fa-edit')) {
            editButton.innerHTML = '<i class="fas fa-edit"></i> 編集';
        }

        // 削除ボタンのアイコンを追加/更新
        const deleteButton = actionsDiv.querySelector('button[onclick*="deleteTask"]');
        if (deleteButton && !deleteButton.querySelector('.fas.fa-trash')) {
            deleteButton.innerHTML = '<i class="fas fa-trash"></i> 削除';
        }
    });
}

function createPriorityButton(card) {
    const currentPriority = getPriorityFromCard(card);
    const button = document.createElement('div');
    button.className = 'dropdown me-2';
    button.innerHTML = `
        <button class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                type="button" 
                data-bs-toggle="dropdown">
            <i class="fas fa-flag text-dark"></i> 優先度  <!-- アイコンの色を dark に変更 -->
        </button>
        <ul class="dropdown-menu">
            <li><a class="dropdown-item ${currentPriority === 'HIGH' ? 'active' : ''}" 
                   href="#" data-priority="HIGH">
                   <i class="fas fa-arrow-up text-danger"></i> 高
            </a></li>
            <li><a class="dropdown-item ${currentPriority === 'MEDIUM' ? 'active' : ''}" 
                   href="#" data-priority="MEDIUM">
                   <i class="fas fa-minus text-warning"></i> 中
            </a></li>
            <li><a class="dropdown-item ${currentPriority === 'LOW' ? 'active' : ''}" 
                   href="#" data-priority="LOW">
                   <i class="fas fa-arrow-down text-secondary"></i> 低
            </a></li>
        </ul>
    `;

    // 優先度変更のイベントリスナーを設定
    button.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            const newPriority = e.target.closest('.dropdown-item').dataset.priority;
            await changePriority(card, newPriority);
        });
    });

    return button;
}



