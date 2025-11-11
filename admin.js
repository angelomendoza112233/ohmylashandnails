// Fetch and display all bookings
document.addEventListener('DOMContentLoaded', function() {
  fetchBookings();
});

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
