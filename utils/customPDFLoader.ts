import { Document } from 'langchain/document';
import { BaseDocumentLoader } from 'langchain/document_loaders';

export class CustomPDFLoader extends BaseDocumentLoader {
  constructor(private blob: Blob) {
    super();
  }

  public async load(): Promise<Document[]> {
    const buffer = await this.blob.arrayBuffer().then((ab) => Buffer.from(ab));
    const metadata = { source: 'blob', blobType: this.blob.type };
    return this.parse(buffer, metadata);
  }

  protected async parse(
    raw: Buffer,
    metadata: Document['metadata'],
  ): Promise<Document[]> {
    const { pdf } = await PDFLoaderImports();
    const parsed = await pdf(raw);
    return [
      new Document({
        pageContent: parsed.text,
        metadata: {
          ...metadata,
          pdf_numpages: parsed.numpages,
        },
      }),
    ];
  }
}

async function PDFLoaderImports() {
  try {
    // the main entrypoint has some debug code that we don't want to import
    const { default: pdf } = await import('pdf-parse/lib/pdf-parse.js');
    return { pdf };
  } catch (e) {
    console.error(e);
    throw new Error(
      'Failed to load pdf-parse. Please install it with eg. `npm install pdf-parse`.',
    );
  }
}