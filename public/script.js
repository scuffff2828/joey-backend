// IRPro Professional Form Management
class IRProForm {
    constructor() {
        this.form = document.getElementById('irpro-form');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateFormProgress();
    }

    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Real-time validation
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', (e) => this.validateField(e));
            input.addEventListener('input', (e) => this.clearValidation(e));
            input.addEventListener('input', () => this.updateFormProgress());
            input.addEventListener('change', () => this.updateFormProgress());
        });

        // Developer mode
        document.getElementById('firstName').addEventListener('input', () => this.checkDeveloperMode());
        document.getElementById('lastName').addEventListener('input', () => this.checkDeveloperMode());

        // Conditional fields
        this.setupConditionalFields();
    }

    setupConditionalFields() {
        // Allergies conditional field
        document.getElementById('allergiesReactions').addEventListener('change', (e) => {
            const detailsGroup = document.getElementById('allergyDetailsGroup');
            detailsGroup.style.display = e.target.value === 'Yes' ? 'block' : 'none';
        });

        // Start-Up or Catch-Up conditional field
        document.getElementById('startupCatchup').addEventListener('change', (e) => {
            const catchupField = document.getElementById('catchupDateField');
            catchupField.style.display = e.target.value === 'Catch-Up' ? 'block' : 'none';
        });

        // Hospital birth conditional field
        document.querySelectorAll('input[name="hospital_birth"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const hospitalGroup = document.getElementById('hospitalDetailsGroup');
                hospitalGroup.style.display = e.target.value === 'Yes' ? 'block' : 'none';
            });
        });
    }

    validateField(e) {
        const field = e.target;
        const formGroup = field.closest('.form-group');
        
        if (field.hasAttribute('required') && !field.value.trim()) {
            this.showFieldError(formGroup, 'This field is required');
        } else if (field.type === 'email' && field.value && !this.isValidEmail(field.value)) {
            this.showFieldError(formGroup, 'Please enter a valid email address');
        } else {
            this.showFieldSuccess(formGroup);
        }
    }

    clearValidation(e) {
        const field = e.target;
        const formGroup = field.closest('.form-group');
        const feedback = formGroup.querySelector('.field-feedback');
        
        if (feedback) {
            feedback.remove();
        }
        formGroup.classList.remove('field-error', 'field-success');
    }

    showFieldError(formGroup, message) {
        this.clearValidation({ target: formGroup.querySelector('input, select, textarea') });
        formGroup.classList.add('field-error');
        
        const feedback = document.createElement('div');
        feedback.className = 'field-feedback error';
        feedback.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        formGroup.appendChild(feedback);
    }

    showFieldSuccess(formGroup) {
        this.clearValidation({ target: formGroup.querySelector('input, select, textarea') });
        formGroup.classList.add('field-success');
        
        const feedback = document.createElement('div');
        feedback.className = 'field-feedback success';
        feedback.innerHTML = '<i class="fas fa-check-circle"></i> Valid';
        formGroup.appendChild(feedback);
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    updateFormProgress() {
        const requiredFields = this.form.querySelectorAll('[required]');
        const completedFields = Array.from(requiredFields).filter(field => {
            if (field.type === 'radio') {
                return document.querySelector(`input[name="${field.name}"]:checked`);
            }
            return field.value.trim() !== '';
        });

        const progress = (completedFields.length / requiredFields.length) * 100;
        
        let progressBar = document.querySelector('.form-progress');
        if (!progressBar) {
            progressBar = this.createProgressBar();
        }

        this.updateProgressBar(progressBar, progress);
    }

    createProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.className = 'form-progress';
        progressBar.innerHTML = `
            <div class="progress-header">
                <div class="progress-label">Form Completion</div>
                <div class="progress-percentage">0%</div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="progress-stats">
                <div class="progress-stat">
                    <div class="icon completed-icon"></div>
                    <span class="completed-count">0 completed</span>
                </div>
                <div class="progress-stat">
                    <div class="icon remaining-icon"></div>
                    <span class="remaining-count">0 remaining</span>
                </div>
            </div>
        `;
        this.form.insertBefore(progressBar, document.querySelector('.form-grid'));
        return progressBar;
    }

    updateProgressBar(progressBar, progress) {
        const progressFill = progressBar.querySelector('.progress-fill');
        const progressPercentage = progressBar.querySelector('.progress-percentage');
        const completedCount = progressBar.querySelector('.completed-count');
        const remainingCount = progressBar.querySelector('.remaining-count');
        
        // Calculate field counts
        const requiredFields = this.form.querySelectorAll('[required]');
        const completedFields = Array.from(requiredFields).filter(field => {
            if (field.type === 'radio') {
                return document.querySelector(`input[name="${field.name}"]:checked`);
            }
            return field.value.trim() !== '';
        });
        
        const completed = completedFields.length;
        const total = requiredFields.length;
        const remaining = total - completed;
        
        // Update progress bar
        progressFill.style.width = progress + '%';
        progressPercentage.textContent = Math.round(progress) + '%';
        
        // Update statistics
        completedCount.textContent = `${completed} completed`;
        remainingCount.textContent = `${remaining} remaining`;
        
        // Add completion state
        if (progress === 100) {
            progressBar.classList.add('completed');
            progressFill.classList.add('completed');
            
            // Celebration effect
            setTimeout(() => {
                this.showCompletionCelebration(progressBar);
            }, 300);
        } else {
            progressBar.classList.remove('completed');
            progressFill.classList.remove('completed');
        }
    }
    
    showCompletionCelebration(progressBar) {
        // Add sparkle effect
        const sparkles = document.createElement('div');
        sparkles.innerHTML = '✨🎉✨';
        sparkles.style.cssText = `
            position: absolute;
            top: -10px;
            right: 10px;
            font-size: 1.2rem;
            animation: sparkle 2s ease-out forwards;
            pointer-events: none;
        `;
        
        progressBar.style.position = 'relative';
        progressBar.appendChild(sparkles);
        
        // Add sparkle animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes sparkle {
                0% { opacity: 0; transform: translateY(10px) scale(0.8); }
                50% { opacity: 1; transform: translateY(-5px) scale(1.1); }
                100% { opacity: 0; transform: translateY(-15px) scale(0.9); }
            }
        `;
        document.head.appendChild(style);
        
        // Remove sparkles after animation
        setTimeout(() => {
            if (sparkles.parentNode) {
                sparkles.remove();
            }
        }, 2000);
    }

    checkDeveloperMode() {
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        
        if (firstName === 'Seyyid' && lastName === 'Mustafa') {
            document.getElementById('developerMode').value = 'true';
            this.generateTestData();
            this.showDeveloperMode();
        } else {
            document.getElementById('developerMode').value = 'false';
            this.hideDeveloperMode();
        }
    }

    showDeveloperMode() {
        const header = document.querySelector('.stage-header h1');
        header.innerHTML = '🚀 Developer Mode - Test Data Generated';
        header.style.color = '#dc3545';
        console.log('🚀 DEVELOPER MODE ACTIVATED');
    }

    hideDeveloperMode() {
        const header = document.querySelector('.stage-header h1');
        header.innerHTML = 'IR Intake';
        header.style.color = '#000000';
    }

    generateTestData() {
        const testData = {
            assessmentType: ['California K-12 School', 'US Immigration I-693'],
            genders: ['Male', 'Female', 'Other'],
            countries: ['United States', 'Mexico', 'Canada', 'Other'],
            vaccineTypes: ['Start-Up', 'Catch-Up'],
            recordStatuses: ['Complete', 'Partial', 'None'],
            yesNo: ['Yes', 'No']
        };

        // Generate random data
        const randomDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
        const randomEmail = `test${Math.floor(Math.random() * 1000)}@example.com`;

        // Fill form with test data
        document.getElementById('assessmentType').value = this.getRandomItem(testData.assessmentType);
        document.getElementById('dateOfBirth').value = randomDate.toISOString().split('T')[0];
        document.getElementById('gender').value = this.getRandomItem(testData.genders);
        document.getElementById('gradeEntering').value = `${Math.floor(Math.random() * 12) + 1}th`;
        document.getElementById('schoolName').value = 'Test Elementary School';
        document.getElementById('countryOfBirth').value = this.getRandomItem(testData.countries);
        document.getElementById('startupCatchup').value = this.getRandomItem(testData.vaccineTypes);
        document.getElementById('previousRecords').value = this.getRandomItem(testData.recordStatuses);
        document.getElementById('cairMrn').value = `TEST${Math.floor(Math.random() * 100000)}`;
        document.getElementById('allergiesReactions').value = this.getRandomItem(testData.yesNo);
        document.getElementById('physicianRecord').value = 'Dr. Test, 123 Test Street, Test City, TC 12345';
        document.getElementById('email').value = randomEmail;

        // Handle conditional fields
        const hospitalBirth = this.getRandomItem(testData.yesNo);
        document.querySelector(`input[name="hospital_birth"][value="${hospitalBirth}"]`).checked = true;

        // Trigger change events to show conditional fields
        document.getElementById('allergiesReactions').dispatchEvent(new Event('change'));
        document.getElementById('startupCatchup').dispatchEvent(new Event('change'));
        document.querySelector(`input[name="hospital_birth"][value="${hospitalBirth}"]`).dispatchEvent(new Event('change'));

        // Fill conditional field data
        if (document.getElementById('allergiesReactions').value === 'Yes') {
            document.getElementById('allergyDetails').value = 'Test allergy details for developer mode';
        }
        
        if (hospitalBirth === 'Yes') {
            document.getElementById('hospitalDetails').value = 'Test Hospital, Test City, TC';
        }
        
        if (document.getElementById('startupCatchup').value === 'Catch-Up') {
            const futureDate = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000);
            document.getElementById('catchupDate').value = futureDate.toISOString().split('T')[0];
        }

        this.updateFormProgress();
    }

    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Show loading state
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;

        try {
            // Collect form data
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());
            
            // Submit to backend API
            const response = await fetch('https://joey-backend.onrender.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            // Store result for success message
            this.submissionResult = result;
            this.showSuccessMessage();
            
        } catch (error) {
            console.error('Submission error:', error);
            this.showErrorMessage('Failed to submit form. Please try again.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    showSuccessMessage() {
        document.querySelector('.intake-form').style.display = 'none';
        document.querySelector('.stage-header').style.display = 'none';
        
        const successMessage = document.getElementById('successMessage');
        successMessage.style.display = 'block';
        
        // Update success message with file links if available
        if (this.submissionResult && this.submissionResult.files) {
            const successContent = successMessage.querySelector('.success-content');
            const fileLinks = document.createElement('div');
            fileLinks.className = 'file-links';
            
            // Ensure HTTPS URLs for production
            const jsonUrl = this.submissionResult.files.json.url.replace('http://', 'https://');
            const pdfUrl = this.submissionResult.files.pdf.url.replace('http://', 'https://');
            
            fileLinks.innerHTML = `
                <h3>Generated Files:</h3>
                <div class="file-link">
                    <a href="${jsonUrl}" target="_blank" class="btn-secondary">
                        <i class="fas fa-file-code"></i> View JSON Data
                    </a>
                </div>
                <div class="file-link">
                    <a href="${pdfUrl}" target="_blank" class="btn-secondary">
                        <i class="fas fa-file-pdf"></i> Download PDF Report
                    </a>
                </div>
                <div class="submission-info">
                    <p><strong>Submission ID:</strong> ${this.submissionResult.id}</p>
                    <p><strong>Generated:</strong> ${new Date(this.submissionResult.timestamp).toLocaleString()}</p>
                </div>
            `;
            successContent.appendChild(fileLinks);
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    showErrorMessage(message) {
        // Create error message if it doesn't exist
        let errorMessage = document.getElementById('errorMessage');
        if (!errorMessage) {
            errorMessage = document.createElement('div');
            errorMessage.id = 'errorMessage';
            errorMessage.className = 'error-message';
            errorMessage.style.display = 'none';
            errorMessage.innerHTML = `
                <div class="error-content">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Submission Failed</h2>
                    <p id="errorText"></p>
                    <button onclick="document.getElementById('errorMessage').style.display = 'none'" class="btn-primary">
                        <i class="fas fa-arrow-left"></i>
                        Try Again
                    </button>
                </div>
            `;
            document.querySelector('.main-content').appendChild(errorMessage);
        }
        
        document.getElementById('errorText').textContent = message;
        errorMessage.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Initialize form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new IRProForm();
});