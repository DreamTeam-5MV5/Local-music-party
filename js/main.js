
AOS.init({
  once: true,
  duration: 600,
  offset: 30,
  disable: window.innerWidth < 768 // отключаем на мобилках для производительности
});

// Раскрывающийся FAQ
window.toggleFaq = function(element) {
  const answer = element.nextElementSibling;
  const icon = element.querySelector('i');
  
  // Закрываем все другие
  document.querySelectorAll('.faq-answer').forEach(el => {
    if (el !== answer && el.classList.contains('show')) {
      el.classList.remove('show');
      const previousIcon = el.previousElementSibling.querySelector('i');
      if (previousIcon) {
        previousIcon.style.transform = 'rotate(0deg)';
      }
    }
  });

  answer.classList.toggle('show');
  if (icon) {
    icon.style.transform = answer.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
  }
};

// Обработка формы обратной связи
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('feedbackForm');
  
  if (form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault(); // Отменяем стандартную отправку

      // Получаем значения полей
      const name = document.getElementById('name').value.trim();
      const contact = document.getElementById('contact').value.trim();
      const question = document.getElementById('question').value.trim();

      // Валидация
      if (!name || !contact || !question) {
        alert('Пожалуйста, заполните все поля.');
        return;
      }

      console.log('Отправка формы:', { name, contact, question });

      alert('Спасибо! Мы получили ваш вопрос и свяжемся с вами.');

      // Очищаем форму
      // form.reset();
    });
  }
});

// Мобильная адаптация AOS
window.addEventListener('resize', function() {
  if (window.innerWidth < 768) {
    AOS.init({ disable: true });
  } else {
    // Включаем обратно, если был отключен
    if (AOS.refresh) {
      AOS.refresh();
    }
  }
});