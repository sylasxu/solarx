import { styled } from "@pigment-css/react";

const StatRoot = styled("div", {
  name: "PigmentStat", // The component name
  slot: "root", // The slot name
})({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  padding: "0.75rem 1rem",
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  letterSpacing: "-0.025em",
  fontWeight: 600,
  variants: [
    {
      props: { variant: "outlined" },
      style: {
        border: `2px solid #e9e9e9`,
      },
    },
  ]
});

const StatValue = styled("div", {
  name: "PigmentStat",
  slot: "value",
})({
  font: '1.2rem "Fira Sans", sans-serif',
});

const StatUnit = styled("div", {
  name: "PigmentStat",
  slot: "unit",
})({
  font: '0.875rem "Fira Sans", sans-serif',
  color: "#121212",
});

const Stat = (props, ref) => {
  const { value, unit, variant, ...other } = props;

  return (
    <StatRoot variant={variant} {...other}>
      <StatValue>{value}</StatValue>
      <StatUnit>{unit}</StatUnit>
    </StatRoot>
  );
};

export default Stat;
