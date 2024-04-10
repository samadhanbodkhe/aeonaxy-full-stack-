const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../modal/User")
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.FROM_EMAIL,
        pass: process.env.EMAIL_PASS,
    },
});

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Hash the password
        const hashpass = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = await User.create({ ...req.body, password: hashpass });

        // Send registration email
        await sendRegistrationEmail(email, newUser.name);

        res.status(201).json({ message: "User Register Success" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" });
    }
};

async function sendRegistrationEmail(email, userName) {
    const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: 'Welcome to YourApp!',
        text: `Hello ${userName},\n\nThank you for registering...`
    };

    await transporter.sendMail(mailOptions);
}


exports.login = (async (req, res) => {
    try {
        console.log(req.body);
        const { email, password } = req.body
        const result = await User.findOne({ email })

        if (!result) {
            return res.status(401).json({ message: "invalid email" })
        }

        const verify = await bcrypt.compare(password, result.password)

        if (!verify) {
            return res.status(401).json({ message: "invalid password" })
        }

        const token = jwt.sign({ userId: result._id }, process.env.JWT_KEY, { expiresIn: "1h" })

        res.cookie("auth", token, { maxAge: 60 * 60 * 15 })
        res.status(200).json({
            message: "User Login Success",
            result: {
                name: result.name,
                id: result._id
            }
        })


    } catch (error) {
        res.status(400).json({ message: error.message || "something went wrong" })
    }
})

