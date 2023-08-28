const express = require('express');
const tesseract = require('node-tesseract-ocr');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/extracttextfromimage', (req, res) => {
    const imageDataURL = req.body.imageDataURL;
    const imageBuffer = Buffer.from(imageDataURL.split(',')[1], 'base64');

    const config = {
        lang: 'eng',
        oem: 1,
        psm: 3,
    };

    tesseract.recognize(imageBuffer, config)
        .then(text => {
            console.log("Extracted Text:", text);
            res.json({ text });
        })
        .catch(error => {
            console.log(error.message);
            res.json({ text: 'Error processing image' });
        });
});

app.listen(8001, () => {
    console.log('App is listening on port 8001');
});
