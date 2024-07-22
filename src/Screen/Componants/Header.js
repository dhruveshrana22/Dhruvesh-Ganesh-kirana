import { Flex } from "antd";
import Grid from "antd/es/card/Grid";
import React from "react";
function HeaderCompo({ title, onBack }) {
  return (
    <Flex
      className="header-container"
      style={{ alignItems: "center", justifyContent: "space-evenly" }}
    >
      <button className="back-button" onClick={() => window.history.back()}>
        Back
      </button>
      <Grid
        id="button"
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h3>{title}</h3>
      </Grid>
    </Flex>
  );
};




export default HeaderCompo;
