import axios from "axios";
import { useState } from "react";
import {
  Button,
  Checkbox,
  darken,
  Divider,
  FormControlLabel,
  FormGroup,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import { FileInput } from "../../components";

const FILE_OPTIONS = {
  englishTranslation: "--add-english",
  furigana: "--furigana",
  jmDictId: "--id",
  sortByFrequency: "--requ-order",
};

const Container = styled(Stack)({
  padding: 20,
  backgroundColor: "white",
  minWidth: 500,
});

const CheckboxsContainer = styled(Stack)({
  ".MuiFormGroup-root": { width: "100%" },
  ".MuiFormControlLabel-root": {
    width: "fit-content",
  },
});

const StyledCheckbox = styled(Checkbox)({
  color: "#0359a0",
  "&.Mui-checked": {
    color: "#0359a0",
  },
  "&.MuiTypography-root": {
    color: "red",
  },
});

const StyledButton = styled(Button)({
  backgroundColor: "#0359a0",
  fontWeight: "bold",
  color: "#ffffff",
  textTransform: "none",
  marginTop: 24,
  width: 250,
  marginLeft: "auto",
  borderRadius: 12,
  ":hover": {
    backgroundColor: darken("#0359a0", 0.3),
  },
  ":disabled": {
    backgroundColor: "#EDF0F4",
    color: "#969BA0",
  },
  fontSize: "1rem",
});

export const FileConfig = () => {
  const [file, setFile] = useState<File | null>(null),
    [headers, setHeaders] = useState<string[]>([]),
    [vocab, setVocab] = useState<string[][]>([]),
    [csvPath, setCsvPath] = useState<string>(""),
    [loading, setLoading] = useState(false),
    [options, setOptions] = useState({
      englishTranslation: true,
      furigana: false,
      jmDictId: false,
      sortByFrequency: false,
    });

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8000/extract", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.vocabulary) {
        setHeaders(res.data.headers || []);
        setVocab([...res.data.vocabulary.slice(0, 5), ["..."]]);
        setCsvPath(res.data.csv_path || "");
      } else {
        console.error(res.data.error);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!csvPath) return;
    window.open(
      `http://localhost:8000/download?path=${encodeURIComponent(csvPath)}`
    );
  };

  const onCheckboxChange =
    (optionKey: keyof typeof FILE_OPTIONS) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setOptions((prev) => ({
        ...prev,
        [optionKey]: event.target.checked,
      }));
    };

  return (
    <Container gap={2}>
      <Typography fontSize={32} color="#2c3748" marginX="auto" marginTop="20px">
        Japanese Vocabulary Extractor
      </Typography>

      <Divider />

      <FileInput
        sx={{ marginTop: "8px" }}
        file={file}
        onChange={setFile}
        onClear={() => setFile(null)}
      />

      <CheckboxsContainer direction="row" gap={1}>
        <FormGroup>
          <FormControlLabel
            control={
              <StyledCheckbox
                checked={options.englishTranslation}
                onChange={onCheckboxChange("englishTranslation")}
              />
            }
            label="English translation"
          />
          <FormControlLabel
            control={
              <StyledCheckbox
                checked={options.jmDictId}
                onChange={onCheckboxChange("jmDictId")}
              />
            }
            label="JMDict ID"
          />
        </FormGroup>
        <FormGroup>
          <FormControlLabel
            control={
              <StyledCheckbox
                checked={options.furigana}
                onChange={onCheckboxChange("furigana")}
              />
            }
            label="Furigana"
          />
          <FormControlLabel
            control={
              <StyledCheckbox
                checked={options.sortByFrequency}
                onChange={onCheckboxChange("sortByFrequency")}
              />
            }
            label="Sort by frequency"
          />
        </FormGroup>
      </CheckboxsContainer>

      <StyledButton
        variant="contained"
        onClick={handleUpload}
        disabled={!file || loading}
      >
        {loading ? "Processing..." : "Extract vocabulary "}
      </StyledButton>

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
