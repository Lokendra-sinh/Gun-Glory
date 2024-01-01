

const welcomeModal = document.querySelector('.welcome-modal');
const modalGuestButton = document.querySelector('.modal-guest-button');
const authButton = document.querySelector('.auth-button');

const createRoomBtn = document.querySelector('.create-room-button');
const joinRoomBtn = document.querySelector('.join-room-button');
const createRoomModal = document.querySelector('.create-room-modal');
const createRoomModalButton = document.querySelector('.create-room-modal-button');
const createRoomModalInput = document.querySelector('.create-room-modal-input');
const joinRoomModal = document.querySelector('.join-room-modal');
const joinRoomModalButton = document.querySelector('.join-room-modal-button');
const joinRoomModalInput = document.querySelector('.join-room-modal-input');

const authModal = document.querySelector('.auth-modal');
const loginForm = document.querySelector('.login-form');
const signupForm = document.querySelector('.signup-form');
const formToggleBtn = document.querySelector('.form-toggle-button');
const formToggleText = document.querySelector('.form-toggle-text');


const canvas = document.getElementById('canvas');

let isWelcomeModalOpen = false;
let isCreateRoomModalOpen = false;
let isJoinRoomModalOpen = false;
let isAuthModalOpen = false;
let isSignUpModalOpen = false;
let isLoginModalOpen = false;
let roomId = '';

function handleWelcomeModalVisibility(){
    welcomeModal.style.display = isWelcomeModalOpen ? 'flex' : 'none';
}

function handleCreateRoomModalVisibility(){
    createRoomModal.style.display = isCreateRoomModalOpen ? 'flex' : 'none';
}

function handleJoinRoomModalVisibility(){
    joinRoomModal.style.display = isJoinRoomModalOpen ? 'flex' : 'none';
}

function handleAuthModalVisibility(){
    authModal.style.display = isAuthModalOpen ? 'flex' : 'none';
    loginForm.style.display = isLoginModalOpen ? 'flex' : 'none';
    signupForm.style.display = isSignUpModalOpen ? 'flex' : 'none';
    formToggleBtn.textContent = isSignUpModalOpen ? 'Sign in' : 'Sign Up';
    formToggleText.textContent = isSignUpModalOpen ? `Already have an account?` : `Don't have an account?`;
};

createRoomBtn.addEventListener('click', ()=> {
    isCreateRoomModalOpen = !isCreateRoomModalOpen;
    isJoinRoomModalOpen === true ? isJoinRoomModalOpen = false : '';
    handleJoinRoomModalVisibility();
    handleCreateRoomModalVisibility();
})

joinRoomBtn.addEventListener('click', ()=> {
    console.log("inside join room");
    isJoinRoomModalOpen = !isJoinRoomModalOpen;
    isCreateRoomModalOpen === true ? isCreateRoomModalOpen = false : '';
    handleCreateRoomModalVisibility();
    console.log("isJoinRoomModalOpen: ", isJoinRoomModalOpen);
    handleJoinRoomModalVisibility();
})

modalGuestButton.addEventListener('click', ()=> {
    isWelcomeModalOpen = false;
    handleWelcomeModalVisibility();
    canvas.style.display = 'flex';
})

authButton.addEventListener('click', ()=> {
    isAuthModalOpen = !isAuthModalOpen;
    if(isAuthModalOpen) {
        isSignUpModalOpen = false;
        isLoginModalOpen = true;
    }
    handleAuthModalVisibility();
})

formToggleBtn.addEventListener('click', ()=> {
    isSignUpModalOpen = !isSignUpModalOpen;
    isLoginModalOpen = !isLoginModalOpen;
    handleAuthModalVisibility();
});