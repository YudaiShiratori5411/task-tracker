document.addEventListener('DOMContentLoaded', function() {
    initializeHabitManagement();
});

function initializeHabitManagement() {
    const newHabitForm = document.getElementById('newHabitForm');
    if (newHabitForm) {
        newHabitForm.addEventListener('submit', handleNewHabit);
    }
}

// 新規習慣の作成
async function handleNewHabit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    try {
        const response = await fetch('/habits', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]').content
            }
        });
        
        if (response.ok) {
            location.reload();
        } else {
            throw new Error('習慣の作成に失敗しました');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('エラーが発生しました', 'danger');
    }
}

// 習慣の完了マーク
async function markHabitComplete(habitId) {
    try {
        const response = await fetch(`/habits/${habitId}/complete`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]').content
            }
        });
        
        if (response.ok) {
            location.reload();
            showToast('習慣を完了しました！', 'success');
        } else {
            throw new Error('習慣の完了マークに失敗しました');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('エラーが発生しました', 'danger');
    }
}

// 習慣の削除
async function deleteHabit(habitId) {
    if (!confirm('この習慣を削除してもよろしいですか？')) {
        return;
    }
    
    try {
        const response = await fetch(`/habits/${habitId}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]').content
            }
        });
        
        if (response.ok) {
            location.reload();
            showToast('習慣を削除しました', 'success');
        } else {
            throw new Error('習慣の削除に失敗しました');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('エラーが発生しました', 'danger');
    }
}

// 習慣の編集
async function editHabit(habitId) {
    // 実装予定
}