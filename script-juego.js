const words = document.querySelectorAll('.word');
const zones = document.querySelectorAll('.dropzone');

// Lógica de arrastrar
words.forEach(word => {
    word.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text', e.target.innerText);
        e.target.classList.add('dragging');
    });
});

// Lógica de soltar
zones.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('text');
        zone.innerText = data;
        
        // Guardar la respuesta en el input oculto correspondiente para el envío
        const idNum = zone.id.replace('dz', '');
        document.getElementById('ans' + idNum).value = data;
    });
});

// Antes de enviar, verificar que el nombre esté puesto
document.getElementById('gameForm').addEventListener('submit', function(e) {
    const name = document.getElementById('student-name').value;
    if(!name) {
        alert("Please enter your name before submitting.");
        e.preventDefault();
    }
});


let selectedElement = null;
let connections = []; // Guarda objetos: { text: el, image: el }

const canvas = document.getElementById('canvasLineas');
const ctx = canvas.getContext('2d');

// Ajustar tamaño del canvas
function initCanvas() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
}

window.onload = initCanvas;
window.onresize = initCanvas;

// Selección de elementos
document.querySelectorAll('.match-item, .match-img').forEach(el => {
    el.addEventListener('click', () => {
        if (selectedElement) {
            // Si el segundo clic es de la columna opuesta, conectamos
            if (selectedElement.className !== el.className) {
                hacerConexion(selectedElement, el);
                selectedElement.classList.remove('selected');
                selectedElement = null;
            } else {
                // Si hace clic en la misma columna, cambia la selección
                selectedElement.classList.remove('selected');
                selectedElement = el;
                el.classList.add('selected');
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

    // Eliminar conexión previa si el elemento ya estaba unido
    connections = connections.filter(c => c.text !== textEl && c.img !== imgEl);
    
    connections.push({ text: textEl, img: imgEl });
    dibujarLineas();
}

function dibujarLineas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#2980b9";
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]); // Línea punteada para estilo de examen

    connections.forEach(c => {
        const rectT = c.text.getBoundingClientRect();
        const rectI = c.img.getBoundingClientRect();
        const rectC = canvas.getBoundingClientRect();

        // Calcular puntos medios
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

function verificarRespuestas() {
    let aciertos = 0;
    connections.forEach(c => {
        if (c.text.dataset.id === c.img.dataset.id) {
            aciertos++;
        }
    });

    alert(`Has logrado ${aciertos} de 5 conexiones correctas.`);
    document.getElementById('inputPuntaje').value = aciertos + "/5";
}



function verificarNivel2() {
    // Definimos las respuestas correctas en orden (dz1 a dz5)
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
    }

    // Guardar el puntaje final para el envío por correo
    const hiddenInputs = [
        document.getElementById('ans1'),
        document.getElementById('ans2'),
        document.getElementById('ans3'),
        document.getElementById('ans4'),
        document.getElementById('ans5')
    ];

    // Actualizar los inputs ocultos con lo que hay en las zonas por si acaso
    for (let i = 0; i < 5; i++) {
        hiddenInputs[i].value = document.getElementById(`dz${i+1}`).innerText;
    }

    alert(`Level 2: You got ${score} out of 5 correct!`);
}