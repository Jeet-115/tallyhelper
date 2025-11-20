import dotenv from "dotenv";
import mongoose from "mongoose";
import { processAllImports } from "../utils/gstr2bProcessor.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await processAllImports();

    console.log("Processing completed");
  } catch (error) {
    console.error("Error processing GSTR-2B imports:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

run();

