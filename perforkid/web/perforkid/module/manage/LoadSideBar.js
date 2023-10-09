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