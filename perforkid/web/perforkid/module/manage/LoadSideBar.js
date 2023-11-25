// // JavaScript code to load the sidebar
// const sidebarContainer = document.getElementById('sidebar-container');
// const sidebarRequest = new XMLHttpRequest();
// sidebarRequest.open('GET', 'Sidebar.html', true);
// sidebarRequest.onreadystatechange = function () {
//   if (sidebarRequest.readyState === XMLHttpRequest.DONE && sidebarRequest.status === 200) {
//     sidebarContainer.innerHTML = sidebarRequest.responseText;
//   }
// };
// sidebarRequest.send();

// //Navbar Small screen test
// document.addEventListener('DOMContentLoaded', function () {
//   const overlay = document.getElementById('navOverlay');
//   const toggleOverlayBtn = document.getElementById('toggleOverlay');

//   const toggleOverlay = function () {
//     overlay.style.display = overlay.style.display === 'block' ? 'none' : 'block';
//   };

//   toggleOverlayBtn.addEventListener('click', toggleOverlay);
// });


import * as FirebaseAPI from "../../firebaseConfig/FirebaseAPI.js";

// JavaScript code to load the sidebar
const sidebarContainer = document.getElementById('sidebar-container');
const sidebarRequest = new XMLHttpRequest();
sidebarRequest.open('GET', 'sidebar.html', true);
sidebarRequest.onreadystatechange = function () {
    if (sidebarRequest.readyState === XMLHttpRequest.DONE && sidebarRequest.status === 200) {
        sidebarContainer.innerHTML = sidebarRequest.responseText;

        // Get the current page pathname
        var currentPath = window.location.pathname;
        var panelNumber = currentPath.match(/\/Panel(\d+)/);

        // Get all sidebar links
        var sidebarLinks = document.querySelectorAll('.navbar-nav .nav-link');
        
        //console.log(currentPath);
        // Loop through each link and check if its href matches the current page pathname
        sidebarLinks.forEach(function (link) {
            //console.log(link.getAttribute('href'));
            
            console.log("Panel number:", panelNumber[1]);
            // ตรวจสอบว่าค่าที่ได้รับตรงกับหรือไม่
            if (link.getAttribute('href').includes(`./Panel${panelNumber[1]}`)) {
                link.classList.add('active');
            }
        });
    }
};
sidebarRequest.send();

document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('navOverlay');
    const toggleOverlayBtn = document.getElementById('toggleOverlay');

    if (overlay && toggleOverlayBtn) {
        const toggleOverlay = function () {
            overlay.style.display = overlay.style.display === 'block' ? 'none' : 'block';
        };

        toggleOverlayBtn.addEventListener('click', toggleOverlay);
    } 
});



// In your LogoutFirebaseAuthen.js module
document.body.addEventListener('click', function(event) {
    if (event.target.matches('#signOutBtn')) {
        // Handle logout logic here
        console.log('Logout button clicked');
        try {
            const auth = FirebaseAPI.getAuth(FirebaseAPI.app);
        
            FirebaseAPI.signOut(auth);
        
            // ลบค่าใน sessionStorage
            sessionStorage.removeItem('currentUser');
        
            console.log('Sign out successful!');
        
            window.location.href = '../../AdminLanding.html'; // Redirects
        
          } catch (error) {
            console.error('Error signing out:', error);
          }
    }
});