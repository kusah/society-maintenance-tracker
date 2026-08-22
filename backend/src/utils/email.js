const sendEmail = async (to, subject, text) => {
    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: process.env.EMAIL_FROM,
                to: [to],
                subject,
                text
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to send email"
            );
        }

        console.log(`Email sent successfully to ${to}`);

        return data;

    } catch (error) {
        console.error(
            `Failed to send email to ${to}:`,
            error.message
        );

        throw error;
    }
};


const sendImportantNoticeEmail = async (
    email,
    name,
    title,
    body
) => {
    return sendEmail(
        email,
        `Important Society Notice: ${title}`,
        `Hello ${name},

${body}

Please check the society maintenance tracker for more details.

Regards,
Society Administration`
    );
};


const sendStatusChangeEmail = async (
    email,
    name,
    complaintId,
    oldStatus,
    newStatus,
    note
) => {
    return sendEmail(
        email,
        `Complaint #${complaintId} Status Updated`,
        `Hello ${name},

Your complaint #${complaintId} has been updated.

Previous Status: ${oldStatus}
New Status: ${newStatus}

${note ? `Admin Note: ${note}\n` : ""}

Please check the society maintenance tracker for more details.

Regards,
Society Administration`
    );
};


module.exports = {
    sendEmail,
    sendImportantNoticeEmail,
    sendStatusChangeEmail
};