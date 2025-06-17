const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/files', express.static(path.join(__dirname, 'files')));

const ensureFilesDirectory = () => {
  const filesDir = path.join(__dirname, 'files');
  if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
  }
};

const generatePDF = async (data, filename) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const pdfPath = path.join(__dirname, 'files', `${filename}.pdf`);
    const stream = fs.createWriteStream(pdfPath);
    
    doc.pipe(stream);
    
    doc.fontSize(20).text('Data Report', 100, 100);
    doc.moveDown();
    
    doc.fontSize(12);
    const jsonString = JSON.stringify(data, null, 2);
    const lines = jsonString.split('\n');
    
    let yPosition = 150;
    lines.forEach(line => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }
      doc.text(line, 100, yPosition);
      yPosition += 15;
    });
    
    doc.end();
    
    stream.on('finish', () => {
      resolve(pdfPath);
    });
    
    stream.on('error', (err) => {
      reject(err);
    });
  });
};

app.post('/submit', async (req, res) => {
  try {
    const data = req.body;
    
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No data provided' });
    }
    
    ensureFilesDirectory();
    
    const fileId = uuidv4();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `data_${timestamp}_${fileId}`;
    
    const jsonPath = path.join(__dirname, 'files', `${filename}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    
    await generatePDF(data, filename);
    
    const baseUrl = req.protocol + '://' + req.get('host');
    const response = {
      id: fileId,
      timestamp: new Date().toISOString(),
      files: {
        json: {
          filename: `${filename}.json`,
          url: `${baseUrl}/files/${filename}.json`
        },
        pdf: {
          filename: `${filename}.pdf`,
          url: `${baseUrl}/files/${filename}.pdf`
        }
      },
      message: 'Data processed successfully'
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error processing data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  ensureFilesDirectory();
});