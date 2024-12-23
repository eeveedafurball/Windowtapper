async function wait(ms) {
    return new Promise((res, rej) => {
        setTimeout(res, ms);
    });
}

// Web Audio API setup
function setupAudioContext() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    return { audioContext, analyser, dataArray };
}

async function start() {
    let music = new Audio("wavetapper.mp3");

    await new Promise((res, rej) => {
        music.addEventListener("canplaythrough", (e) => {
            res();
        });
    });

    console.log("loaded");
    music.play();

    const { audioContext, analyser, dataArray } = setupAudioContext();
    const source = audioContext.createMediaElementSource(music);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    let height = window.innerHeight;
    let width = 250;
    let winHeight = 100;
    const red = window.open("Windows/red.html", "_Blank", "popup=true,left=10,top=10");
    red.resizeTo(500, 500);
    red.moveTo(window.innerWidth / 2 - width, height / 2 + winHeight);
    let windows = [red];
    let directionY = 1; // Move up and down
    let beatThreshold = 200; // Adjust threshold for detecting beats
    let prevTime = Date.now();

    // Function to move windows with the music
    async function moveWindows() {
        while (!music.paused) {
            analyser.getByteFrequencyData(dataArray);
            const averageFrequency = dataArray.reduce((a, b) => a + b) / dataArray.length;

            // Detect beat
            const currentTime = Date.now();
            if (currentTime - prevTime > 100) {
                prevTime = currentTime;

                // If beat is detected (average frequency exceeds threshold)
                if (averageFrequency > beatThreshold) {
                    // Make windows bounce
                    directionY *= -1; // Change direction
                }
            }

            // Move all windows (bounce effect)
            windows.forEach((win) => {
                let rect = win.document.body.getBoundingClientRect();
                let yPos = rect.top + directionY * 10; // Move window up or down
                if (yPos > window.innerHeight - rect.height || yPos < 0) {
                    directionY *= -1; // Reverse direction when hitting the edge
                }
                win.moveTo(win.screenX, yPos);
            });

            await wait(100);
        }
    }

    await wait(2000);

    // Create more windows with floating effect
    const createWindow = async (color, delay) => {
        await wait(delay);
        const newWindow = window.open(`Windows/${color}.html`, "_Blank", "popup=true,left=10,top=10");
        newWindow.resizeTo(500, 500);
        newWindow.moveTo(window.innerWidth / 2 - width, height / 2 + winHeight);
        windows.push(newWindow);
        width += 50;
        winHeight += 50;
    };

    await createWindow("green", 9000);
    await createWindow("blue", 8000);
    await createWindow("white", 8500);
    await createWindow("purple", 4500);
    await createWindow("coral", 20000);
    await createWindow("teal", 9000);
    await createWindow("yellow", 9000);
    await createWindow("black", 18000);
    await createWindow("orange", 40000);

    moveWindows(); // Start moving windows with the beat

    await wait(5000); // Keep moving for a while

    // Close all windows
    windows.forEach(win => win.close());
}
