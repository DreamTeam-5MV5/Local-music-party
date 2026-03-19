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

// Обработка формы обратной связи с EmailJS
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('feedbackForm');
  
  if (form) {
    form.addEventListener('submit', async function(event) {
      event.preventDefault();

      // Получаем значения полей
      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('email').value.trim();
      const question = document.getElementById('question').value.trim();

      // Валидация: имя, email и вопрос обязательны
      if (!name || !email || !question) {
        alert('Пожалуйста, заполните имя, email и вопрос.');
        return;
      }

      // Подготовка данных для EmailJS
      const templateParams = {
        name: name,
        phone: phone || 'не указан',
        email: email,
        request: question
      };

      try {
        // Используем emailjs.sendForm или emailjs.send
        const serviceID = 'service_2quudzn';     
        const templateID = 'template_ny8s8un';   
        
        // Отправка через EmailJS
        const response = await emailjs.send(serviceID, templateID, templateParams, {
          publicKey: 'YSgl9KoviO11QTuS1'        
        });

        console.log('Успешно отправлено!', response.status, response.text);
        alert('Спасибо! Мы получили ваш вопрос и свяжемся с вами.');
        form.reset(); // очищаем форму
        
      } catch (error) {
        console.error('Ошибка при отправке:', error);
        alert('Произошла ошибка при отправке. Попробуйте позже или напишите нам в Telegram.');
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