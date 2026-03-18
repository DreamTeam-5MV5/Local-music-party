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
    form.addEventListener('submit', async function(event) {
      event.preventDefault();

      // Получаем значения полей
      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim(); // может быть пустым
      const email = document.getElementById('email').value.trim();
      const question = document.getElementById('question').value.trim();

      // Валидация: имя, email и вопрос обязательны, телефон – нет
      if (!name || !email || !question) {
        alert('Пожалуйста, заполните имя, email и вопрос.');
        return;
      }

      // Подготовка данных для отправки
      const formData = {
        name: name,
        phone: phone || '',        // если пользователь ничего не ввёл, отправим пустую строку
        email: email,
        request: question
      };

      try {
        const response = await fetch('/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
          alert('Спасибо! Мы получили ваш вопрос и свяжемся с вами.');
          form.reset(); // очищаем форму после успеха
        } else {
          alert('Ошибка: ' + (result.message || 'Не удалось отправить форму'));
        }
      } catch (error) {
        console.error('Ошибка при отправке:', error);
        alert('Произошла ошибка при отправке. Попробуйте позже.');
      }
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