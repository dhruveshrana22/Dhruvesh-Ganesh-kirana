import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useCheckLogin from "./utils/CheckLogin";
import Grid from "antd/es/card/Grid";
import { Dropdown, Menu, Space } from "antd";

function Home() {
  useCheckLogin();

  const [currentPage, setCurrentPage] = useState("home");
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const { currentUserData } = useSelector((s) => s.currentUser);

  const flexRef = useRef(null);

  const updateArrows = () => {
    if (flexRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = flexRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth);
    }
  };

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, []);

  const scrollLeft = () => {
    flexRef.current.scrollBy({ left: -100, behavior: "smooth" });
  };

  const scrollRight = () => {
    flexRef.current.scrollBy({ left: 100, behavior: "smooth" });
  };

  function showPage(pageId) {
    setCurrentPage(pageId);
  }

  const menu = (
    <Menu>
      <Menu.Item>
        <a href="/PurchaseEntry">Add Purchase</a>
      </Menu.Item>
      <Menu.Item>
        <a href="/AddDealers">Add Dealer Name</a>
      </Menu.Item>
    </Menu>
  );

  const AddItem = (
    <Menu>
      <Menu.Item>
        <a href="/product">Add Product</a>
      </Menu.Item>
      <Menu.Item>
        <a href="/AddCustomer">Add Customer</a>
      </Menu.Item>
      <Menu.Item>
        <a href="/AllCustomer">Customer Amount</a>
      </Menu.Item>
    </Menu>
  );

  const Bill = (
    <Menu>
      <Menu.Item key="1">
        <a href="/Bill/NewBill">New Bills</a>
      </Menu.Item>
      <Menu.Item key="2">
        <a href="/CreditDataTable">Cash Bills</a>
      </Menu.Item>
      <Menu.Item key="3">
        <a href="/kharcho">Kharcho</a>
      </Menu.Item>
      <Menu.Item key="4">
        <a href="/P&l">P&L</a>
      </Menu.Item>

    </Menu>
  );

  const navigate = useNavigate();
  const handleShowSale = () => {
    navigate("/ShowSale");
  };

  return (
    <Grid>
      <Grid className="navbar">
        {showLeftArrow && (
          <div className="scroll-arrow left-arrow" onClick={scrollLeft}>
            &#9664;
          </div>
        )}
        <div className="flex-scrollable" ref={flexRef} onScroll={updateArrows}>
          <Dropdown overlay={AddItem} trigger={["hover"]}>
            <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
              <Space>Add Data</Space>
            </a>
          </Dropdown>
          <Dropdown overlay={Bill} trigger={["hover"]}>
            <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
              <Space>Bill</Space>
            </a>
          </Dropdown>
          <a href="/ViewBill">ViewBills</a>

          <Dropdown overlay={menu} trigger={["hover"]}>
            <a onClick={(e) => e.preventDefault()}>
              <Space>Purchase</Space>
            </a>
          </Dropdown>

          <a href="/purchaseBill">See PurchaseBill</a>
          <a href="/ClearPayOut">Clear PayOut Bill</a>
        </div>
        {showRightArrow && (
          <div className="scroll-arrow right-arrow" onClick={scrollRight}>
            &#9654;
          </div>
        )}
      </Grid>

      <Grid
        id="home"
        className={`content ${currentPage === "home" ? "" : "hidden"}`}
      >
        <h2 style={{ textAlign: "center", justifyContent: "center" }}>
          {" "}
          ગણેશ કિરણા સ્ટોર
        </h2>
        <h3 id="kalpesh" style={{ textAlign: "center", justifyContent: "center" }}>
          {" "}
          Chandrakant Rana
        </h3>
        <h3 id="Mehule" style={{ textAlign: "center", justifyContent: "center" }}>
          {" "}
          Daxesh Rana
        </h3>
      </Grid>

      <Grid
        id="gstBills"
        className={`content ${currentPage === "gstBills" ? "" : "hidden"}`}
      >
        <h2>GST Bills</h2>
        <p>This is the GST Bills page.</p>
      </Grid>
    </Grid>
  );
}

export default Home;
