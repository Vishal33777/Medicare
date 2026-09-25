import mongoose from "mongoose";

export const connectDB=async()=>{
  await mongoose.connect("mongodb+srv://avsvishal11_db_user:evMaEEbeZAY4E0lW@cluster0.3eybdm5.mongodb.net/MEDICARE").then(()=>{
    console.log("DB Connected")
  })
}