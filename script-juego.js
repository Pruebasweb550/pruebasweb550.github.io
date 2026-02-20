/** * PARTE 1: ARRASTRAR Y SOLTAR (Drag & Drop + Mobile Touch)
 */
const words = document.querySelectorAll('.word');
const zones = document.querySelectorAll('.dropzone');

let activeElement = null;

// Lógica para PC (Drag & Drop)
words.forEach(word => {
    word.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text', e.target.innerText);
        e.target.classList.add('dragging');
    });
});

// Lógica para MÓVILES (Touch Events)
words.forEach(word => {
    word.addEventListener('touchstart', (e) => {
        activeElement = e.target;
        activeElement.classList.add('dragging');
    }, { passive: false });

    word.addEventListener('touchmove', (e) => {
        e.preventDefault(); // Previene el scroll mientras arrastras
        const touch = e.touches[0];
        // Opcional: podrías hacer que el elemento siga al dedo visualmente aquí
    }, { passive: false });

    word.addEventListener('touchend', (e) => {
        activeElement.classList.remove('dragging');
        const touch = e.changedTouches[0];
        // Detectar si soltamos sobre una zona
        const dropZone = document.elementFromPoint(touch.clientX, touch.clientY);
        
        const zone = dropZone?.closest('.dropzone');
        if (zone) {
            handleDrop(zone, activeElement.innerText);
        }
        activeElement = null;
    });
});

// Lógica común de soltar
zones.forEach(zone => {
    zone.addEventListener('dragover', (e) => e.preventDefault());
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('text');
        handleDrop(zone, data);
    });
});

function handleDrop(zone, data) {
    zone.innerText = data;
    const idNum = zone.id.replace('dz', '');
    const hiddenInput = document.getElementById('ans' + idNum);
    if(hiddenInput) hiddenInput.value = data;
}

/** * PARTE 2: UNIR CON LÍNEAS (Optimizado para Mobile)
 */
let selectedElement = null;
let connections = [];
const canvas = document.getElementById('canvasLineas');
const ctx = canvas.getContext('2d');

function initCanvas() {
    // Usamos el tamaño real del contenedor para evitar desfases
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    dibujarLineas(); // Redibujar si se cambia el tamaño (ej. rotar celular)
}

window.addEventListener('load', initCanvas);
window.addEventListener('resize', initCanvas);

// Selección con click/tap
document.querySelectorAll('.match-item, .match-img').forEach(el => {
    el.addEventListener('click', () => {
        if (selectedElement) {
            if (selectedElement !== el && selectedElement.className !== el.className) {
                hacerConexion(selectedElement, el);
                selectedElement.classList.remove('selected');
                selectedElement = null;
            } else {
                selectedElement.classList.remove('selected');
                selectedElement = (selectedElement === el) ? null : el;
                if(selectedElement) el.classList.add('selected');
            }
        } else {
            selectedElement = el;
            el.classList.add('selected');
        }
    });
});

function hacerConexion(el1, el2) {
    const textEl = el1.classList.contains('match-item') ? el1 : el2;
    const imgEl = el1.classList.contains('match-img') ? el1 : el2;
    connections = connections.filter(c => c.text !== textEl && c.img !== imgEl);
    connections.push({ text: textEl, img: imgEl });
    dibujarLineas();
}

function dibujarLineas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#2980b9";
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);

    const rectC = canvas.getBoundingClientRect();

    connections.forEach(c => {
        const rectT = c.text.getBoundingClientRect();
        const rectI = c.img.getBoundingClientRect();

        // Cálculo de coordenadas relativo al viewport del canvas
        const x1 = (rectT.left + rectT.right) / 2 - rectC.left;
        const y1 = (rectT.top + rectT.bottom) / 2 - rectC.top;
        const x2 = (rectI.left + rectI.right) / 2 - rectC.left;
        const y2 = (rectI.top + rectI.bottom) / 2 - rectC.top;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    });
}

// Validación y envío (Se mantiene igual)
document.getElementById('gameForm')?.addEventListener('submit', function(e) {
    const name = document.getElementById('student-name').value;
    if(!name) {
        alert("Please enter your name before submitting.");
        e.preventDefault();
    }
});

function verificarRespuestas() {
    let aciertos = 0;
    connections.forEach(c => {
        if (c.text.dataset.id === c.img.dataset.id) aciertos++;
    });
    alert(`Has logrado ${aciertos} de 5 conexiones correctas.`);
    document.getElementById('inputPuntaje').value = aciertos + "/5";
}

function verificarNivel2() {
    const correctAnswers = ["organized", "taller", "patient", "lighter", "bigger"];
    let score = 0;
    for (let i = 1; i <= 5; i++) {
        const zone = document.getElementById(`dz${i}`);
        const userAnswer = zone.innerText.trim().toLowerCase();
        if (userAnswer === correctAnswers[i - 1]) {
            zone.className = "dropzone correct";
            score++;
        } else {
            zone.className = "dropzone incorrect";
        }
        document.getElementById('ans' + i).value = userAnswer;
    }
    alert(`Level 2: You got ${score} out of 5 correct!`);
}
