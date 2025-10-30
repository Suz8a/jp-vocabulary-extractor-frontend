import axios from "axios";
import { useState } from "react";
import {
  Button,
  Checkbox,
  darken,
  Dialog,
  Divider,
  FormControlLabel,
  FormGroup,
  Stack,
  styled,
  Typography,
  DialogContent,
  IconButton,
  DialogActions,
} from "@mui/material";
import { Close, CheckCircleOutlineRounded } from "@mui/icons-material";
import { FileInput } from "../../components";

const FILE_OPTIONS = {
  englishTranslation: "--add-english",
  furigana: "--furigana",
  jmDictId: "--id",
  sortByFrequency: "--freq-order",
};

const Container = styled(Stack)({
  padding: 40,
  backgroundColor: "white",
  minWidth: 500,
  maxHeight: "fit-content",
  margin: "auto",
  borderRadius: 16,
});

const CheckboxsContainer = styled(Stack)({
  ".MuiFormGroup-root": { width: "100%" },
  ".MuiFormControlLabel-root": {
    width: "fit-content",
    ".MuiTypography-root": {
      marginTop: 1,
      color: "#2c3748",
      "&.Mui-disabled": {
        color: "#969BA0",
      },
    },
  },
});

const StyledCheckbox = styled(Checkbox)({
  color: "#0359a0",
  "&.Mui-checked": {
    color: "#0359a0",
    "&.Mui-disabled": {
      color: "#969BA0",
    },
  },
});

const StyledButton = styled(Button)(({ variant = "contained", fullWidth }) => ({
  ...(variant === "contained" && {
    backgroundColor: "#0359a0",
    color: "#ffffff",
  }),
  fontWeight: "bold",
  textTransform: "none",
  width: fullWidth ? "100%" : 250,
  marginLeft: "auto",
  borderRadius: 12,
  transition: "all 0.4s ease",
  ...(variant === "contained" && {
    ":hover": {
      backgroundColor: darken("#0359a0", 0.3),
    },
  }),
  "&.Mui-disabled": {
    backgroundColor: "#EDF0F4",
    color: "#969BA0",
  },
  fontSize: "1rem",
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  margin: "20px 24px 0 auto",
  padding: 0,
  color: theme.palette.grey[500],
}));

const SuccessIconContainer = styled("div")({
  backgroundColor: "#dcfce7",
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: "0 auto 0 auto",
});

export const FileConfig = () => {
  const [file, setFile] = useState<File | null>(null),
    [headers, setHeaders] = useState<string[]>([]),
    [vocab, setVocab] = useState<string[][]>([]),
    [csvPath, setCsvPath] = useState<string>(""),
    [loading, setLoading] = useState(false),
    [dialogIsOpen, setDialogIsOpen] = useState(false),
    [fileInputError, setFileInputError] = useState<string | undefined>(
      undefined
    ),
    [options, setOptions] = useState({
      englishTranslation: true,
      furigana: false,
      jmDictId: false,
      sortByFrequency: false,
    });

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData(),
      fileOptions = Object.entries(options)
        .filter(([_, enabled]) => enabled)
        .map(([key, _]) => FILE_OPTIONS[key as keyof typeof FILE_OPTIONS]);

    formData.append("file", file);
    formData.append("options", `${fileOptions.join(" ")}`);

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
        setFileInputError(res.data.error);
      }
      setDialogIsOpen(true);
    } catch (err) {
      setFileInputError(`Upload failed: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!csvPath) return;
    window.open(
      `http://localhost:8000/download?path=${encodeURIComponent(csvPath)}`
    );
    setDialogIsOpen(false);
  };

  const onCheckboxChange =
    (optionKey: keyof typeof FILE_OPTIONS) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setOptions((prev) => ({
        ...prev,
        [optionKey]: event.target.checked,
        ...(optionKey === "jmDictId" && { furigana: false }),
        ...(optionKey === "furigana" && { jmDictId: false }),
      }));
    };

  return (
    <Container gap={2}>
      <Dialog
        open={dialogIsOpen}
        onClose={() => setDialogIsOpen(false)}
        sx={{
          ".MuiPaper-root": { borderRadius: "12px" },
        }}
      >
        <StyledIconButton
          aria-label="close"
          onClick={() => setDialogIsOpen(false)}
        >
          <Close />
        </StyledIconButton>
        <DialogContent>
          <Stack gap={4}>
            <SuccessIconContainer>
              <CheckCircleOutlineRounded fontSize="large" color="success" />
            </SuccessIconContainer>

            <Stack alignItems="center" gap={2}>
              <Typography
                fontSize="24px"
                sx={{ color: "#0359a0", fontWeight: 600 }}
              >
                Processing Complete!
              </Typography>

              <Typography
                textAlign="center"
                sx={{
                  color: "#2c3748",
                }}
              >
                Your file has been successfully processed and is ready for
                download. <br /> Here is a preview of the extracted vocabulary.
              </Typography>
            </Stack>

            {vocab.length > 0 && (
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
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ paddingX: "24px", paddingY: "40px" }}>
          <StyledButton
            variant="outlined"
            fullWidth
            onClick={() => setDialogIsOpen(false)}
          >
            Close
          </StyledButton>
          <StyledButton fullWidth autoFocus onClick={handleDownload}>
            Download CSV
          </StyledButton>
        </DialogActions>
      </Dialog>
      <Typography fontSize={32} color="#2c3748" marginX="auto" marginTop="20px">
        Japanese Vocabulary Extractor
      </Typography>

      <Divider />

      <FileInput
        sx={{ marginTop: "8px" }}
        file={file}
        onChange={setFile}
        onClear={() => setFile(null)}
        error={fileInputError}
        disabled={loading || dialogIsOpen}
      />

      <CheckboxsContainer direction="row" gap={1}>
        <FormGroup>
          <FormControlLabel
            control={
              <StyledCheckbox
                disabled={loading}
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
                disabled={options.furigana || loading}
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
                disabled={options.jmDictId || loading}
                onChange={onCheckboxChange("furigana")}
              />
            }
            label="Furigana"
          />
          <FormControlLabel
            control={
              <StyledCheckbox
                disabled={loading}
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
        sx={{ marginTop: "24px" }}
      >
        {loading ? "Processing..." : "Extract vocabulary "}
      </StyledButton>
    </Container>
  );
};
