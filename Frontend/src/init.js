const welcomeModal = document.querySelector('.welcome-modal');
const modalGuestButton = document.querySelector('.modal-guest-button');
const guestButton = document.querySelector('.guest-button');

const createRoomBtn = document.querySelector('.create-room-button');
const joinRoomBtn = document.querySelector('.join-room-button');
const createRoomModal = document.querySelector('.create-room-modal');
const createRoomModalButton = document.querySelector('.create-room-modal-button');
const createRoomModalInput = document.querySelector('.create-room-modal-input');
const joinRoomModal = document.querySelector('.join-room-modal');
const joinRoomModalButton = document.querySelector('.join-room-modal-button');
const joinRoomModalInput = document.querySelector('.join-room-modal-input');


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

let roomId = '';
let gameStarted = false;
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