document.title = "My New Title";

document.getElementById("avatar").style.backgroundImage =
  "url('https://images.unsplash.com/photo-1728577740843-5f29c7586afe?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')";

const logout = () => {
  localStorage.removeItem("token");
  openLoginModal();
};

const openLoginModal = () => {
  var loginModal = document.getElementById("loginModal");
  loginModal.showModal();
};

const closeLoginModal = () => {
  var loginModal = document.getElementById("loginModal");
  loginModal.close();
};

const login = (event) => {
  event.preventDefault();
  const email = document.getElementById("user").value;
  const password = document.getElementById("password").value;
  if (email === "admin" && password === "admin") {
    localStorage.setItem("token", "123456");
    closeLoginModal();
  } else {
    alert("Invalid credentials");
  }
};

window.onload = () => {
  if (!localStorage.getItem("token")) {
    openLoginModal();
  }
};
