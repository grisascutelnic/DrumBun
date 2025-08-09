document.addEventListener('DOMContentLoaded', function() {
    // Add click event listener to the "Adaugă o cursă nouă" button
    const addRideBtn = document.getElementById('add-ride-btn');
    if (addRideBtn) {
        addRideBtn.addEventListener('click', function(e) {
            e.preventDefault();
            checkAuthAndRedirect();
        });
    }
});

function checkAuthAndRedirect() {
    fetch('/api/auth/user')
        .then(response => {
            if (response.ok) {
                // User is logged in, redirect to add-ride page
                window.location.href = '/add-ride';
            } else {
                // User is not logged in, redirect to login page
                // Save the target URL in sessionStorage for redirection after login
                sessionStorage.setItem('redirectAfterLogin', '/add-ride');
                window.location.href = '/login';
            }
        })
        .catch(error => {
            console.error('Error checking auth status:', error);
            // On error, redirect to login page for safety
            sessionStorage.setItem('redirectAfterLogin', '/add-ride');
            window.location.href = '/login';
        });
}
