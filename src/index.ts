// the canvas on which to draw
const canvas = document.getElementById('drawingCanvas') as HTMLCanvasElement | null;
if (!canvas) {
    throw new Error('Canvas element not found');
}

// the information about the canvas req.d for drawing
const ctx = canvas.getContext('2d');
if (!ctx) {
    throw new Error('Unable to get canvas 2D context');
}

// whether the user is actively drawing
let drawing = false;

// thickness of the line
let lineWeight = 5;
// all of the buttons that adjust the above
const lineWeightButtons = document.querySelectorAll('.line-weight-button');
lineWeightButtons.forEach(button => {
    // add the button functionality
    button.addEventListener('click', (event) => {
        const target = event.currentTarget as HTMLButtonElement;
        lineWeight = parseInt(target.getAttribute('thickness') || '5');
    });
    // size the "dot" <div> elements accordingly
    const dot = button.querySelector('.line-weight-dot') as HTMLDivElement;
    const weight = (button.getAttribute('thickness') || '5') + 'px';
    dot.style.height = weight;
    dot.style.width  = weight;
});

// color of the canvas itself
let bgCurrentColor = '#FFFFFF';
// all of the buttons that adjust the above
const bgColorButtons = document.querySelectorAll('.bg-color-button');
bgColorButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const target = event.target as HTMLButtonElement;
        bgCurrentColor = target.getAttribute('color-code') || '#FFFFFF';
        canvas.style.backgroundColor = bgCurrentColor;
    });
});

// color of the line to draw
let fgCurrentColor = '#000000';
// all of the buttons that adjust the above
const fgColorButtons = document.querySelectorAll('.fg-color-button');
// all of the dots in the line weight buttons
const lineWeightDots = document.querySelectorAll('.line-weight-dot');
fgColorButtons.forEach(button => {
    // add the button functionality
    // this includes changing the color of the line weight dots to reflect the line color
    button.addEventListener('click', (event) => {
        const target = event.target as HTMLButtonElement;
        fgCurrentColor = target.getAttribute('color-code') || '#000000';
        lineWeightDots.forEach((dot) => {
            (dot as HTMLDivElement).style.backgroundColor = fgCurrentColor;
        })
    });
});

// previous states of the canvas to allow for undoing actions
const undoStack: ImageData[] = [];

// save the current state of the canvas into undoStack
const saveState = () => {
    if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        undoStack.push(imageData);
    }
};

// restore the previous canvas state and update undoStack accordingly
const restoreState = () => {
    if (undoStack.length > 0 && ctx) {
        const imageData = undoStack.pop();
        if (imageData) {
            ctx.putImageData(imageData, 0, 0);
        }
    }
};

// the undo button and its funnctionality
const undoButton = document.getElementById('undo') as HTMLButtonElement;
if (undoButton) {
    undoButton.addEventListener('click', restoreState);
}

// remove all lines from the canvas, and reset background and line colors
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

// the clear button and its functionality
const clearButton = document.getElementById('clear') as HTMLButtonElement;
if (clearButton) {
    clearButton.addEventListener('click', clearCanvas);
}

// start a line, save the previous canvas state
const startDrawing = (event: MouseEvent) => {
    drawing = true;
    saveState();
    draw(event);
};

// stop drawing
const stopDrawing = () => {
    drawing = false;
    ctx.beginPath();
};

// actually draw the line following the mouse
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

// make sure mouse input calls the correct functions
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);