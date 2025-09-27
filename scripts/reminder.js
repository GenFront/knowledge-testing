// Таймер и логика напоминания
let seconds = 5;
const timer = setInterval(() => {
    seconds--;
    document.getElementById('countdown').textContent = seconds;
    if (seconds <= 0) {
        clearInterval(timer);
        window.location.href = 'index.html';
    }
}, 1000);