import axios from 'axios';
import { FileInput } from '../../components';
import { useState } from 'react';
import { Grid, Stack, styled } from '@mui/material';

const Container = styled(Stack)({
    padding: 20,
    backgroundColor: 'white',
    maxWidth: '560px',
});

export const FileConfig = () => {
    const [file, setFile] = useState<File | null>(null),
        [headers, setHeaders] = useState<string[]>([]),
        [vocab, setVocab] = useState<string[][]>([]),
        [csvPath, setCsvPath] = useState<string>(''),
        [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            const res = await axios.post('http://localhost:8000/extract', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.vocabulary) {
                setHeaders(res.data.headers || []);
                setVocab([...res.data.vocabulary.slice(0, 5), ['...']]);
                setCsvPath(res.data.csv_path || '');
            } else {
                console.error(res.data.error);
            }
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!csvPath) return;
        window.open(`http://localhost:8000/download?path=${encodeURIComponent(csvPath)}`);
    };

    return (
        <Container>
            <h1
                style={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: '#042c4d',
                }}
            >
                Japanese Vocabulary Extractor
            </h1>

            <FileInput file={file} onChange={setFile} onClear={() => setFile(null)} />
            <p>{file?.name}</p>

            <Grid container>checkbox</Grid>

            <button onClick={handleUpload} disabled={!file || loading}>
                {loading ? 'Processing...' : 'Upload & Extract'}
            </button>

            {vocab.length > 0 && (
                <>
                    <div>
                        <button style={{ marginTop: 10 }} onClick={handleDownload}>
                            Download CSV
                        </button>
                    </div>
                    <div style={{ marginTop: 20 }}>
                        <h2>Vocabulary Preview</h2>
                        <table border={1} cellPadding={5}>
                            <thead>
                                <tr>
                                    {headers.map((header, i) => (
                                        <th key={i}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {vocab.map((row, i) => (
                                    <tr key={i}>
                                        {row.map((cell, j) => (
                                            <td key={j}>{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </Container>
    );
};
