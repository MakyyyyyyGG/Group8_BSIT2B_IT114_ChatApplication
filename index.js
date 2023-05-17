(function () {
  const app = document.querySelector(".app");
  const socket = io();
  const notificationSound = new Audio("messenger.mp3");

  window.onload = function () {
    window.addEventListener("scroll", function (e) {
      if (window.pageYOffset > 10) {
        //100//
        document.querySelector("header").classList.add("is-scrolling");
      } else {
        document.querySelector("header").classList.remove("is-scrolling");
      }
    });

    const menu_btn = document.querySelector(".hamburger");
    const mobile_menu = document.querySelector(".mobile-nav");

    menu_btn.addEventListener("click", function () {
      menu_btn.classList.toggle("is-active");
      mobile_menu.classList.toggle("is-active");
    });
  };

  //user login phase
  app
    .querySelector(".join-screen #join-user")
    .addEventListener("click", function () {
      let username = app.querySelector(".join-screen #username").value;
      if (username.length == 0) {
        return;
      }
      socket.emit("newuser", username);
      uname = username;
      app.querySelector(".join-screen").classList.remove("active");
      app.querySelector(".chat-screen").classList.add("active");
    });

  //user chat
  app
    .querySelector(".chat-screen #send-message")
    .addEventListener("click", function () {
      let message = app.querySelector(".chat-screen #message-input").value;
      if (message.length == 0) {
        return;
      }
      renderMessage("my", {
        username: uname,
        text: message,
      });
      socket.emit("chat", {
        username: uname,
        text: message,
      });
      app.querySelector(".chat-screen #message-input").value = "";
    });

    //user exit, send, recieve mesaage
  app
    .querySelector(".chat-screen #exit-chat")
    .addEventListener("click", function () {
      socket.emit("exituser", uname);
      window.location.href = window.location.href;
    });
  
  socket.on("update", function (update) {
    renderMessage("update", update);

  });
  socket.on("chat", function (message) {
    renderMessage("other", message);
    notificationSound.play();

  });

  // Client-side
  const messageInput = document.getElementById("message-input");
  const sendMessageButton = document.getElementById("send-message");

  messageInput.addEventListener("input", function () {
    if (messageInput.value.trim() === "") {
      socket.emit("stopTyping");
    } else {
      socket.emit("typing");
    }
  });

  sendMessageButton.addEventListener("click", function () {
    const message = messageInput.value;
    // ... Send the message using your existing code ...

    messageInput.value = ""; // Clear the input field
    socket.emit("stopTyping"); // Emit "stopTyping" event when the message is sent
  });

  socket.on("isTyping", function (data) {
    const typingIndicator = document.getElementById("isTyping");
    typingIndicator.innerHTML = `<img src="/typing.gif" alt="${data.username} is typing...">`;
  });

  socket.on("stopTyping", function () {
    const typingIndicator = document.getElementById("isTyping");
    typingIndicator.innerHTML = "";
  });

  function renderMessage(type, message) {
    let messageContainer = app.querySelector(".chat-screen .messages");
    let timestamp = Date.now(); // Get the current timestamp in milliseconds

    if (type == "my") {
      let el = document.createElement("div");
      el.setAttribute("class", "message my-message");
      el.innerHTML = `<div><div class ="name">You</div><div class="text">${message.text}</div><div class="timestamp" data-timestamp="${timestamp}"></div></div>`;
      messageContainer.appendChild(el);
    } else if (type == "other") {
      let el = document.createElement("div");
      el.setAttribute("class", "message other-message");
      el.innerHTML = `<div><div class ="name">${message.username}</div><div class="text">${message.text}</div><div class="timestamp" data-timestamp="${timestamp}"></div></div>`;
      messageContainer.appendChild(el);
    } else if (type == "update") {
      let el = document.createElement("div");
      el.setAttribute("class", "update");
      el.innerText = message;
      messageContainer.appendChild(el);
    }

    //scroll to end o the chat
    messageContainer.scrollTop =
      messageContainer.scrollHeight - messageContainer.clientHeight;
  }

  // Update timestamps periodically
  setInterval(updateTimestamps, 1000);

  function updateTimestamps() {
    const timestampElements = app.querySelectorAll(".timestamp");
    timestampElements.forEach((element) => {
      const timestamp = parseInt(element.getAttribute("data-timestamp"));
      const elapsed = Math.floor((Date.now() - timestamp) / 1000); // Elapsed time in seconds

      if (elapsed < 5) {
        // Less than 5 seconds
        element.innerText = "Just now";
      } else if (elapsed < 60) {
        // Less than 1 minute
        element.innerText = `${elapsed} seconds ago`;
      } else if (elapsed < 3600) {
        // Less than 1 hour
        const minutes = Math.floor(elapsed / 60);
        element.innerText = `${minutes} minutes ago`;
      } else {
        // More than 1 hour
        const hours = Math.floor(elapsed / 3600);
        element.innerText = `${hours} hours ago`;
      }
    });
  }

  //user counter
  socket.on("usercnt", function (msg) {
    document.getElementById("count").innerHTML = msg;
  });
})();
