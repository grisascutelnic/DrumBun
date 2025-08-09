document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});

function checkAuthStatus() {
    console.log('Checking authentication status...');
    
    fetch('/api/auth/user')
        .then(response => {
            console.log('Auth check response status:', response.status);
            if (response.ok) {
                return response.json();
            } else {
                console.log('User not authenticated, status:', response.status);
                return null;
            }
        })
        .then(user => {
            if (user) {
                console.log('User authenticated:', user.email);
                updateNavbarForLoggedInUser(user);
            } else {
                console.log('No authenticated user found');
                updateNavbarForLoggedOutUser();
            }
        })
        .catch(error => {
            console.error('Error checking auth status:', error);
            updateNavbarForLoggedOutUser();
        });
}

function updateNavbarForLoggedInUser(user) {
    const navAuth = document.getElementById('nav-auth');
    if (navAuth) {
        navAuth.innerHTML = `
            <div class="nav-user">
                <a href="/profile" class="nav-profile" title="Profilul meu">
                    <i class="fas fa-user-circle"></i>
                    <span class="user-name">${user.firstName}</span>
                </a>
                <button class="btn-logout" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i>
                    Deconectare
                </button>
            </div>
        `;
    }
}

function updateNavbarForLoggedOutUser() {
    const navAuth = document.getElementById('nav-auth');
    if (navAuth) {
        navAuth.innerHTML = `
            <a href="/login" class="btn-login">Conectare</a>
        `;
    }
}

function logout() {
    fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateNavbarForLoggedOutUser();
            // If we're on the profile page, redirect to home
            if (window.location.pathname === '/profile') {
                window.location.href = '/';
            }
        } else {
            console.error('Logout failed:', data.message);
        }
    })
    .catch(error => {
        console.error('Error during logout:', error);
    });
}
