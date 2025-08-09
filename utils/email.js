const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOrderConfirmation = async (order) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: order.customer_email,
            subject: `Order Confirmation - Nomad Detroit Coffee #${order.order_id}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #1abc9c, #8e44ad); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Nomad Detroit Coffee</h1>
                        <p style="color: white; margin: 5px 0 0 0;">Thank you for your order!</p>
                    </div>
                    
                    <div style="padding: 20px; background: #f9f9f9;">
                        <h2>Order Confirmation</h2>
                        <p>Hi ${order.customer_name},</p>
                        <p>Thank you for your order! We've received your payment and your order is being processed.</p>
                        
                        <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3>Order Details</h3>
                            <p><strong>Order ID:</strong> ${order.order_id}</p>
                            <p><strong>Total:</strong> $${order.total_amount}</p>
                            <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        
                        <p>You can find us at the Royal Oak Farmers Market every Saturday from 7AM - 1PM at:</p>
                        <p>316 E 11 Mile Rd, Royal Oak, MI 48067</p>
                        
                        <p>If you have any questions, feel free to reach out to us at <a href="mailto:hello@nomaddetroitcoffee.com">hello@nomaddetroitcoffee.com</a></p>
                        
                        <p>Thank you for supporting Nomad Detroit Coffee!</p>
                    </div>
                    
                    <div style="background: #333; color: white; padding: 15px; text-align: center;">
                        <p>&copy; 2025 Nomad Detroit Coffee. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Order confirmation sent to ${order.customer_email}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = { sendOrderConfirmation };