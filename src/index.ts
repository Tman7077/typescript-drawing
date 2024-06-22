const canvas = document.getElementById('drawingCanvas') as HTMLCanvasElement | null;
if (!canvas) {
    throw new Error('Canvas element not found');
}

const ctx = canvas.getContext('2d');
if (!ctx) {
    throw new Error('Unable to get canvas 2D context');
}

let drawing = false;

let lineWeight = 5;
const lineWeightButtons = document.querySelectorAll('.line-weight-button');
lineWeightButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const target = event.currentTarget as HTMLButtonElement;
        lineWeight = parseInt(target.getAttribute('thickness') || '5');
    });
    const dot = button.querySelector('.line-weight-dot') as HTMLDivElement;
    const weight = (button.getAttribute('thickness') || '5') + 'px';
    dot.style.height = weight;
    dot.style.width  = weight;
});

let bgCurrentColor = '#FFFFFF';
const bgColorButtons = document.querySelectorAll('.bg-color-button');
bgColorButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const target = event.target as HTMLButtonElement;
        bgCurrentColor = target.getAttribute('color-code') || '#FFFFFF';
        canvas.style.backgroundColor = bgCurrentColor;
    });
});

let fgCurrentColor = '#000000';
const fgColorButtons = document.querySelectorAll('.fg-color-button');
const lineWeightDots = document.querySelectorAll('.line-weight-dot');
fgColorButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const target = event.target as HTMLButtonElement;
        fgCurrentColor = target.getAttribute('color-code') || '#000000';
        lineWeightDots.forEach((dot) => {
            (dot as HTMLDivElement).style.backgroundColor = fgCurrentColor;
        })
    });
});

const undoStack: ImageData[] = [];

const saveState = () => {
    if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        undoStack.push(imageData);
    }
};

const restoreState = () => {
    if (undoStack.length > 0 && ctx) {
        const imageData = undoStack.pop();
        if (imageData) {
            ctx.putImageData(imageData, 0, 0);
        }
    }
};

const undoButton = document.getElementById('undo') as HTMLButtonElement;
if (undoButton) {
    undoButton.addEventListener('click', restoreState);
}

const clearCanvas = () => {
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        undoStack.length = 0;
        bgCurrentColor = '#FFFFFF';
        canvas.style.backgroundColor = bgCurrentColor;
        fgCurrentColor = '#000000';
        lineWeightDots.forEach((dot) => {
            (dot as HTMLDivElement).style.backgroundColor = fgCurrentColor;
        })
    }
}

const clearButton = document.getElementById('clear') as HTMLButtonElement;
if (clearButton) {
    clearButton.addEventListener('click', clearCanvas);
}

const startDrawing = (event: MouseEvent) => {
    drawing = true;
    saveState();
    draw(event);
};

const stopDrawing = () => {
    drawing = false;
    ctx.beginPath();
};

const draw = (event: MouseEvent) => {
    if (!drawing) return;

    ctx.lineWidth = lineWeight;
    ctx.lineCap = 'round';
    ctx.strokeStyle = fgCurrentColor;

    ctx.lineTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
};

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);