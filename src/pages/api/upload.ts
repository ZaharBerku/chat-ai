import fs from "fs";
import path from "path";
import formidable, { errors as formidableErrors } from "formidable";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const form = formidable({});
    const body = req.body;
    const [fields, files] = await form.parse(req);
    const file = files['files[0]'];
    console.log(files,fields, 'files')
    if(file){
      const fileBuffer = fs.readFileSync(file[0].filepath);
      console.log(fileBuffer, 'fileBuffer')
    }
    res.status(200).json({ imagePath: `/uploads/test` });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
