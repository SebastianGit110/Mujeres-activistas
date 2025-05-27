const mongoose = require('mongoose');

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Sale del proceso si hay un error
    }
}; 

module.exports = connectDB;
// Este archivo se encarga de conectar a la base de datos MongoDB utilizando Mongoose.