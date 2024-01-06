"use server";
import { revalidatePath } from "next/cache"
import { ContactFormState } from "./brevo-nodemailer";


export async function testAction(prevState:ContactFormState,formData:FormData){
// // no({initialState,formData})

    await new Promise((resolve) => setTimeout(resolve, 3000)); // Delay for 3 seconds
    return {
        message: "error sending email ",
        error: true,
        success: false,
        fieldValues: prevState?.fieldValues
    }
    const rawFormData = {
        sender_name: formData.get("sender_name"),
        sender_contact: formData.get("sender_contact"),
        sender_message: formData.get("sender_message"),
    };

}
