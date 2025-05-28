import  {User}  from "../models/user.models.js"
import welcomeEmail from "../services/welcome.email.js";
export const Signup = async (req, res) => {
    console.log(req.body);
    const { FirstName, LastName, Email, Password , Token } = req.body ;
    if (!FirstName || !LastName || !Email) {
       return res.status(400).json({msg : "all detail required"})
    }
    const FullName = `${FirstName} ${LastName}`;
    const ExistUser = await User.findOne({ Email })

    if (ExistUser) {
        return res.status(200).json({ msg: "user already exist not need to store"})
    }

    try {
        const user = await User.create({
            FullName: FullName,
            LastName: LastName,
            Email: Email,
            Password: Password
        })
        const createduser = await User.findById(user._id).select("-password");
        const option = {
            httpOnly: true,
            secure: false, 
            sameSite: "lax",
        }
        if (createduser) {
            welcomeEmail(FullName, Email, "Welcome to Sri Venkateswara Agros and Herbs")
            return res.status(200).cookie("authToken",Token,option).json({ msg: "user created sucseesfully !!!!" , user})
        }
    } catch (error) {
        console.log(`error come from create user side controller ${error}`)
        return res.status(400).json({ msg: "somthing went wrong !!!"})
    }

}