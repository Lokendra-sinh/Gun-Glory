// import axios from "axios";

// const URL = "http://localhost:4000";

// const authenticateBtn = document.querySelector(".authenticate-button");
// const profileBtn = document.querySelector(".profile");
// const formToggleText = document.querySelector(".form-toggle-text");
// const formToggleBtn = document.querySelector(".form-toggle-button");
// const authModal = document.querySelector(".authModal");
// const emailModal = document.querySelector(".emailModal");
// const spinner = document.querySelector(".signup-spinner");

// let isSignUp = false;
// let isModalOpen = false;
// let isEmailModal = false;
// let isSpinner = false;
// authModal.style.display = "none";

// function handleAuthModalVisibility() {
//   authModal.style.display = isModalOpen ? "flex" : "none";
// }

// function handleEmailModalVisibility() {
//   emailModal.style.display = isEmailModal ? "flex" : "none";
// }

// function handleFormVisibility() {
//   formToggleBtn.textContent = isSignUp ? "login" : "sign up";
//   formToggleText.textContent = isSignUp
//     ? `Already have an account?`
//     : `Don't have an account?`;
//   signupForm.style.display = isSignUp ? "flex" : "none";
//   loginForm.style.display = isSignUp ? "none" : "flex"; // Assuming login form should hide when sign up is selected
// }

// // document.addEventListener('click', (event) => {
// //    if(isModalOpen && !event.target.contains(authModal)){
// //     console.log("inside clicked");
// //     // isSignUp = !isSignUp;
// //     isModalOpen = !isModalOpen;
// //     handleAuthModalVisibility();
// //    }
// // })

// authenticateBtn.addEventListener("click", () => {
//   isModalOpen = !isModalOpen;
//   isSignUp = !isSignUp;
//   handleAuthModalVisibility();
//   handleFormVisibility();
// });

// const signupForm = document.getElementById("signupForm");
// signupForm.addEventListener("submit", function (event) {
//   event.preventDefault();
//   spinner.style.display = "flex";
//   extractSignupFormValues();
// });

// const loginForm = document.getElementById("loginForm");
// loginForm.addEventListener("submit", function (event) {
//   event.preventDefault();
//   spinner.style.display = "flex";
//   extractLoginFormValues();
// });

// formToggleBtn.addEventListener("click", () => {
//   isSignUp = !isSignUp;
//   handleFormVisibility();
// });

// async function handleUserRegistration(name, email, password) {
//   console.log("inside handleUserRgistration");
//   try {
//     const response = await axios.post(
//       URL + "/register",
//       {
//         name,
//         email,
//         password,
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     isModalOpen = false;
//     isEmailModal = true;
//     spinner.style.display = "none";
//     handleAuthModalVisibility();
//     handleEmailModalVisibility();

    
//   } catch (error) {
//     console.log("error is: ", error);
//     spinner.style.display = "none";
//   }
// }

// async function handleUserLogin(email, password){
//     try{
//         const response = await axios.post(URL + '/login', {
//             email,
//             password
//         },{
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//         });

//         const userData = await response.data;
//         console.log("user data is: ", userData);
//         isModalOpen = false;
//     spinner.style.display = "none";
//     handleAuthModalVisibility();

//     } catch (error){
//        console.log("error while logging user: ", error);
//     }
// }
// function extractSignupFormValues() {
//   const name = document.getElementById("signup-name").value;
//   const email = document.getElementById("signup-email").value;
//   const password = document.getElementById("signup-password").value;
//   console.log("inside extactSignUpForm");
//   handleUserRegistration(name, email, password);
// }

// function extractLoginFormValues() {
//   const email = document.getElementById("login-email").value;
//   const password = document.getElementById("login-password").value;
//   handleUserLogin(email, password);

//   console.log("Login Form Values:");
//   console.log("Email:", email);
//   console.log("Password:", password);
// }
