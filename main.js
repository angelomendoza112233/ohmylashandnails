// Maintenance mode check
function checkMaintenanceMode() {
  fetch('/api/maintenance')
    .then(response => response.json())
    .then(data => {
      const banner = document.getElementById('maintenance-banner');
      if (data.enabled) {
        if (banner) banner.style.display = 'block';
      } else {
        if (banner) banner.style.display = 'none';
      }
    })
    .catch(error => {
      console.error('Error checking maintenance mode:', error);
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Handle services button click to show modal
document.getElementById('services-btn').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('services-modal').style.display = 'block';
});

// Handle services navigation buttons
document.getElementById('nail-btn').addEventListener('click', function() {
  document.getElementById('nail-step').style.display = 'block';
  document.getElementById('lash-step').style.display = 'none';
  this.classList.add('active');
  document.getElementById('lash-btn').classList.remove('active');
});

document.getElementById('lash-btn').addEventListener('click', function() {
  document.getElementById('lash-step').style.display = 'block';
  document.getElementById('nail-step').style.display = 'none';
  this.classList.add('active');
  document.getElementById('nail-btn').classList.remove('active');
});

// Handle book button click to show modal
const bookingBtn = document.getElementById('book-btn');
const bookingModal = document.getElementById('booking-modal');
const bookingCard = document.querySelector('.booking-card');
let _bookingKeyHandler = null;

function positionBookingCard() {
  // Position the booking card anchored to the .hero area (to the right of hero-text)
  const hero = document.querySelector('.hero');
  if (!hero || !bookingCard) return;

  const heroRect = hero.getBoundingClientRect();
  // We want the card to appear inside the hero roughly centered vertically and offset to the right
  const cardWidth = Math.min(520, window.innerWidth * 0.32);
  bookingCard.style.width = cardWidth + 'px';

  // Calculate left/top relative to viewport so it sits inside the hero area
  // Use fixed positioning so the card does not affect document flow/layout
  const left = Math.min(window.innerWidth - cardWidth - 24, heroRect.left + heroRect.width * 0.52);
  const top = Math.max(24, heroRect.top + 8);

  bookingCard.style.position = 'fixed';
  bookingCard.style.left = left + 'px';
  bookingCard.style.top = top + 'px';
  bookingCard.style.zIndex = 1002;
}

function openBookingModal() {
  if (!bookingModal) return;
  bookingModal.style.display = 'block';
  positionBookingCard();
  // trigger pop-in animation
  if (bookingCard) {
    bookingCard.classList.remove('pop-in');
    void bookingCard.offsetWidth;
    bookingCard.classList.add('pop-in');
  }
  showBookingStep(1);
  setActiveStep(1);

  // add keydown listener for Esc and focus trap
  _bookingKeyHandler = function(e) {
    if (e.key === 'Escape') {
      closeBookingModal();
    }
    // focus trap
    if (e.key === 'Tab') {
      const focusable = bookingCard.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
      const focusableArr = Array.from(focusable).filter(el => el.offsetParent !== null);
      if (focusableArr.length === 0) return;
      const first = focusableArr[0];
      const last = focusableArr[focusableArr.length - 1];
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    }
  };
  window.addEventListener('keydown', _bookingKeyHandler);

  // focus first input for convenience
  const firstInput = bookingCard.querySelector('input, select, textarea, button');
  if (firstInput) firstInput.focus();
}

function closeBookingModal() {
  if (!bookingModal) return;
  bookingModal.style.display = 'none';
  // cleanup key handler
  if (_bookingKeyHandler) {
    window.removeEventListener('keydown', _bookingKeyHandler);
    _bookingKeyHandler = null;
  }
  // reset steps
  showBookingStep(1);
  setActiveStep(1);
  // remove any resize/scroll handlers
  if (bookingModal._onResize) {
    window.removeEventListener('resize', bookingModal._onResize);
    window.removeEventListener('scroll', bookingModal._onResize);
    bookingModal._onResize = null;
  }
}

if (bookingBtn) {
  bookingBtn.addEventListener('click', function(e) {
    e.preventDefault();
    openBookingModal();
    // reposition on resize/scroll while open
    const onResize = () => positionBookingCard();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize);
    // store to remove later when closed
    bookingModal._onResize = onResize;
  });
}

// Handle booking navigation buttons with validation
document.getElementById('step1-btn').addEventListener('click', function() {
  showBookingStep(1);
  setActiveStep(1);
});

document.getElementById('step2-btn').addEventListener('click', function() {
  if (validateStep1()) {
    showBookingStep(2);
    setActiveStep(2);
  }
});

document.getElementById('step3-btn').addEventListener('click', function() {
  if (validateStep1() && validateStep2()) {
    showBookingStep(3);
    setActiveStep(3);
  }
});

function showBookingStep(step) {
  const steps = document.querySelectorAll('.booking-step');
  steps.forEach(s => s.classList.remove('active'));
  document.getElementById(`step${step}`).classList.add('active');
}

function setActiveStep(step) {
  const buttons = document.querySelectorAll('.booking-navigation button');
  buttons.forEach(btn => btn.classList.remove('active'));
  document.getElementById(`step${step}-btn`).classList.add('active');
}

// Validation functions
function validateStep1() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();

  if (!name) {
    alert('Please enter your full name.');
    return false;
  }

  if (!email) {
    alert('Please enter your email address.');
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address.');
    return false;
  }

  if (!phone) {
    alert('Please enter your phone number.');
    return false;
  }

  return true;
}

function validateStep2() {
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;

  if (!date) {
    alert('Please select a preferred date.');
    return false;
  }

  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    alert('Please select a date that is today or in the future.');
    return false;
  }

  if (!time) {
    alert('Please select a preferred time.');
    return false;
  }

  return true;
}

// Handle booking form submission
document.getElementById('submit-booking').addEventListener('click', function(e) {
  e.preventDefault();

  // Validate all steps before submission
  if (!validateStep1() || !validateStep2()) {
    return;
  }

  const serviceCheckboxes = document.querySelectorAll('input[name="service"]:checked');
  const selectedServices = Array.from(serviceCheckboxes).map(checkbox => checkbox.value);
  if (selectedServices.length === 0) {
    alert('Please select at least one service.');
    return;
  }
  const service = selectedServices.join(', ');

  // Get form data
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  const message = '';

  // Send data to server
  fetch('/api/book', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      email,
      phone,
      date,
      time,
      service,
      message
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Populate receipt
      document.getElementById('receipt-name').textContent = name;
      document.getElementById('receipt-email').textContent = email;
      document.getElementById('receipt-phone').textContent = phone;
      document.getElementById('receipt-date').textContent = date;
      document.getElementById('receipt-time').textContent = time;
      document.getElementById('receipt-service').textContent = service;
      document.getElementById('receipt-message').textContent = message || 'None';

      // Show modal
      document.getElementById('receipt-modal').style.display = 'block';

      // Reset form and close booking modal
      document.getElementById('booking-modal').style.display = 'none';
      document.getElementById('name').value = '';
      document.getElementById('email').value = '';
      document.getElementById('phone').value = '';
      document.getElementById('date').value = '';
      document.getElementById('time').value = '';
      const allCheckboxes = document.querySelectorAll('input[name="service"]');
      allCheckboxes.forEach(checkbox => checkbox.checked = false); // Clear checkboxes
      // document.getElementById('message').value = '';
      showBookingStep(1);
      setActiveStep(1);
    } else {
      alert('Error: ' + data.error);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred while submitting the booking.');
  });
});

// Handle receipt modal close
document.querySelector('#receipt-modal .close').addEventListener('click', function() {
  document.getElementById('receipt-modal').style.display = 'none';
});

// Handle booking modal close
document.querySelector('.booking-close').addEventListener('click', function() {
  closeBookingModal();
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
  const receiptModal = document.getElementById('receipt-modal');
  const bookingModal = document.getElementById('booking-modal');
  if (event.target === receiptModal) {
    receiptModal.style.display = 'none';
  }
  if (event.target === bookingModal) {
    closeBookingModal();
    // remove any resize handlers
    if (bookingModal._onResize) {
      window.removeEventListener('resize', bookingModal._onResize);
      window.removeEventListener('scroll', bookingModal._onResize);
      bookingModal._onResize = null;
    }
  }
});

// Portfolio modal handlers
const portfolioBtn = document.getElementById('portfolio-btn');
const portfolioModal = document.getElementById('portfolio-modal');
const portfolioClose = document.querySelector('.portfolio-close');

function loadPortfolioImages() {
  console.log('Loading portfolio images...');
  const portfolioGrid = document.getElementById('portfolio-grid');
  if (!portfolioGrid) {
    console.error('Portfolio grid element not found');
    return;
  }

  portfolioGrid.innerHTML = '<p>Loading...</p>';

  fetch('/api/portfolio')
    .then(response => {
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(images => {
      console.log('Received images:', images);
      portfolioGrid.innerHTML = '';

      if (images.length === 0) {
        portfolioGrid.innerHTML = '<p>No portfolio images available.</p>';
        return;
      }

      images.forEach(image => {
        console.log('Adding image:', image);
        const item = document.createElement('div');
        item.className = 'portfolio-item';
        item.innerHTML = `<img src="${image.url}" alt="Portfolio image" onerror="console.error('Failed to load image:', this.src); this.style.display='none'">`;
        portfolioGrid.appendChild(item);
      });
    })
    .catch(error => {
      console.error('Error loading portfolio images:', error);
      portfolioGrid.innerHTML = '<p>Error loading portfolio images.</p>';
    });
}

if (portfolioBtn && portfolioModal) {
  portfolioBtn.addEventListener('click', function(e) {
    e.preventDefault();
    // Load portfolio images before showing modal
    loadPortfolioImages();
    // show overlay and card
    portfolioModal.style.display = 'block';
    // trigger a subtle animation by forcing reflow and adding animation via CSS
    const card = portfolioModal.querySelector('.portfolio-card');
    if (card) {
      card.classList.remove('pop-in');
      // reflow
      void card.offsetWidth;
      card.classList.add('pop-in');
    }
  });

  // close button
  if (portfolioClose) {
    portfolioClose.addEventListener('click', function() {
      portfolioModal.style.display = 'none';
    });
  }

  // close when clicking outside the card
  window.addEventListener('click', function(event) {
    if (event.target === portfolioModal) {
      portfolioModal.style.display = 'none';
    }
  });
}

// Services modal handlers
const servicesBtn = document.getElementById('services-btn');
const servicesModal = document.getElementById('services-modal');
const servicesClose = document.querySelector('.services-close');

if (servicesBtn && servicesModal) {
  servicesBtn.addEventListener('click', function(e) {
    e.preventDefault();
    // show overlay and card
    // ensure the services modal overlay sits above other modal cards
    servicesModal.style.zIndex = 1003;
    servicesModal.style.display = 'block';
    // trigger a subtle animation by forcing reflow and adding animation via CSS
    const card = servicesModal.querySelector('.services-card');
    if (card) {
      card.classList.remove('pop-in');
      // reflow
      void card.offsetWidth;
      card.classList.add('pop-in');
    }
    // initialize step
    showServicesStep(1);
  });

  // delegated close handler: reliably close when user clicks the X or the overlay
  servicesModal.addEventListener('click', function(event) {
    // if clicked on overlay itself
    if (event.target === servicesModal) {
      // reuse the reset logic
      const resetServices = () => {
        servicesStep = 1;
        showServicesStep(1);
        servicesModal.style.display = 'none';
      };
      resetServices();
      return;
    }

    // if clicked a close button inside the modal (supports inner elements)
    if (event.target.closest && event.target.closest('.services-close')) {
      servicesStep = 1;
      showServicesStep(1);
      servicesModal.style.display = 'none';
    }
  });


}

// Hamburger menu toggle
const hamburgerBtn = document.getElementById('hamburger-btn');
const navMenu = document.getElementById('nav-menu');

if (hamburgerBtn && navMenu) {
  hamburgerBtn.addEventListener('click', function() {
    navMenu.classList.toggle('active');
    hamburgerBtn.classList.toggle('active');
  });

  // Close menu when clicking outside or on a link
  document.addEventListener('click', function(event) {
    if (!hamburgerBtn.contains(event.target) && !navMenu.contains(event.target)) {
      navMenu.classList.remove('active');
      hamburgerBtn.classList.remove('active');
    }
  });

  // Close menu when clicking on a nav link
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function() {
      navMenu.classList.remove('active');
      hamburgerBtn.classList.remove('active');
    });
  });
}

// Services modal step navigation (Next / Back)
const servicesNext = document.getElementById('services-next');
const servicesPrev = document.getElementById('services-prev');
let servicesStep = 1;

function showServicesStep(step) {
  const steps = servicesModal.querySelectorAll('.services-step');
  steps.forEach(s => s.style.display = 'none');
  const active = servicesModal.querySelector(`.services-step[data-step="${step}"]`);
  if (active) {
    active.style.display = 'block';
  }

  // toggle footer buttons
  if (servicesPrev) servicesPrev.style.display = (step > 1) ? 'inline-block' : 'none';
  if (servicesNext) servicesNext.textContent = (step < steps.length) ? 'Next' : 'Close';
}

if (servicesModal) {
  // Next button
  if (servicesNext) {
    servicesNext.addEventListener('click', function() {
      const steps = servicesModal.querySelectorAll('.services-step');
      if (servicesStep < steps.length) {
        servicesStep += 1;
        showServicesStep(servicesStep);
      } else {
        // Close when already on last
        servicesModal.style.display = 'none';
        servicesStep = 1;
        showServicesStep(1);
      }
    });
  }

  // Prev button
  if (servicesPrev) {
    servicesPrev.addEventListener('click', function() {
      if (servicesStep > 1) {
        servicesStep -= 1;
        showServicesStep(servicesStep);
      }
    });
  }

  // Reset to step 1 when modal is closed via close button or overlay
  const resetServices = () => {
    servicesStep = 1;
    showServicesStep(1);
    servicesModal.style.display = 'none';
  };

  if (servicesClose) servicesClose.addEventListener('click', resetServices);
  window.addEventListener('click', function(event) {
    if (event.target === servicesModal) resetServices();
  });

  // ensure initial state
  showServicesStep(1);
}
