// modal.js
import { cacheFurniture, createElement, getCart }   from './module.js';  
import { getCachedFurniture,
         getFurnitureById,
         HEART_STORAGE_KEY,
         CART_STORAGE_KEY,
         handleBuyClick,
         handleHeartClick,
         isCartItem,
         svgIcons,
         createBuyButton,
         createColorOptions,
         cartIdsSet      } from './module.js'; 


//--------------------------модально окно карточки товара-----------------------------------//
export async function openFurnitureModal(id){
  // 1. получаем все данные
  const f = getCachedFurniture(id);
  if (!f) {
    f = await getFurnitureById(id);
    cacheFurniture(f);
  }

  // 2. клонируем html‑шаблон
  const tpl  = document.getElementById('furniture-modal');
  const node = tpl.content.firstElementChild.cloneNode(true);
  const content = node.querySelector('.modal_content');

  // 3. наполняем
  content.appendChild(await buildContent(f));

  // 4. события закрытия
  AddEventClose(node);

  // 5. монтируем
  document.body.appendChild(node);
  document.body.classList.add('modal-open');

}


function AddEventClose(node){
  node.addEventListener('click', e=>{
     if (e.target.dataset.modalClose !== undefined) close(node);
  });
  document.addEventListener('keydown', esc);
  function esc(e){ if(e.key==='Escape') close(node); }

  function close(n){
    n.remove();
    document.body.classList.remove('modal-open');
    document.removeEventListener('keydown', esc);  
  }
}

async function isWebXR_AR_Supported () {
  if (!('xr' in navigator)) return false;              // старый браузер
  try {
    return await navigator.xr.isSessionSupported('immersive-ar');
  } catch {                                           // любая ошибка ⇒ нет
    return false;
  }
}

/* ───────── строим внутреннюю верстку ───────── */
async function buildContent(f){
  const wrap = document.createElement('div');
  wrap.className = 'modal_inner';

  /* левая колонка: галерея (пока одно изображение) */
  const left = createElement('div','modal_left');
  const img = createElement('img','modal_img',{src:f.images[0],alt:f.name});   
  const gallery = createElement('div','thumbs');

  let currentUrl = f.images[0]; 

  const tryItOnBtn = createElement('button','modal_tryBtn',{
    innerHTML:`
      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="32" height="32" viewBox="0,0,256,256">
      <g fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(8,8)"><path d="M27.115,7.889l-9.548,-5.513c-0.925,-0.534 -2.075,-0.533 -3,0l-9.548,5.513c-0.319,0.183 -0.576,0.436 -0.802,0.713c-0.076,0.069 -0.152,0.141 -0.205,0.235c-0.011,0.019 -0.01,0.039 -0.019,0.058c-0.297,0.472 -0.474,1.018 -0.474,1.592v11.025c0,1.068 0.575,2.064 1.5,2.599l9.548,5.512c0.463,0.268 0.981,0.401 1.501,0.401c0.519,0 1.037,-0.134 1.5,-0.4l9.548,-5.513c0.925,-0.534 1.5,-1.53 1.5,-2.599v-11.025c-0.001,-1.068 -0.576,-2.064 -1.501,-2.598zM6.019,22.379c-0.309,-0.178 -0.5,-0.51 -0.5,-0.866v-10.664l6.645,3.796c0.156,0.09 0.327,0.132 0.495,0.132c0.348,0 0.685,-0.181 0.869,-0.504c0.274,-0.479 0.107,-1.091 -0.372,-1.364l-6.45,-3.685l8.863,-5.117c0.153,-0.089 0.326,-0.133 0.499,-0.133c0.173,0 0.346,0.045 0.5,0.134l8.611,4.972l-9.716,6.072c-0.292,0.183 -0.47,0.503 -0.47,0.848v11.56zM26.115,22.379l-9.123,5.267v-11.091l9.623,-6.015v10.973c0,0.356 -0.191,0.688 -0.5,0.866z"></path></g></g>
      </svg>`});

  // tryItOnBtn.addEventListener('click', () => {
  //   if (/Android|iPhone/i.test(navigator.userAgent)|navigator.xr){
  //     location.href = `${location.origin}/ar-view.html?id=${f.id}`;
  //   }
  //   else{
  //     showARQr(f.id);
  //   }
  // });

  tryItOnBtn.addEventListener('click', async () => {
  const canRunAR = await isWebXR_AR_Supported();

  if (canRunAR) {
    // браузер умеет WebXR + AR — открываем нашу страницу с three.js
    location.href = `${location.origin}/ar-view.html?id=${f.id}`;
    return;
  }

  /* -------- fallback -------- */
  const isApple = /iPad|iPhone|Macintosh/.test(navigator.userAgent);

  if (isApple) {
    // iOS → сразу открываем Quick Look, если есть usdz
    const usdz = `${location.origin}/assets/models/${f.id}.usdz`;
    const a = document.createElement('a');
    a.rel  = 'ar';
    a.href = usdz;
    a.click();
  } else {
    // всё остальное → показываем QR-код
    showARQr(f.id);
  }
});

  const textBtn = createElement('p','textBtn',{textContent: 'Примерить онлайн'});
  tryItOnBtn.append(textBtn);

  f.images.forEach((url,i)=>{
      const t = createElement('img','thumb',{src:url,alt:`preview ${i}`});
      if(i === 0){
        t.classList.add('active');
      } 
      /* ———— наведение ———— */
     t.addEventListener('mouseenter', ()=> img.src = url);
     t.addEventListener('mouseleave', ()=> img.src = currentUrl);

    /* ———— клик ———— */
     t.addEventListener('click', ()=>{
         document.querySelector('.thumb.active')?.classList.remove('active');
         t.classList.add('active');
         currentUrl = url;        
         img.src    = url;
     });
      gallery.append(t);
  });

  /* правая колонка: инфо + кнопки */
  const info = createElement('div','modal_info');

  const name = createElement('p','furniture_name',{
      textContent:f.name
  });
  
  const size = createElement('p', 'furniture_size',{
      innerHTML:`
          <span class="icon_size">${svgIcons.size}</span>
          <span>${f.width} x ${f.height} x ${f.depth}</span>`});

  const color = createColorOptions(f);
  
  const p_price = createElement('p', 'furniture_price', { 
      textContent: `${f.price.toLocaleString('ru-RU')}` + ' ₽' 
  });

  const description = createElement('div','furniture_description',{innerHTML:`
    <p class="descTitle">Описание</p>
    <p class="description">${f.description}</p>`})

  /* кнопки «сердце» и «в корзину» переиспользуем */

  const heartList = await getCart(HEART_STORAGE_KEY);
  const basketList = await getCart(CART_STORAGE_KEY);

  const idSetCart = cartIdsSet(basketList);
  const actionBtn = createElement('div','actionBtn')
  const cartBtn = createBuyButton(f,isCartItem(f.id, idSetCart),{onBuyClick: handleBuyClick});

  const heart = createElement('span','heart',{
    innerHTML:svgIcons.heart
  });
  heart.dataset.id = f.id;
  const idSetHeart = cartIdsSet(heartList);
  if (isCartItem(f.id, idSetHeart))  heart.classList.add('heart_added');
  heart.addEventListener('click',()=>handleHeartClick(f,heart));


  actionBtn.append(cartBtn,heart);
  info.append(name, size, color,p_price, actionBtn, description);
  left.append(img,gallery,tryItOnBtn);
  wrap.append(left, info);
  return wrap;
}



// --------------------------модально окно qr-кода-----------------------------------//
function showARQr(productId) {
  const tpl  = document.getElementById('qr-modal');
  const node = tpl.content.firstElementChild.cloneNode(true);

  AddEventClose(node);

  document.body.appendChild(node); 
  console.log(window.location.host);
  const url = `https://${window.location.host}/ar-view.html?id=${productId}`;
  const canvas = document.getElementById('qrCanvas');

  QRCode.toCanvas(canvas, url, { width: 256 }, err => {
    if (err) console.error(err);
    document.querySelector('.qr-overlay').classList.add('open');
    node.classList.add('open'); 
  });

}



