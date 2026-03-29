AOS.init({
  once: true,
  duration: 600,
  offset: 30,
  disable: window.innerWidth < 768
});

// === РАСКРЫТИЕ FAQ ===
window.toggleFaq = function(element) {
  const answer = element.nextElementSibling;
  const icon = element.querySelector('i');

  document.querySelectorAll('.faq-answer').forEach(el => {
    if (el !== answer && el.classList.contains('show')) {
      el.classList.remove('show');
      const previousIcon = el.previousElementSibling.querySelector('i');
      if (previousIcon) previousIcon.style.transform = 'rotate(0deg)';
    }
  });

  answer.classList.toggle('show');
  if (icon) {
    icon.style.transform = answer.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
  }
};

// === ЭКРАНИРОВАНИЕ HTML (защита от XSS) ===
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// === ЗАГРУЗКА И РЕНДЕР FAQ ИЗ БД ===
async function loadFaqs() {
  const container = document.getElementById('faq-container');
  if (!container) {
    console.error('❌ Контейнер #faq-container не найден');
    return;
  }

  // Полный URL для Railway
  const apiUrl = 'https://local-music-party-production.up.railway.app/api/faqs';

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000) // Таймаут 10 секунд
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success && Array.isArray(result.data) && result.data.length > 0) {
      container.innerHTML = '';

      result.data.forEach((faq, index) => {
        const faqItem = document.createElement('div');
        faqItem.className = 'faq-item';
        faqItem.setAttribute('data-aos', 'fade-up');
        faqItem.setAttribute('data-aos-delay', (index * 100).toString());

        faqItem.innerHTML = `
          <div class="faq-question" onclick="toggleFaq(this)">
            ${escapeHtml(faq.question)}
            <i class="fas fa-chevron-down"></i>
          </div>
          <div class="faq-answer">
            ${escapeHtml(faq.answer)}
          </div>
        `;

        container.appendChild(faqItem);
      });

      console.log(`✅ Загружено ${result.data.length} вопросов FAQ`);

      if (typeof AOS !== 'undefined' && AOS.refresh) {
        setTimeout(() => AOS.refresh(), 100);
      }
    } else {
      container.innerHTML = '<p class="text-center" style="color: var(--text-secondary);">Вопросы пока не добавлены.</p>';
    }
  } catch (error) {
    // Различаем типы ошибок
    if (error.name === 'AbortError') {
      console.error('❌ Таймаут запроса: сервер не ответил за 10 секунд');
      container.innerHTML = '<p class="text-center" style="color: var(--accent-coral);">Загрузка данных заняла слишком много времени. Попробуйте обновить страницу.</p>';
    } else if (error.message.includes('Failed to fetch')) {
      console.error('❌ Ошибка сети: невозможно подключиться к серверу');
      container.innerHTML = '<p class="text-center" style="color: var(--accent-coral);">Не удалось подключиться к серверу. Проверьте интернет‑соединение.</p>';
    } else {
      console.error('❌ Ошибка загрузки FAQ:', error);
      container.innerHTML = '<p class="text-center" style="color: var(--accent-coral);">Не удалось загрузить вопросы</p>';
    }
  }
}

// === МАСКА ТЕЛЕФОНА ===
function setupPhoneMask() {
  const phoneInput = document.getElementById('phone');
  const phoneError = document.getElementById('phoneError');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', function(e) {
    let rawDigits = this.value.replace(/\D/g, '');

    if (rawDigits.length > 0 && rawDigits[0] === '8') {
      rawDigits = '7' + rawDigits.slice(1);
    }
    if (rawDigits.length > 0 && rawDigits[0] !== '7') {
      rawDigits = '7' + rawDigits;
    }
    if (rawDigits.length > 11) rawDigits = rawDigits.slice(0, 11);

    let formatted = '+7';
    if (rawDigits.length > 1) formatted += ' ' + rawDigits.slice(1, 4);
    if (rawDigits.length > 4) formatted += ' ' + rawDigits.slice(4, 7);
    if (rawDigits.length > 7) formatted += '-' + rawDigits.slice(7, 9);
    if (rawDigits.length > 9) formatted += '-' + rawDigits.slice(9, 11);

    const oldValue = this.value;
    const newValue = formatted;
    if (newValue !== oldValue) {
      const cursorPos = this.selectionStart + (newValue.length - oldValue.length);
      this.value = newValue;
      this.setSelectionRange(Math.min(cursorPos, newValue.length), Math.min(cursorPos, newValue.length));
    }

    const isValid = rawDigits.length === 11;
    if (!isValid && rawDigits.length > 0) {
      phoneError.style.display = 'block';
      this.classList.add('is-invalid');
    } else {
      phoneError.style.display = 'none';
      this.classList.remove('is-invalid');
    }

    this.setAttribute('data-raw-digits', rawDigits);
  });

  phoneInput.addEventListener('keydown', function(e) {
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', 'Enter'];
    if (allowed.includes(e.key)) return;
    if (!/^\d$/.test(e.key) && e.key !== '+') {
      e.preventDefault();
    }
    if (e.key === '+') e.preventDefault();
  });
}

// === DOMContentLoaded ===
document.addEventListener('DOMContentLoaded', function() {
  setupPhoneMask();
  loadFaqs(); // Вызов внутри DOMContentLoaded

  // === ОБРАБОТКА ФОРМЫ: ДВОЙНАЯ ОТПРАВКА (БД + EmailJS) ===
  const form = document.getElementById('feedbackForm');
  if (form) {form.addEventListener('submit', async function(event) {
      event.preventDefault();


      const name = document.getElementById('name').value.trim();
      const phoneInput = document.getElementById('phone');
      const phone = phoneInput.value.trim();
      const email = document.getElementById('email').value.trim();
      const question = document.getElementById('question').value.trim();

      const rawDigits = phoneInput.getAttribute('data-raw-digits') || '';
      const isValidPhone = rawDigits.length === 11 || phone === '';

      if (!name || !email || !question) {
        alert('Пожалуйста, заполните имя, email и вопрос.');
        return;
      }

      if (phone !== '' && !isValidPhone) {
        document.getElementById('phoneError').style.display = 'block';
        phoneInput.classList.add('is-invalid');
        alert('Пожалуйста, введите корректный номер телефона в формате +7 123 456-78-90');
        return; // Исправлено: добавлен return после alert
      }

      // Данные для БД
      const dbData = {
        name: name,
        phone: phone || null,
        email: email,
        request: question
      };

      // Данные для EmailJS (параметры шаблона)
      const emailParams = {
        name: name,
        phone: phone || 'не указан',
        email: email,
        request: question
      };

      try {
        // Запускаем обе отправки параллельно
        const [dbResponse, emailResponse] = await Promise.allSettled([
          // 1. Отправка в БД Railway
          fetch('https://local-music-party-production.up.railway.app/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dbData)
          }).then(res => res.json().then(data => ({ ok: res.ok, data }))),

          // 2. Отправка через EmailJS
          emailjs.send('service_2quudzn', 'template_ny8s8un', emailParams, {
            publicKey: 'YSgl9KoviO11QTuS1'
          }).then(res => ({ ok: true, data: res }))
        ]);

        // Проверяем результаты
        const dbSuccess = dbResponse.status === 'fulfilled' && dbResponse.value.ok;
        const emailSuccess = emailResponse.status === 'fulfilled' && emailResponse.value.ok;

        if (dbSuccess || emailSuccess) {
          // Хотя бы одна отправка успешна — показываем позитивный результат
          let message = 'Спасибо! Мы получили ваш вопрос';
          if (dbSuccess && emailSuccess) {
            message += ' и свяжемся с вами.';
          } else if (dbSuccess) {
            message += '. Письмо не отправлено (проверьте настройки), но мы уже увидели ваш запрос.';
          } else {
            message += '. Данные сохранены в почте, но не в базе (техническая ошибка).';
          }
          alert(message);

          // Очищаем форму
          form.reset();
          if (phoneInput) {
            phoneInput.value = '';
            phoneInput.removeAttribute('data-raw-digits');
            phoneInput.classList.remove('is-invalid');
            const errDiv = document.getElementById('phoneError');
            if (errDiv) errDiv.style.display = 'none';
          }
        } else {
          // Обе отправки провалились
          const dbError = dbResponse.status === 'rejected' ? dbResponse.reason : dbResponse.value.data?.message;
          const emailError = emailResponse.status === 'rejected' ? emailResponse.reason : null;
          console.error('❌ DB error:', dbError);
          console.error('❌ EmailJS error:', emailError);
          alert('Произошла ошибка при отправке. Попробуйте позже или напишите нам в Telegram.');
        }
      } catch (error) {
        console.error('Критическая ошибка при отправке:', error);
        alert('Произошла ошибка при отправке. Попробуйте позже.');
      }
    });
  }
}); // Закрытие блока DOMContentLoaded

// === КНОПКИ: плавный скролл и анимация ===
const addEventBtn = document.getElementById('add-event');
const downloadBtn = document.getElementById('download-hero');
if (addEventBtn && downloadBtn) {
  addEventBtn.addEventListener('click', function(e) {
    e.preventDefault();
    downloadBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      downloadBtn.classList.add('shake');
      setTimeout(() => {
        downloadBtn.classList.remove('shake');
      }, 1000);
    }, 600);
  });
}

// === АДАПТАЦИЯ AOS ===
window.addEventListener('resize', function() {
  if (window.innerWidth < 768) {
    AOS.init({ disable: true });
  } else if (AOS.refresh) {
    AOS.refresh();
  }
});