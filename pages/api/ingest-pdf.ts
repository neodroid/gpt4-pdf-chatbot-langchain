/* eslint-disable import/no-anonymous-default-export */
// pages/api/ingest-pdf.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { CustomPDFLoader } from '@/utils/customPDFLoader';

export default async (req: NextApiRequest, res: NextApiResponse) => {

    console.log('calling the api...')
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { file } = req.body;
  const fileName = req.body.fileName || 'default_namespace';
  if (!file) {
    res.status(400).send('No file provided');
    return;
  }

  try {
    const buffer = Buffer.from(file, 'base64');
    const blob = new Blob([buffer], { type: 'application/pdf' });
    const customPDFLoader = new CustomPDFLoader(blob);
    const rawDocs = await customPDFLoader.load();
    const text = rawDocs[0].pageContent;
    res.status(200).json({ text });
  } catch (error) {
    res.status(500).send('Failed to ingest your data');
    console.error(error);
  }
};