// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
  fetchBookings();
  loadPortfolioImages();
  loadMaintenanceStatus();

  // Maintenance mode toggle
  const maintenanceToggle = document.getElementById('maintenance-toggle');
  if (maintenanceToggle) {
    maintenanceToggle.addEventListener('change', toggleMaintenanceMode);
  }

  // Portfolio upload
  const uploadBtn = document.getElementById('upload-btn');
  const portfolioFile = document.getElementById('portfolio-file');
  if (uploadBtn && portfolioFile) {
    uploadBtn.addEventListener('click', () => portfolioFile.click());
    portfolioFile.addEventListener('change', uploadPortfolioImages);
  }
});

// Fetch and display all bookings
function fetchBookings() {
  fetch('/api/bookings')
    .then(response => response.json())
    .then(bookings => {
      displayBookings(bookings);
    })
    .catch(error => {
      console.error('Error fetching bookings:', error);
      alert('Error loading bookings');
    });
}

function displayBookings(bookings) {
  const tbody = document.getElementById('bookings-body');
  tbody.innerHTML = '';

  bookings.forEach(booking => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${booking.id}</td>
      <td>${booking.name}</td>
      <td>${booking.email}</td>
      <td>${booking.phone}</td>
      <td>${booking.date}</td>
      <td>${booking.time}</td>
      <td>${booking.service}</td>
      <td>${booking.message || 'None'}</td>
      <td>${new Date(booking.createdAt).toLocaleString()}</td>
      <td><button class="delete-btn" data-id="${booking.id}">Delete</button></td>
    `;

    tbody.appendChild(row);
  });

  // Add event listeners to delete buttons
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      deleteBooking(id);
    });
  });
}

function deleteBooking(id) {
  if (confirm('Are you sure you want to delete this booking?')) {
    fetch(`/api/bookings/${id}`, {
      method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Booking deleted successfully');
        fetchBookings(); // Refresh the list
      } else {
        alert('Error deleting booking');
      }
    })
    .catch(error => {
      console.error('Error deleting booking:', error);
      alert('Error deleting booking');
    });
  }
}

// Maintenance Mode Functions
function loadMaintenanceStatus() {
  fetch('/api/maintenance')
    .then(response => response.json())
    .then(data => {
      const toggle = document.getElementById('maintenance-toggle');
      if (toggle) {
        toggle.checked = data.enabled || false;
      }
    })
    .catch(error => {
      console.error('Error loading maintenance status:', error);
    });
}

function toggleMaintenanceMode() {
  const enabled = document.getElementById('maintenance-toggle').checked;

  fetch('/api/maintenance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ enabled })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert(`Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully`);
    } else {
      alert('Error updating maintenance mode');
    }
  })
  .catch(error => {
    console.error('Error toggling maintenance mode:', error);
    alert('Error updating maintenance mode');
  });
}

// Portfolio Management Functions
function loadPortfolioImages() {
  fetch('/api/portfolio')
    .then(response => response.json())
    .then(images => {
      displayPortfolioImages(images);
    })
    .catch(error => {
      console.error('Error loading portfolio images:', error);
    });
}

function displayPortfolioImages(images) {
  const preview = document.getElementById('portfolio-preview');
  if (!preview) return;

  preview.innerHTML = '';

  images.forEach(image => {
    const item = document.createElement('div');
    item.className = 'portfolio-item-admin';
    item.innerHTML = `
      <img src="${image.url}" alt="Portfolio image">
      <div class="delete-overlay" data-filename="${image.filename}">
        <i class="fas fa-trash"></i>
      </div>
    `;
    preview.appendChild(item);
  });

  // Add delete event listeners
  document.querySelectorAll('.delete-overlay').forEach(overlay => {
    overlay.addEventListener('click', function() {
      const filename = this.getAttribute('data-filename');
      deletePortfolioImage(filename);
    });
  });
}

function uploadPortfolioImages() {
  const files = document.getElementById('portfolio-file').files;
  if (files.length === 0) return;

  const formData = new FormData();
  for (let file of files) {
    formData.append('images', file);
  }

  fetch('/api/portfolio/upload', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Images uploaded successfully');
      loadPortfolioImages(); // Refresh the list
      document.getElementById('portfolio-file').value = ''; // Clear file input
    } else {
      alert('Error uploading images');
    }
  })
  .catch(error => {
    console.error('Error uploading images:', error);
    alert('Error uploading images');
  });
}

function deletePortfolioImage(filename) {
  if (confirm('Are you sure you want to delete this image?')) {
    fetch(`/api/portfolio/${filename}`, {
      method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Image deleted successfully');
        loadPortfolioImages(); // Refresh the list
      } else {
        alert('Error deleting image');
      }
    })
    .catch(error => {
      console.error('Error deleting image:', error);
      alert('Error deleting image');
    });
  }
}
