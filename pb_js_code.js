
//  Камер асаах 
async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({video: { facingMode: 'user' }, audio: false});  // "камер ашиглах зөвшөөрөл" асууна
    //video нэртэй тогтмол (variable) зарлаж байна.
    const video= document.getElementById('video');  //id="video" гэсэн шинж чанар бүхий элементийг хайж олоод, дээрх video хувьсагчид хадгална.
    video.srcObject =stream;  // Камерын дүрсийг видео таг руу холбох
    
}
startCamera(); 


//Зураг авах (Canvas)

async function capturePhoto(){
    flashEffect();
    playSound();

    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 1. видео
    ctx.filter = getComputedStyle(video).filter;
    ctx.drawImage(video, 0, 0);
    ctx.filter = 'none';

    // 2. sticker
    drawStickers(ctx);

    // 3. frame
    drawFrame(ctx);

    const dataURL = canvas.toDataURL('image/png');
    savePhoto(dataURL);
}

// CSS filter нь зургийн өнгийг өөрчилнө
const filters = {
    normal: 'none',
    pink: 'brightness(1.15) saturate(1.4) sepia(0.1) hue-rotate(-5deg) contrast(1.1)',
    warm: 'sepia(30%) saturate(140%) brightness(105%) hue-rotate(-10deg)',
    //saturate(1.3): Зургийн өнгөний нягтралыг (ханасан байдал) 30%-иар нэмэгдүүлнэ. Ингэснээр өнгөнүүд илүү тод, гүн болж харагддаг.
    bw: 'grayscale(1)',//өнгөгүй хар цагаан болгоно
    vintage: 'sepia(0.6) contrast(1.1) brightness(0.95)'
    //шар туяатай (sepia) болгож, хуучирсан цаас шиг харагдуулна.
    //contrast(1.1) ~> Зургийн тодорч ялгарах байдлыг (контраст) 10%-иар нэмэгдүүлнэ.
    //brightness(0.95) ~> Зургийн гэрлийг 5%-иар багасгаж, ялимгүй бараан болгоно.
};
function applyFilter(name){
    const video = document.getElementById('video');
    video.style.filter = filters[name];
    // video-н харагдах байдлыг өөрчилнө
    // Зураг авахад canvas дээр ч мөн адил хэрэглэнэ
}
function drawStickers(ctx){
    const stickers = document.querySelectorAll('#sticker-layer div');

    stickers.forEach(sticker => {
        const x = sticker.offsetLeft;
        const y = sticker.offsetTop;
        const size = parseInt(sticker.style.fontSize);

        ctx.font = size + "px serif";
        ctx.fillText(sticker.innerText, x, y);
    });
}
// SVG = вектор зураг, хэмжээ өөрчлөхөд буурахгүй
const heartFrame = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<rect x="4" y="4" width="392" height="292"
    fill = "none"
    stroke = "#e57198"
    stroke-width="6"
    sroke-dasharray ="14.6"
    <!--
      fill="none"        = дотор нь хоосон (камер харагдана)
      stroke             = зах шугамын өнгө
      stroke-dasharray   = тасархай шугам
    -->
    <text x="20" y="50" font-size="36">💕</text>
  </svg>
`;
const pinkFrame = `
<svg viewBox="0 0 400 300">
  <rect x="5" y="5" width="390" height="290"
    fill="none"
    stroke="#ff8fab"
    stroke-width="10"
    rx="30"/>
</svg>
`;

const starFrame = `
<svg viewBox="0 0 400 300">
  <rect x="5" y="5" width="390" height="290"
    fill="none"
    stroke="gold"
    stroke-width="6"
    stroke-dasharray="10"/>
</svg>
`;
function applyFrame(svgString) {
  const overlay = document.getElementById('frame-overlay');
  overlay.innerHTML = svgString;
  // SVG-г div дотор тавьж, position:absolute-р
  // видео дээр давхарлана
}

// FRAME ЗУРАХ
function drawFrame(ctx){
    const overlay = document.getElementById('frame-overlay');
    if(overlay.innerHTML){
        const img = new Image();
        const svg = new Blob([overlay.innerHTML], {type:"image/svg+xml"});
        const url = URL.createObjectURL(svg);

        img.onload = () => {
            ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
            URL.revokeObjectURL(url);
        };
        img.src = url;
    }
}

function shootWithTimer(seconds){
    let remaining = seconds;
    //setInterval(...): Энэ нь заасан хугацааны давтамжтайгаар (миллисекундээр) доторх кодыг дахин дахин ажиллуулдаг функц юм.

    // setInterval = N миллисекунд тутамд давтана
    const interval = setInterval(() => {
        showCountdown(remaining); // "3", "2", "1" харуулна
        remaining--;
        if(remaining < 0){
            clearInterval(interval); // давтахаа болино
            capturePhoto(); // зураг дарна
        }
    }, 1000); // 1000ms = 1 секунд
}

function savePhoto(dataURL){
    const strip = document.getElementById('strip');
    const img = document.createElement('img');
    img.src = dataURL;
    img.style.width = '120px';
    img.style.margin = '5px';
    strip.appendChild(img);
}//Дарсан зураг доор гарч ирнэ

function downloadPhoto(dataURL){
    const link = document.createElement('a');
    link.download = 'zurag.png';
    link.href = dataURL;
    link.click(); // автоматаар дарна = татаж авна
}

//Камер ашиглахгүй ~> Гар утас / компьютерээс зураг оруулж болно
function uploadImage(event){
    const file = event.target.files[0]; //гэдэг нь JavaScript дээр хэрэглэгчийн веб хуудас руу оруулсан (upload) файлуудаас хамгийн эхний файлыг нь сонгож авч байгаа код юм.
    const reader = new FileReader(); //JavaScript дээр хэрэглэгчийн компьютер дээрх файлыг (жишээ нь: зураг, текст файл) вэб хөтөч дотор унших боломжийг олгодог
    reader.onload = function(e){
        savePhoto(e.target.result);
    };
    reader.readAsDataURL(file);
}
async function createStrip(){
    const strip = document.getElementById("camera-wrap");

    const canvas = await html2canvas(strip, {
        useCORS: true,
        backgroundColor: null
    });

    const image = canvas.toDataURL("image/png");
    downloadPhoto(image);
}

function createStrip(){
    const images = document.querySelectorAll('#strip img');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const width = 320;
    const imgHeight = 200;
    const gap = 20;
    const padding = 20;

    const height = images.length * (imgHeight + gap) + 120;

    canvas.width = width;
    canvas.height = height;

    // BACKGROUND
    ctx.fillStyle = "#fff0f5";
    ctx.fillRect(0,0,width,height);

    // зураг
    images.forEach((img, i) => {
        ctx.drawImage(img, 30, 20 + i*(imgHeight+gap), 260, imgHeight);
    });

    // FRAME BORDER
    ctx.strokeStyle = "#ff8fab";
    ctx.lineWidth = 6;
    ctx.strokeRect(5,5,width-10,height-10);

    // TITLE
    ctx.fillStyle = "#ff5c8a";
    ctx.font = "20px Comic Sans MS";
    ctx.fillText("My PhotoBooth 💕", 70, height-20);

    const finalImage = canvas.toDataURL('image/png');
    downloadPhoto(finalImage);
}

function runCountdown(seconds){
    return new Promise(resolve => { 
        let count = seconds;
        const interval = setInterval(() => {
            showCountdown(count);
            count--;

            if(count<0){
                clearInterval(interval);
                showCountdown('');
                resolve();
            }
        }, 1000);
    });
}

function showCountdown(num){
  const el = document.getElementById('countdown');
  el.innerText = num > 0 ? num : '';
}

async function multiShot(){
  for(let i = 0; i < 4; i++){
    await runCountdown(3);
    capturePhoto();
  }
}

function addSticker(emoji){
    const layer = document.getElementById('sticker-layer');
    const sticker = document.createElement('div');

    sticker.innerText = emoji;
    sticker.style.position = 'absolute';
    sticker.style.top = '50%';
    sticker.style.left = '50%';
    sticker.style.fontSize = '40px';
    sticker.style.cursor = 'move';
    
    // DRAG
    sticker.onmousedown = function(){
        document.onmousemove = function(e){
            sticker.style.left = e.pageX + 'px';
            sticker.style.top = e.pageY + 'px';
        };
        document.onmouseup = function(){
            document.onmousemove = null;
        };
    };

    sticker.ontouchmove = function(e){
        const touch = e.touches[0];
        sticker.style.left = touch.pageX + 'px';
        sticker.style.top = touch.pageY + 'px';
    };
    // RESIZE
    sticker.onwheel = function(e){
        let size = parseInt(sticker.style.fontSize);
        size += (e.deltaY < 0 ? 5 : -5);
        sticker.style.fontSize = size + 'px';
    };

    layer.appendChild(sticker);
}

function showFinal(image){
    const preview = document.getElementById('final-preview');
    preview.innerHTML = `<img src="${image}" style="width:200px; border-radius:20px;">`;
}
function flashEffect(){
    const flash = document.getElementById('flash');
    flash.style.opacity = 1;
    setTimeout(() => {
        flash.style.opacity = 0;
    }, 100);
}
function playSound(){
    document.getElementById('shutter').play();
}

function addImageSticker(event){
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e){
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.position = 'absolute';
        img.style.width = '80px';
        img.style.top = '50%';
        img.style.left = '50%';
        img.style.cursor = 'move';

        img.onmousedown = function(){
            document.onmousemove = function(e){
                img.style.left = e.pageX + 'px';
                img.style.top = e.pageY + 'px';
            };
            document.onmouseup = function(){
                document.onmousemove = null;
            };
        };

        document.getElementById('sticker-layer').appendChild(img);
    };

    reader.readAsDataURL(file);
}