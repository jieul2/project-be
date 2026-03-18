import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URL;
    if (!uri) throw new Error("MONGO_URL is missing!");

    await mongoose.connect(uri);
    console.log("몽고디비 연결 성공!");
  } catch (err) {
    console.error("몽고디비 연결 실패:", err);
    process.exit(1);
  }
};
