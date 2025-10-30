import {
  Alert,
  Collapse,
  IconButton,
  Stack,
  styled,
  Typography,
  SxProps,
} from "@mui/material";
import {
  UploadFileRounded,
  InsertDriveFileRounded,
  ClearRounded,
} from "@mui/icons-material";

const ALLOWED_FILE_TYPES = ".epub, .pdf, .txt";

interface FileInputProps {
  file: File | null;
  error?: string;
  onClear: () => void;
  onChange: (file: File | null) => void;
  sx?: SxProps;
}

const InputLabel = styled("label")({
  display: "flex",
  width: "100%",
  height: "100%",
  cursor: "inherit",
  borderRadius: "inherit",
  transition: "all 0.3s ease",
});

const HiddenInput = styled("input")({
  display: "none",
});

const DropFileZone = styled(Stack)<Pick<FileInputProps, "file">>(
  ({ file }) => ({
    boxSizing: "border-box",
    display: "flex",
    width: "100%",
    height: 235,
    borderRadius: 30,
    border: "2px dashed #2db7ff",
    backgroundColor: "#f5fbff",
    cursor: file ? "auto" : "pointer",
  })
);

const DropFileZoneItemsContainer = styled(Stack)({
  width: "100%",
  height: 235,
  color: "#2c3748",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "inherit",
});

const StyledIconButton = styled(IconButton)({
  backgroundColor: "#f70000",
  color: "#ffffff",
  position: "absolute",
  top: -10,
  right: -10,
  ":hover": {
    backgroundColor: "#d10000",
  },
});

export const FileInput = ({
  file,
  error,
  onClear,
  onChange: onInputChange,
  sx,
}: FileInputProps) => {
  const removeDragData = (ev: React.DragEvent<HTMLDivElement>) => {
    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to remove the drag data
      ev.dataTransfer.items.clear();
    } else {
      // Use DataTransfer interface to remove the drag data
      ev.dataTransfer.clearData();
    }
  };

  const dropHandler = (ev: React.DragEvent<HTMLDivElement>) => {
    // Evitar el comportamiendo por defecto (Evitar que el fichero se abra/ejecute)
    ev.preventDefault();

    const draggedFiles = ev.dataTransfer.items;

    if (
      draggedFiles &&
      draggedFiles[0].kind === "file" &&
      draggedFiles[0].type.match(/(pdf|epub|plain)/)
    ) {
      const file = draggedFiles[0].getAsFile();
      onInputChange(file);
    }

    // Pasar el evento a removeDragData para limpiar
    removeDragData(ev);
  };

  const onDragOver = (ev: React.DragEvent<HTMLDivElement>) => {
    if (ev.dataTransfer.types.includes("Files")) ev.preventDefault();
  };

  return (
    <Stack gap={2} width="100%" maxWidth={500} sx={sx}>
      <DropFileZone
        id="drop-zone"
        file={file}
        onDrop={dropHandler}
        onDragOver={onDragOver}
      >
        <InputLabel htmlFor="file-input">
          <DropFileZoneItemsContainer spacing={1}>
            {file ? (
              <>
                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <InsertDriveFileRounded sx={{ fontSize: 80 }} />
                  <StyledIconButton
                    aria-label="delete"
                    size="small"
                    onClick={onClear}
                  >
                    <ClearRounded fontSize="small" />
                  </StyledIconButton>
                </div>
                <Stack>
                  <Typography fontWeight={500}>{file.name}</Typography>
                </Stack>
              </>
            ) : (
              <>
                <UploadFileRounded sx={{ fontSize: 80 }} />
                <Stack>
                  <Typography fontWeight={500}>
                    Click, or drop your files here
                  </Typography>
                  <Typography fontSize={12} fontWeight={500}>
                    Allowed files: PDF, EPUB and TXT
                  </Typography>
                </Stack>
              </>
            )}
          </DropFileZoneItemsContainer>
          <HiddenInput
            type="file"
            id="file-input"
            key={file ? file.name : "empty"}
            accept={ALLOWED_FILE_TYPES}
            onClick={(e) => (file ? e.preventDefault() : undefined)}
            onChange={(ev) => onInputChange(ev.target.files?.[0] || null)}
          />
        </InputLabel>
      </DropFileZone>
      <Collapse in={!!error}>
        <Alert severity="error">{error}</Alert>
      </Collapse>
    </Stack>
  );
};
