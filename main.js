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

// Handle booking form submission
document.getElementById('booking-form').addEventListener('submit', function(e) {
  e.preventDefault();

  // Get form data
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  const service = document.getElementById('service').value;
  const message = document.getElementById('message').value;

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

      // Reset form
      this.reset();
    } else {
      alert('Error: ' + data.error);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred while submitting the booking.');
  });
});

// Handle modal close
document.querySelector('.close').addEventListener('click', function() {
  document.getElementById('receipt-modal').style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
  const modal = document.getElementById('receipt-modal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});
