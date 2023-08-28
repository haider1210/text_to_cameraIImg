const video = document.getElementById('camera');
const captureButton = document.getElementById('capture');
const resultDiv = document.getElementById('result');
const loadingIndicator = document.getElementById('loadingIndicator');
const extractedText = document.getElementById('extractedText'); // Add this line if not already present

let stream = null; // Store the camera stream

function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(mediaStream => {
            stream = mediaStream; // Store the stream
            video.srcObject = mediaStream;
            video.play();
        })
        .catch(error => {
            console.error('Error accessing camera:', error);
        });
}

function stopCamera() {
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop()); // Stop the camera stream
        stream = null;
    }
}

captureButton.addEventListener('click', () => {
    loadingIndicator.style.display = 'block';
    stopCamera();

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataURL = canvas.toDataURL('image/png');

    fetch('/extracttextfromimage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageDataURL }),
    })
    .then(response => response.json())
    .then(data => {
        resultDiv.textContent = data.text;
        extractedText.value = data.text; // Set the extracted text in the textarea
        console.log('Extracted Text:', data.text);
        loadingIndicator.style.display = 'none';
        startCamera();
    })
    .catch(error => {
        console.error('Error sending image data:', error);
        loadingIndicator.style.display = 'none';
        startCamera();
    });
});

// Start the camera initially
startCamera();
