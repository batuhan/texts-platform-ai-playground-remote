import React, { useState } from "react";
// import QRCode from 'qrcode.react'
import type { AuthProps } from "@textshq/platform-sdk";

export const Auth: React.FC<AuthProps> = ({ login }) => {
  const [baseURL, setBaseURL] = useState<string>("http://localhost:8080");
  const [label, setLabel] = useState<string>("Test");

  const handleLogin = () => {
    if (login) {
      login({ custom: { label, baseURL } });
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {/* <div
          style={{
            width: "70%",
          }}
        >
          <label htmlFor="base-url" style={{ width: "90%" }}>
            Base URL
          </label>
          <input
            id="base-url"
            type="text"
            value={baseURL}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setBaseURL(event.target.value)
            }
            style={{ width: "100%" }}
            placeholder="Enter Base URL"
          />
        </div>
        <div
          style={{
            width: "70%",
          }}
        >
          <label htmlFor="label" style={{ width: "90%" }}>
            Label (optional)
          </label>
          <input
            id="label"
            type="text"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            style={{ width: "100%" }}
            placeholder="Work, Personal, etc."
          />
        </div> */}
        <div
          style={{
            width: "70%",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <button
            type="button"
            style={{
              width: "100%",
            }}
            onClick={handleLogin}
          >
            Login →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
