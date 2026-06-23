export function confirmDialog(message) {
  return new Promise(resolve => {
    const overlay = document.createElement('div')
    overlay.className = 'modal-overlay active'
    overlay.style.display = 'flex'
    overlay.innerHTML = `
      <div class="modal" style="text-align:center;max-width:380px">
        <p style="color:var(--text-gray-light);font-size:1.05rem;margin-bottom:20px">${message}</p>
        <div class="modal-btns">
          <button class="btn btn-primary" id="confirmYes">نعم</button>
          <button class="btn btn-ghost" id="confirmNo">إلغاء</button>
        </div>
      </div>`
    document.body.appendChild(overlay)
    overlay.querySelector('#confirmYes').addEventListener('click', () => { overlay.remove(); resolve(true) })
    overlay.querySelector('#confirmNo').addEventListener('click', () => { overlay.remove(); resolve(false) })
    overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); resolve(false) } })
  })
}
