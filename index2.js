const express = require("express");
const app = express();

const PORT = 9989;

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})

app.get('/',(req,res) => {
    res.send(`Hello from Truong's PC 🌌`)
})