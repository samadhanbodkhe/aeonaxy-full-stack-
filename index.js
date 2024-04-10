const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
require("dotenv").config({ path: "./.env" })
const path = require("path")

mongoose.connect(process.env.MONGO_URL)

const app = express()
app.use(express.static(path.join(__dirname, "dist")))
app.use(cookieParser())
app.use(express.json())

app.use(cors())
app.use(express.static("uploads"))

app.use("/api/v1/admin", require("./routes/userRoutes"))

app.use("*", (req, res, next) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"))
})


mongoose.connection.once("open", () => {
    console.log("mongo connected")
    app.listen(process.env.PORT, console.log("server running"))
})