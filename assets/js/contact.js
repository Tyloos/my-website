document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".contact-form");
  const inputs = form.querySelectorAll("input, textarea");
  const successMsg = document.getElementById("success-message");

  // Ẩn thông báo khi người dùng nhập dữ liệu mới
  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      validateInput(input);
      successMsg.style.display = "none";
    });
  });

  function validateInput(input) {
    const value = input.value.trim();
    const icon = input.parentElement.querySelector(".input-status-icon");
    const err = input.parentElement.querySelector(".error-message");
    let valid = true;
    let errorMessage = "";

    if (!value) {
      valid = false;
      errorMessage = "Không được để trống";
    }

    if (input.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        valid = false;
        errorMessage = "Email không hợp lệ";
      }
    }

    if (input.id === "phone" && value) {
      if (!/^[0-9\s+().-]{9,20}$/.test(value)) {
        valid = false;
        errorMessage = "Số điện thoại chưa hợp lệ";
      }
    }

    if (valid) {
      input.classList.add("valid");
      input.classList.remove("invalid");
      icon.textContent = "✔";
      icon.style.color = "green";
      if (err) {
        err.textContent = "";
        err.style.display = "none";
      }
    } else {
      input.classList.add("invalid");
      input.classList.remove("valid");
      icon.textContent = "❗";
      icon.style.color = "red";
      if (err) {
        err.textContent = errorMessage;
        err.style.display = "block";
      }
    }

    return valid;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    let isValid = true;
    inputs.forEach((input) => {
      if (!validateInput(input)) isValid = false;
    });

    if (isValid) {
      successMsg.style.display = "block";
    }
  });

  form.addEventListener("reset", function () {
    setTimeout(() => {
      inputs.forEach((input) => {
        input.classList.remove("valid", "invalid");
        const icon = input.parentElement.querySelector(".input-status-icon");
        const err = input.parentElement.querySelector(".error-message");
        if (icon) icon.textContent = "";
        if (err) {
          err.textContent = "";
          err.style.display = "none";
        }
      });
      successMsg.style.display = "none";
    }, 0);
  });
});
