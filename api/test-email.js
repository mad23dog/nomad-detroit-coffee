const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('Testing email configuration...');
        
        // Check environment variables
        const emailConfig = {
            hasEmailHost: !!process.env.EMAIL_HOST,
            hasEmailUser: !!process.env.EMAIL_USER,
            hasEmailPass: !!process.env.EMAIL_PASS,
            hasAdminEmail: !!process.env.ADMIN_EMAIL,
            emailHost: process.env.EMAIL_HOST,
            emailPort: process.env.EMAIL_PORT,
            emailUser: process.env.EMAIL_USER,
            adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER
        };
        
        console.log('Email config:', emailConfig);
        
        if (!emailConfig.hasEmailHost || !emailConfig.hasEmailUser || !emailConfig.hasEmailPass) {
            return res.status(400).json({
                success: false,
                error: 'Missing email configuration',
                config: {
                    hasEmailHost: emailConfig.hasEmailHost,
                    hasEmailUser: emailConfig.hasEmailUser,
                    hasEmailPass: emailConfig.hasEmailPass
                }
            });
        }
        
        // Create transporter
        const transporter = nodemailer.createTransporter({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        // Test connection
        await transporter.verify();
        console.log('SMTP connection verified successfully');
        
        // Send test email
        const testEmailResult = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
            subject: '🧪 Test Email - Nomad Detroit Coffee',
            html: `
                <h2>Email Test Successful!</h2>
                <p>This is a test email to verify your email configuration is working properly.</p>
                <p><strong>Sent at:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/Detroit' })}</p>
                <p><strong>Configuration:</strong></p>
                <ul>
                    <li>Host: ${process.env.EMAIL_HOST}</li>
                    <li>Port: ${process.env.EMAIL_PORT || 587}</li>
                    <li>From: ${process.env.EMAIL_USER}</li>
                    <li>Admin Email: ${process.env.ADMIN_EMAIL || process.env.EMAIL_USER}</li>
                </ul>
            `
        });
        
        console.log('Test email sent successfully:', testEmailResult.messageId);
        
        res.status(200).json({
            success: true,
            message: 'Email test successful',
            messageId: testEmailResult.messageId,
            config: {
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT || 587,
                from: process.env.EMAIL_USER,
                to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER
            }
        });
        
    } catch (error) {
        console.error('Email test failed:', error);
        
        res.status(500).json({
            success: false,
            error: 'Email test failed',
            details: error.message,
            stack: error.stack
        });
    }
};