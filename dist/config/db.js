// import mongoose from "mongoose";
// export const connectDB = async (): Promise<void> => {
//   try {
//     if (!process.env.MONGO_URI) throw new Error("MONGO_URI not defined");
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("✅ MongoDB connected");
//   } catch (error) {
//     console.error("❌ MongoDB connection error:", error);
//     process.exit(1);
//   }
// };
import mongoose from "mongoose";
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}
export const connectDB = async () => {
    if (cached.conn) {
        return cached.conn; // Return existing connection if available
    }
    if (!cached.promise) {
        if (!process.env.MONGO_URI)
            throw new Error("MONGO_URI not defined");
        const opts = {
            bufferCommands: false,
            // other options can go here
        };
        cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }
    cached.conn = await cached.promise;
    console.log("✅ MongoDB connected (serverless mode)");
    return cached.conn;
};
