export function openModal(id) {
  document.getElementById(id).classList.add('active')
}

export function closeModal(id) {
  document.getElementById(id).classList.remove('active')
}

export function createModalHTML(id, content) {
  return `
    <div class="modal-overlay" id="${id}" onclick="if(event.target===this)this.classList.remove('active')">
      <div class="modal">${content}</div>
    </div>
  `
}
