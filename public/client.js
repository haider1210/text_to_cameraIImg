const video = document.getElementById('camera');
const captureButton = document.getElementById('capture');
const switchButton = document.getElementById('switch');
const resultDiv = document.getElementById('result');
const loadingIndicator = document.getElementById('loadingIndicator');
const extractedText = document.getElementById('extractedText');

let stream = null;
let selectedDeviceIndex = 0;

function startCamera(deviceId) {
    const constraints = {
        video: { deviceId: deviceId ? { exact: deviceId } : undefined }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(mediaStream => {
            stream = mediaStream;
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
        tracks.forEach(track => track.stop());
        stream = null;
    }
}

function switchCamera() {
    selectedDeviceIndex = (selectedDeviceIndex + 1) % availableDevices.length;
    stopCamera();
    startCamera(availableDevices[selectedDeviceIndex].deviceId);
}

let availableDevices = [];

navigator.mediaDevices.enumerateDevices()
    .then(devices => {
        availableDevices = devices.filter(device => device.kind === 'videoinput');
        if (availableDevices.length > 0) {
            switchButton.style.display = 'block';
            startCamera(availableDevices[selectedDeviceIndex].deviceId);
        } else {
            console.error('No camera devices available.');
        }
    })
    .catch(error => {
        console.error('Error enumerating devices:', error);
    });

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
        extractedText.value = data.text;
        console.log('Extracted Text:', data.text);
        loadingIndicator.style.display = 'none';
        startCamera(availableDevices[selectedDeviceIndex].deviceId);
    })
    .catch(error => {
        console.error('Error sending image data:', error);
        loadingIndicator.style.display = 'none';
        startCamera(availableDevices[selectedDeviceIndex].deviceId);
    });
});

switchButton.addEventListener('click', () => {
    switchCamera();
});

startCamera();
