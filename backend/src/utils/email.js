const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendImportantNoticeEmail = async (email, name, title, body) => {
    await transporter.sendMail({
        from: `"Society Maintenance" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Important Society Notice: ${title}`,
        text: `Hello ${name},

${body}

Please check the society maintenance tracker for more details.

Regards,
Society Administration`
    });
};

module.exports = {
    sendImportantNoticeEmail
};