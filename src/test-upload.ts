import fs from "fs";
import path from "path";
import FormData from "form-data";
import axios from "axios";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadScenario = async () => {
  const form = new FormData();

  // Append scenarioName and repetition fields
  form.append("scenarioName", "Test Scenario");
  form.append("repetition", 5);

  // Append multiple files
  const filesToUpload = ["file1.txt", "file2.txt"]; // Replace with your actual file names
  filesToUpload.forEach((file) => {
    const filePath = path.resolve(__dirname, file);
    // console.log(filePath)
    // console.log('Current working directory:', process.cwd());

    form.append("file", fs.createReadStream(filePath));
  });

  console.log(JSON.stringify(form))

  try {
    const response = await axios.post("http://localhost:3000/scenario", form, {
      headers: {
        ...form.getHeaders(),
      },
    });
    console.log(response.data);
    console.log(Array.isArray(response.data.scenarioName));
  } catch (error: any) {
    console.error(
      "Error uploading files:",
      error.response ? error.response.data : error.message
    );
  }
};

uploadScenario();
