document.addEventListener('DOMContentLoaded', function() {
    // フォームバリデーションの設定
    const form = document.querySelector('form.needs-validation');
    if (form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    }

    // 期限のデフォルト値設定（新規作成時のみ）
    const deadlineInput = document.getElementById('deadline');
    if (deadlineInput && !deadlineInput.value) {
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7); // 1週間後をデフォルトに
        const formattedDate = defaultDate.toISOString().slice(0, 16);
        deadlineInput.value = formattedDate;
    }
});