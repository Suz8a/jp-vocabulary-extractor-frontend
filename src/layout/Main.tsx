import { styled } from "@mui/material";
import { ReactNode } from "react";

interface MainProps {
  children: ReactNode;
}

const Container = styled("div")({
  backgroundColor: "#e7e7e7",
  display: "flex",
  height: "100vh",
  justifyContent: "center",
});

export const Main = ({ children }: MainProps) => {
  return <Container>{children}</Container>;
};
