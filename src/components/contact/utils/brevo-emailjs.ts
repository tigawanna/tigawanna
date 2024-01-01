import { SMTPClient } from 'emailjs';
export interface ContactFormState {
    message: string;
    error: boolean;
    success: boolean;
    fieldValues: {
        sender_name: string;
        sender_email: string;
        sender_message: string;
    }
}
export async function sendEmailwithBrevoSmtpAction(prevState: ContactFormState, formData: FormData) {
    const mail_from = process.env.EMAIL_FROM
    const mail_to = process.env.EMAIL_FROM
    if(!mail_from || !mail_to){
        return {
            message: "Ooops something went wrong on our side, please try again later",
            error: true,
            success: false,
            fieldValues: prevState?.fieldValues
        }
    }

    const rawFormData = {
        sender_name: formData.get("sender_name"),
        sender_contact: formData.get("sender_contact"),
        sender_message: formData.get("sender_message"),
    };
    // const transporter = createTransport({
    //     host: "smtp-relay.brevo.com",
    //     port: 587,
    //     auth: {
    //         user: "denniskinuthiaw@gmail.com",
    //         pass: process.env.BREVO_KEY,
    //     },
    // });

    const client = new SMTPClient({
        user: "denniskinuthiaw@gmail.com",
        password: process.env.BREVO_KEY,
        host: "smtp-relay.brevo.com",
        ssl: true,
    });

    try {
        const message = await client.sendAsync({
            from: mail_from,
            to:mail_to,
            subject: `Someone left a sender_message on your site`,
            text: `hey there, ${rawFormData.sender_name} with email: ${rawFormData.sender_contact} 
        has reached out to you on your portfolio site. \n
        ------------------------------------------------\n
        ${rawFormData.sender_message}
        `,
        });
        console.log("succesfully sent email message === ", message);
        return {
            message:"Succefully sent",
            error: false,
            success: true,
            fieldValues: prevState?.fieldValues
        }

    } catch (err) {
        console.log("error sending email === ", err);
        return {
            message: "An issue occured, please try again later",
            error: true,
            success: false,
            fieldValues: prevState?.fieldValues
        }
    }
}
