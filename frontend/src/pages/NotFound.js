export function renderNotFound() {
  return `
    <div class="page active" id="page-404" style="display:flex;align-items:center;justify-content:center;min-height:80vh;text-align:center">
      <div>
        <div style="width:80px;height:80px;border-radius:50%;background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 24px">
          <i class="fas fa-map-signs" style="font-size:2rem;color:#EF4444"></i>
        </div>
        <h1 style="font-size:4rem;font-weight:900;line-height:1">404</h1>
        <p style="color:var(--text-gray-muted);font-size:1.1rem;margin:12px 0 28px">الصفحة اللي بتدور عليها مش موجودة</p>
        <button class="btn btn-primary page-btn" data-page="home"><i class="fas fa-arrow-right"></i> الرجوع للرئيسية</button>
      </div>
    </div>
  `
}
