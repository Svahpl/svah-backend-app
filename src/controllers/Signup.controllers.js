import { User } from '../models/user.models.js';
import welcomeEmail from '../services/welcome.email.js';
import sendAdminEmail from '../services/emailAdmin.js';

export const Signup = async (req, res) => {
    console.log(req.body);
    const { clerkUserId, FirstName, lastName, Email, Password, Token, ProfileImage } = req.body;
    if (!FirstName || !lastName || !Email) {
        return res.status(400).json({ msg: 'all detail required' });
    }
    const FullName = `${FirstName} ${lastName}`;
    const ExistUser = await User.findOne({ Email });

    if (ExistUser) {
        return res.status(200).json({ msg: 'user already exist not need to store' });
    }

    try {
        const user = await User.create({
            clerkUserId,
            FullName: FullName,
            LastName: lastName,
            Email: Email,
            Password: Password,
            ProfileImage,
        });
        const createduser = await User.findById(user._id).select('-password');
        const option = {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        };
        if (createduser) {
            welcomeEmail(FullName, Email, 'Welcome to Sri Venkateswara Agros and Herbs');
            return res
                .status(200)
                .cookie('authToken', Token, option)
                .json({ msg: 'user created sucseesfully !!!!', user });
        }
    } catch (error) {
        console.log(`error come from create user side controller ${error}`);
        return res.status(400).json({ msg: 'somthing went wrong !!!' });
    }
};

export const getAllUser = async (req, res) => {
    try {
        const users = await User.find().select('FullName Email ProfileImage  ');
        if (!users.length) {
            return res.status(404).json({ message: 'No users found' });
        }
        res.status(200).json({ message: 'Users found', users });
    } catch (error) {
        console.error('Error in getAllUser:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        console.log(user);
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }
        return res.status(200).json({ message: 'User found', user });
    } catch (error) {
        console.error('Error in getUser:', error);
        return res.status(500).json({ msg: 'Internal server error', error });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('User ID to delete:', id);

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ messege: 'User not found' });
        }
        res.status(200).json({ messege: 'User deleted successfully', user });
    } catch (error) {
        console.log(error);
    }
};

export const EmailByAdmin = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: name, email, subject, message',
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format',
            });
        }

        // Send the email
        await sendAdminEmail(name, email, subject, message);

        res.status(200).json({
            success: true,
            message: 'Email sent successfully',
            data: {
                recipient: email,
                subject: subject,
                sentAt: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('Admin email sending error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

export const getUserByClerkId = async (req, res) => {
    const { clerkId } = req.params;
    try {
        if (!clerkId) return res.status(404).json({ error: 'Clerk ID is required' });
        const user = await User.find({ clerkUserId: clerkId });
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export const storeAddress = async (req, res) => {
    const {
        userId,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        pinCode,
        addressId,
        phoneNumber,
    } = req.body;

    try {
        // Validate required fields (added country to required fields)
        if (!userId || !addressLine1 || !city || !state || !country || !phoneNumber) {
            return res.status(400).json({
                message:
                    'Incomplete Fields. Address Line 1, City, State, Country and Phone Number are required.',
            });
        }

        // Find the user
        const userFound = await User.findById(userId);
        if (!userFound) {
            return res.status(404).json({ message: 'No user Found' });
        }

        // Create address object (added country field)
        const addressData = {
            addressLine1,
            addressLine2: addressLine2 || '',
            city,
            state,
            country,
            pinCode: pinCode || '',
            phoneNumber: phoneNumber || '',
        };

        // Check if this is an update (addressId provided) or new address
        if (addressId) {
            // Update existing address
            const addressIndex = userFound.address.findIndex(
                addr => addr._id.toString() === addressId,
            );

            if (addressIndex === -1) {
                return res.status(404).json({ message: 'Address not found' });
            }

            // Update the address (including country)
            userFound.address[addressIndex] = {
                ...userFound.address[addressIndex]._doc,
                ...addressData,
            };
        } else {
            // Add new address (including country)
            userFound.address.push(addressData);
        }

        // Save the user
        await userFound.save();

        return res.status(200).json({
            success: true,
            message: addressId ? 'Address updated successfully!' : 'Address added successfully!',
            address: userFound.address,
        });
    } catch (error) {
        console.log('Error in storeAddress:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

// Delete address controller remains the same as it doesn't need modification for country field
export const deleteAddress = async (req, res) => {
    const { addressId } = req.params;
    const { userId } = req.body; // or get from auth middleware

    try {
        const userFound = await User.findById(userId);
        if (!userFound) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove address from array
        userFound.address = userFound.address.filter(addr => addr._id.toString() !== addressId);

        await userFound.save();

        return res.status(200).json({
            success: true,
            message: 'Address deleted successfully!',
            address: userFound.address,
        });
    } catch (error) {
        console.log('Error in deleteAddress:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const getUserAddress = async (req, res) => {
    const { userId } = req.params;
    try {
        const addressFound = await User.findById(userId).select('address phoneNumber');
        if (!userId || !addressFound) {
            return res
                .status(400)
                .json({ success: false, message: 'User ID is req. OR Address not added.' });
        }
        return res.status(200).json({ address: addressFound });
    } catch (error) {
        console.log(`Error getting User's address: ${error}`);
    }
};
