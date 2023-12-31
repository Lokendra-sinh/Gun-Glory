

const welcomeModal = document.querySelector('.welcome-modal');
const modalGuestButton = document.querySelector('.modal-guest-button');

const createRoomBtn = document.querySelector('.create-room-button');
const joinRoomBtn = document.querySelector('.join-room-button');
const createRoomModal = document.querySelector('.create-room-modal');
const createRoomModalButton = document.querySelector('.create-room-modal-button');
const createRoomModalInput = document.querySelector('.create-room-modal-input');
const joinRoomModal = document.querySelector('.join-room-modal');
const joinRoomModalButton = document.querySelector('.join-room-modal-button');
const joinRoomModalInput = document.querySelector('.join-room-modal-input');

const canvas = document.getElementById('canvas');

let isWelcomeModalOpen = false;
let isCreateRoomModalOpen = false;
let isJoinRoomModalOpen = false;
let roomId = '';

function handleWelcomeModalVisibility(){
    welcomeModal.style.display = isWelcomeModalOpen ? 'flex' : 'none';
}

modalGuestButton.addEventListener('click', ()=> {
    isWelcomeModalOpen = false;
    handleWelcomeModalVisibility();
    canvas.style.display = 'flex';
})

function handleCreateRoomModalVisibility(){
    createRoomModal.style.display = isCreateRoomModalOpen ? 'flex' : 'none';
}

function handleJoinRoomModalVisibility(){
    joinRoomModal.style.display = isJoinRoomModalOpen ? 'flex' : 'none';
}

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