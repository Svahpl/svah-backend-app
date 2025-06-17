import { formSchema } from "../utils/auth.validation.js";
import { salseSchema } from "../utils/auth.validation.js";
import  FormSubmission  from "../models/Message.models.js"
import salseSubmission from "../models/Salse.models.js"


export const MessegeSubmit  = async (req,res) => {
    try {
        const {data , error} = formSchema.safeParse(req.body);
        if (error) {
            return res.json({
                message: error.errors[0].message,
            });
        }
        const {
            fullName,
            companyName,
            companyEmail,
            country,
            companyAddress,
            websiteLink,
            requirements,
            code,
            number,
            additionalMessage
        } = data;

        const formdata = await  FormSubmission.create({
            fullName,
            companyName,
            companyEmail,
            country,
            companyAddress,
            websiteLink,
            requirements,
            code,
            number,
            additionalMessage
        })

        res.status(200).json({ msg : "form submitted" , formdata})

    } catch (error) {
        console.log(error);
        res.status(400).json({ msg : "somthing went wrong " , error})
    }
}

export const SalseMessegeSubmit = async (req, res) => {
    try {
        const { data, error } = salseSchema.safeParse(req.body);
        if (error) {
            return res.json({
                message: error.errors[0].message,
            });
        }
        const {
            fullName,
            companyName,
            companyEmail,
            country,
            companyAddress,
            websiteLink,
            SalesDetails,
            code,
            number,
            additionalMessage
        } = data;

        const formdata = await salseSubmission.create({
            fullName,
            companyName,
            companyEmail,
            country,
            companyAddress,
            websiteLink,
            SalesDetails,
            code,
            number,
            additionalMessage
        })

        res.status(200).json({ msg: "form submitted", formdata })

    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: "somthing went wrong ", error })
    }
}