AOS.init({
  once: true,
  duration: 600,
  offset: 30,
  disable: window.innerWidth < 768
});

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

// Маска телефона
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

document.addEventListener('DOMContentLoaded', function() {
  setupPhoneMask();
  
  const form = document.getElementById('feedbackForm');
  if (form) {
    form.addEventListener('submit', async function(event) {
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
        return;
      }
      
      const templateParams = {
        name: name,
        phone: phone || 'не указан',
        email: email,
        request: question
      };

      try {
        const serviceID = 'service_2quudzn';
        const templateID = 'template_ny8s8un';
        const response = await emailjs.send(serviceID, templateID, templateParams, {
          publicKey: 'YSgl9KoviO11QTuS1'
        });
        console.log('Успешно отправлено!', response.status);
        alert('Спасибо! Мы получили ваш вопрос и свяжемся с вами.');
        form.reset();
        // Сбросим данные поля телефона после очистки
        const phoneField = document.getElementById('phone');
        if (phoneField) {
          phoneField.value = '';
          phoneField.removeAttribute('data-raw-digits');
          phoneField.classList.remove('is-invalid');
          const errDiv = document.getElementById('phoneError');
          if (errDiv) errDiv.style.display = 'none';
        }
      } catch (error) {
        console.error('Ошибка при отправке:', error);
        alert('Произошла ошибка при отправке. Попробуйте позже или напишите нам в Telegram.');
      }
    });
  }

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
});

window.addEventListener('resize', function() {
  if (window.innerWidth < 768) {
    AOS.init({ disable: true });
  } else if (AOS.refresh) {
    AOS.refresh();
  }
});