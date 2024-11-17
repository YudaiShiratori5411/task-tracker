document.addEventListener('DOMContentLoaded', function() {
    // タスク削除機能
    window.deleteTask = function(id) {
        if (confirm('このタスクを削除してもよろしいですか？')) {
            fetch(`/tasks/${id}`, {
                method: 'DELETE'
            }).then(() => {
                location.reload();
            }).catch(error => {
                console.error('Error deleting task:', error);
                alert('タスクの削除に失敗しました。');
            });
        }
    }

    // ドラッグ&ドロップ機能の初期化（将来の拡張用）
    function initializeDragAndDrop() {
        const taskLists = document.querySelectorAll('.card-body');
        taskLists.forEach(taskList => {
            new Sortable(taskList, {
                group: 'tasks',
                animation: 150,
                ghostClass: 'task-ghost',
                onEnd: function(evt) {
                    const taskId = evt.item.getAttribute('data-task-id');
                    const newStatus = evt.to.closest('.card').getAttribute('data-status');
                    if (taskId && newStatus) {
                        updateTaskStatus(taskId, newStatus);
                    }
                }
            });
        });
    }

    // タスクステータス更新（ドラッグ&ドロップ用）
    function updateTaskStatus(taskId, newStatus) {
        fetch(`/tasks/${taskId}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `status=${newStatus}`
        }).catch(error => {
            console.error('Error updating task status:', error);
            alert('ステータスの更新に失敗しました。');
            location.reload();
        });
    }
});