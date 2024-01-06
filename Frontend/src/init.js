const welcomeModal = document.querySelector('.welcome-modal');
const modalGuestButton = document.querySelector('.modal-guest-button');
const guestButton = document.querySelector('.guest-button');

const createRoomBtn = document.querySelector('.create-room-button');
const joinRoomBtn = document.querySelector('.join-room-button');
const createRoomModal = document.querySelector('.create-room-modal');
const createRoomModalButton = document.querySelector('.create-room-modal-button');
const createRoomModalInput = document.querySelector('.create-room-modal-input');
const closeCreateRoomModalButton = document.querySelector('.close-create-room-modal-button');
const joinRoomModal = document.querySelector('.join-room-modal');
const joinRoomModalButton = document.querySelector('.join-room-modal-button');
const joinRoomModalInput = document.querySelector('.join-room-modal-input');
const closeJoinRoomModalButton = document.querySelector('.close-join-room-modal-button');


const roomLobbyOverlay = document.querySelector('.room-lobby-overlay');
const roomLobby = document.querySelector('.room-lobby');
const roomLobbyHeaderText = document.querySelector('.room-lobby-header-text');
const roomLobbyLeaveButton = document.querySelector('.room-lobby-leave-button');
const roomLobbyStartButton = document.querySelector('.room-lobby-start-button');

const playersContainer = document.querySelector('.players-container');

//room error modal and elements

const roomErrorOverlay = document.querySelector('.room-error-overlay');
const roomErrorText = document.querySelector('.room-error-text');
const roomErrorButton = document.querySelector('.room-error-button');

//game over modal and elements

const gameOverOverlay = document.querySelector('.game-over-overlay');
const gameOverModal = document.querySelector('.game-over-modal');
const gameOverText = document.querySelector('.game-over-text');
const gameOverCloseButton = document.querySelector('.game-over-close-button');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
const dpi = window.devicePixelRatio || 1;
canvas.width = 1024;
canvas.height = 576;
ctx.scale(dpi, dpi);

let isWelcomeModalOpen = false;
let isCreateRoomModalOpen = false;
let isJoinRoomModalOpen = false;

let gameStarted = false;
let userLoggedIn = false;

const URL = "http://localhost:4000";
const rooms = {};
const user = {
    name: '',
    email: '',
};



function handleWelcomeModalVisibility(){
    welcomeModal.style.display = isWelcomeModalOpen ? 'flex' : 'none';
  }

modalGuestButton.addEventListener('click', ()=> {
    isWelcomeModalOpen = false;
    handleWelcomeModalVisibility();
    canvas.style.display = 'flex';
})

closeCreateRoomModalButton.addEventListener('click', ()=> {
    createRoomModalInput.value = '';
    createRoomModal.style.display = 'none';
})

closeJoinRoomModalButton.addEventListener('click', ()=> {
    joinRoomModalInput.value = '';
    joinRoomModal.style.display = 'none';
})


//event listeners to handle modal closing

window.addEventListener('click', (e)=> {
    if(roomLobbyOverlay.style.display === 'flex' && !roomLobby.contains(e.target)){
        roomLobbyOverlay.style.display = 'none';
        gameStarted = false;
        socket.emit('gameStopped', roomId);
    }
});