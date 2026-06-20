// jai shri ram
const list_of_product = document.querySelector('.list_of_products');
if (list_of_product) {
Object.keys(shopCategories).forEach(element => {
    list_of_product.innerHTML += createproduct(element,shopCategories[element]);
});}

function createproduct(nameOfTheCategory,catogary) {
   const name1 = catogary.subcategories[0].name;
    const name2 = catogary.subcategories[1].name;
    const name3 = catogary.subcategories[2].name;
    const name4 = catogary.subcategories[3].name;

    const img1 = catogary.subcategories[0].img;
    const img2 = catogary.subcategories[1].img;
    const img3 = catogary.subcategories[2].img;
    const img4 = catogary.subcategories[3].img;

    return `<div class="category_in_list_of_products">
        <div class="Heding_in_category">${nameOfTheCategory}</div>
        <div class="images_in_catogray1">
          <img rel="preload" src="${img1}" alt="Category 1">
          <img rel="preload" src="${img2}" alt="Category 1">
          <div class="span_div_with_gap">
            <span>${name1}</span>
            <span>${name2}</span>
          </div>
        </div>

        <div class="images_in_catogray2">
          <img rel="preload" src="${img3}" alt="Category 1">
          <img rel="preload" src="${img4}" alt="Category 1">
          <div class="span_div_with_gap">
            <span>${name3}</span>
            <span>${name4}</span>
          </div>
        </div>
      </div>`
}
const productTitles = document.querySelector('.product-title');

productTitles.addEventListener('click', () => {
    window.location.href = 'item.html';
});