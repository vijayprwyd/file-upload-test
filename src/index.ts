// src/index.ts
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import formidable  from "formidable";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { firstValues } from "formidable/src/helpers/firstValues.js";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.post('/scenario', (req, res) => {
  const form = formidable({ multiples: true });
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Error processing the form' });
    }

    const { scenarioName, repetition } = firstValues(form, fields);
    console.log("Scenario name = " + scenarioName);
    console.log(Array.isArray(scenarioName));
    const uploadedFiles = files.file;

    if (!scenarioName || !repetition || !uploadedFiles) {
      return res.status(400).json({ error: 'Missing required fields or files' });
    }

    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const filesArray = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles];

    const fileUploadPromises = filesArray.map((file) => {
      const oldPath = file.filepath;
      const newPath = path.join(uploadDir, file.originalFilename ?? 'abc');
      return new Promise((resolve, reject) => {
        fs.rename(oldPath, newPath, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(newPath);
          }
        });
      });
    });

    Promise.all(fileUploadPromises)
      .then((uploadedPaths) => {
        res.json({
          message: 'Files uploaded and scenario data received',
          scenarioName,
          repetition,
          uploadedFiles: uploadedPaths,
        });
      })
      .catch((error) => {
        res.status(500).json({ error: 'File saving failed', details: error });
      });
  });
});


app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
