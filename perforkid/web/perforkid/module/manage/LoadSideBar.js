// JavaScript code to load the sidebar
const sidebarContainer = document.getElementById('sidebar-container');
const sidebarRequest = new XMLHttpRequest();
sidebarRequest.open('GET', 'Sidebar.html', true);
sidebarRequest.onreadystatechange = function () {
  if (sidebarRequest.readyState === XMLHttpRequest.DONE && sidebarRequest.status === 200) {
    sidebarContainer.innerHTML = sidebarRequest.responseText;
  }
};
sidebarRequest.send();

//Navbar Small screen test
document.addEventListener('DOMContentLoaded', function () {
  const overlay = document.getElementById('navOverlay');
  const toggleOverlayBtn = document.getElementById('toggleOverlay');

  const toggleOverlay = function () {
    overlay.style.display = overlay.style.display === 'block' ? 'none' : 'block';
  };

  toggleOverlayBtn.addEventListener('click', toggleOverlay);
});




