const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/files', express.static(path.join(__dirname, 'files')));
app.use('/', express.static(path.join(__dirname, 'public')));

const ensureFilesDirectory = () => {
  const filesDir = path.join(__dirname, 'files');
  if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
  }
};

const generateReferenceCode = () => {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const sendNotificationEmail = async (referenceCode, submissionData, jsonPath, pdfPath) => {
  try {
    // Skip email if no credentials configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email credentials not configured, skipping email notification');
      console.log(`Submission received - Reference Code: ${referenceCode}`);
      console.log(`Patient: ${submissionData.first_name} ${submissionData.last_name} (${submissionData.email})`);
      return;
    }

    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Prepare attachments
    const attachments = [];
    
    // Add JSON file as attachment
    if (fs.existsSync(jsonPath)) {
      attachments.push({
        filename: `${referenceCode}_submission.json`,
        path: jsonPath,
        contentType: 'application/json'
      });
    }
    
    // Add PDF file as attachment  
    if (fs.existsSync(pdfPath)) {
      attachments.push({
        filename: `${referenceCode}_report.pdf`,
        path: pdfPath,
        contentType: 'application/pdf'
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'seyyidsahin2828@gmail.com',
      subject: referenceCode,
      html: `
        <h2>📋 New IRPro Submission</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; font-family: Arial, sans-serif;">
          <p><strong>🎫 Reference Code:</strong> <span style="background: #007bff; color: white; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${referenceCode}</span></p>
          <p><strong>⏰ Submission Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>👤 Patient Name:</strong> ${submissionData.first_name} ${submissionData.last_name}</p>
          <p><strong>📧 Email:</strong> ${submissionData.email}</p>
          <p><strong>📝 Assessment Type:</strong> ${submissionData.assessment_type}</p>
          <p><strong>🏥 Grade/School:</strong> ${submissionData.grade_entering || 'Not specified'} / ${submissionData.school_name || 'Not specified'}</p>
          <p><strong>🌍 Country of Birth:</strong> ${submissionData.country_of_birth}</p>
          <p><strong>💉 Vaccination Status:</strong> ${submissionData.startup_catchup}</p>
          <p><strong>🩺 Previous Records:</strong> ${submissionData.previous_records}</p>
          <p><strong>⚠️ Allergies:</strong> ${submissionData.allergies_reactions}</p>
        </div>
        <hr style="margin: 20px 0;">
        <p><strong>📎 Attached Files:</strong></p>
        <ul>
          <li>📄 JSON Data File (${referenceCode}_submission.json)</li>
          <li>📑 PDF Report (${referenceCode}_report.pdf)</li>
        </ul>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;"><em>🤖 This is an automated notification from IRPro system.</em></p>
      `,
      attachments: attachments
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to seyyidsahin2828@gmail.com with ${attachments.length} attachments`);
    console.log(`📎 Attachments: ${attachments.map(a => a.filename).join(', ')}`);
  } catch (error) {
    console.error('❌ Failed to send notification email:', error);
  }
};

const generatePDF = async (data, filename) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const pdfPath = path.join(__dirname, 'files', `${filename}.pdf`);
    const stream = fs.createWriteStream(pdfPath);
    
    doc.pipe(stream);
    
    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('IRPro - IR Intake Assessment', 50, 50);
    doc.fontSize(12).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString()}`, 50, 80);
    
    // Add line separator
    doc.moveTo(50, 100).lineTo(550, 100).stroke();
    
    let yPosition = 120;
    
    // Patient Information Section
    doc.fontSize(16).font('Helvetica-Bold').text('PATIENT INFORMATION', 50, yPosition);
    yPosition += 25;
    
    const patientFields = [
      { label: '1. Assessment Type', value: data.assessment_type },
      { label: '2. First Name', value: data.first_name },
      { label: '3. Last Name', value: data.last_name },
      { label: '4. Date of Birth', value: data.date_of_birth },
      { label: '5. Gender', value: data.gender },
      { label: '6. Grade Entering', value: data.grade_entering || 'Not specified' },
      { label: '7. School Name', value: data.school_name || 'Not specified' },
      { label: '8. Country of Birth', value: data.country_of_birth }
    ];
    
    patientFields.forEach(field => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }
      doc.fontSize(10).font('Helvetica-Bold').text(field.label + ':', 50, yPosition);
      doc.fontSize(10).font('Helvetica').text(field.value || 'Not provided', 200, yPosition);
      yPosition += 20;
    });
    
    // Medical Information Section
    yPosition += 15;
    if (yPosition > 650) {
      doc.addPage();
      yPosition = 50;
    }
    
    doc.fontSize(16).font('Helvetica-Bold').text('MEDICAL & VACCINATION INFORMATION', 50, yPosition);
    yPosition += 25;
    
    const medicalFields = [
      { label: '9. Start-Up or Catch-Up', value: data.startup_catchup },
      { label: 'Next Vaccination Date', value: data.catchup_date || 'Not applicable' },
      { label: '10. Previous Records Status', value: data.previous_records },
      { label: '11. CAIR/MRN', value: data.cair_mrn || 'Not provided' },
      { label: '12. Allergies/Reactions', value: data.allergies_reactions },
      { label: 'Allergy Details', value: data.allergy_details || 'None specified' },
      { label: '13. Hospital Birth', value: data.hospital_birth },
      { label: 'Hospital Details', value: data.hospital_details || 'Not applicable' }
    ];
    
    medicalFields.forEach(field => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }
      doc.fontSize(10).font('Helvetica-Bold').text(field.label + ':', 50, yPosition);
      
      // Handle long text for details fields
      if (field.label.includes('Details') && field.value && field.value.length > 50) {
        const lines = doc.heightOfString(field.value, { width: 300 });
        doc.fontSize(10).font('Helvetica').text(field.value, 200, yPosition, { width: 300 });
        yPosition += Math.max(20, lines + 5);
      } else {
        doc.fontSize(10).font('Helvetica').text(field.value || 'Not provided', 200, yPosition);
        yPosition += 20;
      }
    });
    
    // Contact Information Section
    yPosition += 15;
    if (yPosition > 650) {
      doc.addPage();
      yPosition = 50;
    }
    
    doc.fontSize(16).font('Helvetica-Bold').text('CONTACT INFORMATION', 50, yPosition);
    yPosition += 25;
    
    doc.fontSize(10).font('Helvetica-Bold').text('Physician Information:', 50, yPosition);
    const physicianText = data.physician_record || 'Not provided';
    const physicianLines = doc.heightOfString(physicianText, { width: 400 });
    doc.fontSize(10).font('Helvetica').text(physicianText, 200, yPosition, { width: 400 });
    yPosition += Math.max(20, physicianLines + 5);
    
    doc.fontSize(10).font('Helvetica-Bold').text('14. Email Address:', 50, yPosition);
    doc.fontSize(10).font('Helvetica').text(data.email || 'Not provided', 200, yPosition);
    yPosition += 30;
    
    // Footer
    if (yPosition > 680) {
      doc.addPage();
      yPosition = 50;
    }
    
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 15;
    
    doc.fontSize(8).font('Helvetica').text('This document was generated by IRPro - Professional Immunization Assessment System', 50, yPosition);
    doc.text(`Document ID: ${filename}`, 50, yPosition + 12);
    doc.text(`Generated by: JoeyDirt333`, 50, yPosition + 24);
    
    // Developer mode indicator
    if (data.developer_mode === 'true') {
      doc.fontSize(8).font('Helvetica-Bold').fillColor('red').text('⚠️ DEVELOPER MODE - TEST DATA', 400, yPosition);
    }
    
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
    
    // Generate reference code and unique identifiers
    const referenceCode = generateReferenceCode();
    const fileId = uuidv4();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${referenceCode}_${timestamp}_${fileId}`;
    
    // Save JSON file
    const jsonPath = path.join(__dirname, 'files', `${filename}.json`);
    const dataWithReference = { ...data, referenceCode, submissionId: fileId };
    fs.writeFileSync(jsonPath, JSON.stringify(dataWithReference, null, 2));
    
    // Generate PDF
    const pdfPath = await generatePDF(dataWithReference, filename);
    
    // Send notification email to admin with attachments
    await sendNotificationEmail(referenceCode, data, jsonPath, pdfPath);
    
    // Return only reference code to customer
    const response = {
      referenceCode: referenceCode,
      timestamp: new Date().toISOString(),
      message: 'Submission completed successfully. Please save your reference code for future inquiries.'
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