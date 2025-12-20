// カート機能
document.addEventListener('DOMContentLoaded', function() {
  // カート数を更新
  updateCartDisplay();

  // カテゴリタブの切り替え
  const tabBtns = document.querySelectorAll('.tab-btn');
  const categories = document.querySelectorAll('.catalog-category');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const category = this.dataset.category;

      // タブのアクティブ状態を切り替え
      tabBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // カテゴリの表示を切り替え
      categories.forEach(cat => {
        if (cat.id === category) {
          cat.classList.remove('hidden');
        } else {
          cat.classList.add('hidden');
        }
      });
    });
  });

  // カートに入れるボタンのイベント
  const addCartBtns = document.querySelectorAll('.btn-add-cart');
  addCartBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const item = this.closest('.catalog-item');
      const id = item.dataset.id;
      const name = item.dataset.name;
      const price = parseInt(item.dataset.price);

      addToCart(id, name, price);
    });
  });
});

// カートに商品を追加
function addToCart(id, name, price) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // 既存の商品があれば数量を増やす
  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartDisplay();

  // 追加完了のフィードバック
  showAddedFeedback();
}

// カート表示を更新
function updateCartDisplay() {
  const cartCountEl = document.getElementById('cart-count');
  const checkoutBtn = document.getElementById('checkout-btn');

  if (!cartCountEl) return;

  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  cartCountEl.textContent = totalItems;

  // レジへ進むボタンの有効/無効を切り替え
  if (checkoutBtn) {
    if (totalItems > 0) {
      checkoutBtn.classList.remove('disabled');
    } else {
      checkoutBtn.classList.add('disabled');
    }
  }
}

// カート追加のフィードバック表示
function showAddedFeedback() {
  const cartLink = document.getElementById('cart-link');
  if (!cartLink) return;

  cartLink.classList.add('cart-added');
  setTimeout(() => {
    cartLink.classList.remove('cart-added');
  }, 300);
}
