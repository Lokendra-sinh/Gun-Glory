import axios from "axios";

const authButton = document.querySelector(".auth-button");
const authModal = document.querySelector(".auth-modal");
const loginForm = document.querySelector(".login-form");
const signupForm = document.querySelector(".signup-form");
const signupButton = document.getElementById("signup-button");
const loginButton = document.getElementById("login-button");
const formToggleBtn = document.querySelector(".form-toggle-button");
const formToggleText = document.querySelector(".form-toggle-text");
const loginSpinner = document.querySelector(".login-spinner");
const signupSpinner = document.querySelector(".signup-spinner");

//email verification modal elements

const emailVerificationModalOverlay = document.querySelector(
  ".email-verification-modal-overlay"
);
const emailVerificationForm = document.querySelector(
  ".email-verification-form"
);
const emailVerificationSpinner = document.querySelector(
  ".email-verification-spinner"
);
const closeEmailVerificationModalButton = document.querySelector(
  ".close-email-verification-modal-button"
);

//verification result message elements

const verificationSuccessMessage = document.querySelector(
  ".verification-success"
);
const verificationFailureMessage = document.querySelector(
  ".verification-failure"
);

let isAuthModalOpen = false;
let isSignUpModalOpen = false;
let isLoginModalOpen = false;
let isEmailVerificationModalOpen = false;

// automatic user login based on token value

fetchUserData();

async function fetchUserData() {

    const token = localStorage.getItem("token");
    console.log("token from handleUserlogin is: ", token);
    if(!token){
        console.log("no token found");
        return;
    }

    try {
      const response = await axios.post(
        URL + "/login",
        {},
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": token,
          },
        }
      );
  
      const userData = await response.data;
      console.log("user data is: ", userData);
      user.name = userData.name;
      user.email = userData.email;
      guestButton.textContent = user.name;
      userLoggedIn = true;
      authButton.textContent = 'Logout';
  
    } catch (error) {
      console.log("error while logging user: ", error);
    }
  }

function handleAuthModalVisibility() {
  authModal.style.display = isAuthModalOpen ? "flex" : "none";
  loginForm.style.display = isLoginModalOpen ? "flex" : "none";
  signupForm.style.display = isSignUpModalOpen ? "flex" : "none";
  formToggleBtn.textContent = isSignUpModalOpen ? "Sign in" : "Sign Up";
  formToggleText.textContent = isSignUpModalOpen
    ? `Already have an account?`
    : `Don't have an account?`;

    loginForm.reset();
    signupForm.reset();
}

function handleEmailVerificationModalVisibility() {
  emailVerificationModalOverlay.style.display = isEmailVerificationModalOpen
    ? "flex"
    : "none";
}

async function handleEmailVerification(verificationCode) {
  try {
    const response = await axios.post(
      URL + "/verify-email",
      {
        verificationCode,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const userData = await response.data;
    console.log("user data is: ", userData);
    console.log("token is: ", userData.token);
    
    localStorage.setItem("token", userData.token);
    verificationSuccessMessage.style.display = "flex";
    setTimeout(() => {
      verificationSuccessMessage.style.display = "none";
      isEmailVerificationModalOpen = false;
      handleEmailVerificationModalVisibility();
      isAuthModalOpen = true;
      isLoginModalOpen = true;
      isSignUpModalOpen = false;
      handleAuthModalVisibility();
    }, 2000);
  } catch (error) {
    console.log("error while verifying email: ", error);
    verificationFailureMessage.style.display = "flex";
  }
}

emailVerificationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  // emailVerificationSpinner.style.display = 'flex';
  const verificationCode = document
    .querySelector(".email-verification-otp")
    .value.trim("");
  handleEmailVerification(verificationCode);
});

authButton.addEventListener("click", (event) => {
  event.preventDefault();

  //if user is already logged in, log them out

  if(userLoggedIn){
    userLoggedIn = false;
    authButton.textContent = 'Sign in/up';
    guestButton.textContent = 'Guest';
    return;
  }

  isAuthModalOpen = !isAuthModalOpen;
  if (isAuthModalOpen) {
    isLoginModalOpen = true;
    isSignUpModalOpen = false;
  }
  handleAuthModalVisibility();
});

formToggleBtn.addEventListener("click", (event) => {
  event.preventDefault();
  if (isSignUpModalOpen) {
    isSignUpModalOpen = false;
    isLoginModalOpen = true;
  } else {
    isSignUpModalOpen = true;
    isLoginModalOpen = false;
  }
  handleAuthModalVisibility();
});

signupForm.addEventListener("submit", function (event) {
  event.preventDefault();
  signupSpinner.style.display = "flex";
  console.log("inside signup form: ", signupButton);
  signupButton.disabled = true;
  extractSignupFormValues();
});

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();
  loginSpinner.style.display = "flex";
  console.log("inside login form: ", loginButton);
  loginButton.disabled = true;
  extractLoginFormValues();
});

closeEmailVerificationModalButton.addEventListener("click", (event) => {
  isEmailVerificationModalOpen = false;
  handleEmailVerificationModalVisibility();
});

// formToggleBtn.addEventListener("click", () => {
//   isSignUpModalOpen = !isSignUpModalOpen;
// //  handleAuthModalVisibility();
// });

async function handleUserRegistration(name, email, password) {
  console.log("inside handleUserRgistration");
  try {
    const response = await axios.post(
      URL + "/register",
      {
        name,
        email,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    isAuthModalOpen = false;
    signupSpinner.style.display = "none";
    signupButton.disabled = false;
    handleAuthModalVisibility();
    isEmailVerificationModalOpen = true;
    handleEmailVerificationModalVisibility();
  } catch (error) {
    console.log("error is: ", error);
    // spinner.style.display = "none";
  }
}

async function handleUserLogin(email, password) {
  try {
    const token = localStorage.getItem("token");
    console.log("token from handleUserlogin is: ", token);
    const response = await axios.post(
      URL + "/login",
      {
        email,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
      }
    );

    const userData = await response.data;
    console.log("user data is: ", userData);

    setTimeout(() => {
      loginSpinner.style.display = "none";
      loginButton.disabled = false;
      isAuthModalOpen = false;
    handleAuthModalVisibility();
    }, 2000);

    user.name = userData.name;
    user.email = userData.email;
    guestButton.textContent = user.name;

  } catch (error) {
    console.log("error while logging user: ", error);
  }
}
async function extractSignupFormValues() {
  const name = document.getElementById("signup-name").value.trim("");
  const email = document.getElementById("signup-email").value.trim("");
  const password = document.getElementById("signup-password").value.trim("");
  console.log("inside extactSignUpForm");
  await handleUserRegistration(name, email, password);
}

async function extractLoginFormValues() {
  const email = document.getElementById("login-email").value.trim("");
  const password = document.getElementById("login-password").value.trim("");
  await handleUserLogin(email, password);

  console.log("Login Form Values:");
  console.log("Email:", email);
  console.log("Password:", password);
}
