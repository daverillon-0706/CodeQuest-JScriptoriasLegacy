export default class ShopUI {
  constructor(onClose, onBuy) {
    this.root = document.getElementById("shop-ui");
    this.itemsContainer = document.getElementById("shop-items");
    this.closeBtn = document.getElementById("shop-close");

    this.onClose = onClose;
    this.onBuy = onBuy;

    this.closeBtn.onclick = () => this.hide(true);
  }

  show(items) {
  this.itemsContainer.innerHTML = "";

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "shop-item";

    div.innerHTML = `
      <img src="/assets/icons/item/consumables/${item.icon}" class="shop-icon">
      <div class="shop-info">
        <b>${item.name}</b>
        <p>${item.desc}</p>
        <img src="/assets/icons/hud/cryptos.png" alt="cryptos">
        <span>${item.price} C</span>
      </div>
      <button data-id="${item.id}">Buy</button>
    `;

    div.querySelector("button").onclick = () => {
  if (this.onBuy) this.onBuy(item);
  this.soundManager.play('kaching');
};



    this.itemsContainer.appendChild(div);
  });

  this.root.classList.remove("shop-hidden");
}


  /**
   * @param {boolean} triggerSystemClose
   */
  hide(triggerSystemClose = false) {
    this.root.classList.add("shop-hidden");

    // Only notify system if user initiated close
    if (triggerSystemClose && this.onClose) {
      this.onClose();
    }
  }
}
