"use server";

import { TelegramNotifier } from "./client";

export interface ContactFormState {
  message: string;
  error: boolean;
  success: boolean;
  fieldValues: {
    sender_name: string;
    sender_email: string;
    sender_message: string;
  };
}

export async function sendTelegramNotificationAction(
  prevState: ContactFormState,
  formData: FormData
) {
  try {
    const tg = new TelegramNotifier();

    // Extract form data
    const rawFormData = {
      sender_name: formData.get("sender_name") as string,
      sender_email: formData.get("sender_contact") as string,
      sender_message: formData.get("sender_message") as string,
    };

    // Validate form data
    if (!rawFormData.sender_name || !rawFormData.sender_message) {
      return {
        message: "Please fill in all required fields",
        error: true,
        success: false,
        fieldValues: prevState?.fieldValues,
      };
    }

const emailIncluded = rawFormData.sender_email.length > 1;  
    // Create message for Telegram notification
const notificationMessage = `
📩 New Portfolio site Contact Form Submission

👤 Name: ${rawFormData.sender_name}
📧 Email: ${rawFormData.sender_email}

💬 Message:
${rawFormData.sender_message}
`;
// Send the notification via Telegram
await tg.send(`
${notificationMessage}


By: :${emailIncluded ? rawFormData.sender_email : "No email provided"}    
`);

    // Return success response
    return {
      message: emailIncluded?"Successfully sent, Thank you!": "Successfully sent, Thank you! But no email provided so ican't reach back to you",
      error: false,
      success: true,
      fieldValues: {
        sender_name: "",
        sender_email: "",
        sender_message: "",
      },
    };
  } catch (error) {
    console.error("Telegram notification error:", error);

    // Return error response
    return {
      message: "Oops something went wrong on our side, please try again later",
      error: true,
      success: false,
      fieldValues: prevState?.fieldValues,
    };
  }
}
