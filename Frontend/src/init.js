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

const roomLobbyOverlay = document.querySelector('.room-lobby-overlay');
const roomLobby = document.querySelector('.room-lobby');
const roomLobbyHeaderText = document.querySelector('.room-lobby-header-text');
const roomLobbyLeaveButton = document.querySelector('.room-lobby-leave-button');
const roomLobbyStartButton = document.querySelector('.room-lobby-start-button');

const playersContainer = document.querySelector('.players-container');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
const dpi = window.devicePixelRatio || 1;
canvas.width = 1024;
canvas.height = 576;
ctx.scale(dpi, dpi);

let isWelcomeModalOpen = false;
let isCreateRoomModalOpen = false;
let isJoinRoomModalOpen = false;
let isAuthModalOpen = false;
let isSignUpModalOpen = false;
let isLoginModalOpen = false;
let roomId = '';
let gameStarted = false;
const rooms = {};


function handleAuthModalVisibility(){
    authModal.style.display = isAuthModalOpen ? 'flex' : 'none';
    loginForm.style.display = isLoginModalOpen ? 'flex' : 'none';
    signupForm.style.display = isSignUpModalOpen ? 'flex' : 'none';
    formToggleBtn.textContent = isSignUpModalOpen ? 'Sign in' : 'Sign Up';
    formToggleText.textContent = isSignUpModalOpen ? `Already have an account?` : `Don't have an account?`;
};

function handleWelcomeModalVisibility(){
    welcomeModal.style.display = isWelcomeModalOpen ? 'flex' : 'none';
  }

modalGuestButton.addEventListener('click', ()=> {
    isWelcomeModalOpen = false;
    handleWelcomeModalVisibility();
    canvas.style.display = 'flex';
})

authButton.addEventListener('click', ()=> {
    isAuthModalOpen = !isAuthModalOpen;
    if(isAuthModalOpen) {
        joinRoomModal.style.display = 'none';
        createRoomModal.style.display = 'none';
        isLoginModalOpen = true;
        isSignUpModalOpen = false;
    }
    handleAuthModalVisibility();
})

formToggleBtn.addEventListener('click', ()=> {
    isSignUpModalOpen = !isSignUpModalOpen;
    isLoginModalOpen = !isLoginModalOpen;
    handleAuthModalVisibility();
});



window.addEventListener('click', (e)=> {
    if(roomLobbyOverlay.style.display === 'flex' && !roomLobby.contains(e.target)){
        roomLobbyOverlay.style.display = 'none';
        gameStarted = false;
        socket.emit('gameStopped', roomId);
    }

    // if(joinRoomModal.style.display === 'flex' && !joinRoomModal.contains(e.target)){
    //     joinRoomModal.style.display = 'none';
    // }

    // if(createRoomModal.style.display === 'flex' && !createRoomModal.contains(e.target)){
    //     isCreateRoomModalOpen = false;
    //     createRoomModal.style.display = 'none';
    // }
});