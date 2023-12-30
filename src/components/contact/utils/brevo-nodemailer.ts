"use server";

const { createTransport } = require('nodemailer');


export async function sendEmailwithBrevoSmtpAction(formData: FormData){
    console.log({formData})
    const rawFormData = {
        sender_name: formData.get("sender_name"),
        sender_contact: formData.get("sender_contact"),
        message: formData.get("message"),
    };

    const transporter = createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        auth: {
            user: "denniskinuthiaw@gmail.com",
            pass: process.env.BREVO_KEY,
        },
    });



    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to:process.env.EMAIL_TO,
        subject: `Someone left a message on your site`,
        text: `hey there, ${rawFormData.sender_name} with email: ${rawFormData.sender_contact} 
        has reached out to you on your portfolio site. \n
        ------------------------------------------------\n
        ${rawFormData.message}
        `
    };

    transporter.sendMail(mailOptions, function (error:any, info:any) {
        if (error) {
            console.log("error sending email   =============== ",error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

}
