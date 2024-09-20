/* eslint-disable react-hooks/exhaustive-deps */
import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";

import { detect } from "detect-browser";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../../API";
import { setLoading } from "../../Store/AllReducers/messageSlice";
import { logout, setCurrentUser } from "../../Store/AllReducers/userSlice";
import { show } from "../../utils/Helper";

const generateCaptchaCode = () => {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let captchaCode = "";
  for (let i = 0; i < 5; i++) {
    captchaCode += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return captchaCode;
};

const Login = () => {
  const browser = detect();
  let myValues = {
    email: "admin@gmail.com",
    password: "Admin@2024",
    captcha: "xxxyyy",
  };

  const [eyeType, setEyeType] = useState(true);
  const [captcha, setCaptcha] = useState(generateCaptchaCode());

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myUser } = useSelector((state) => state.currentUser);

  useEffect(() => {
    if (myUser) {
      dispatch(logout(navigate));
    }
  }, []);

  return (
    <div style={{ paddingTop: "25vh" }} className="fade-in-top">
      <Formik
        initialValues={myValues}
        onSubmit={(values, actions) => {
          if (
            values.captcha !== undefined &&
            values.captcha !== "" &&
            values.captcha !== null
          ) {
            // values.captcha = captcha    //only for testing
            if (captcha !== values.captcha) {
              adminLogin(values);
            } else {
              show({
                message: "Invalid Captcha Entered...",
                displayClass: "danger",
              });
            }
          } else {
            show({
              message: "Please Use Captcha For Login...",
              displayClass: "danger",
            });
          }
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().required("*Email Required"),
          password: Yup.string().required("*Password is Required"),
          captcha: Yup.string().required("*Captcha is Required"),
        })}
      >
        {({ values }) => {
          return (
            <div className="">
              <div className="container">
                <div className="row justify-content-center">
                  <div className="row justify-content-center">
                    <div className="col-xl-4 col-lg-5 col-md-6 col-sm-8 col-11">
                      <div className="card shadow-lg">
                        <div className="card-header bgTheme text-white">
                          <h4 className="text-center pt-2">
                            <b>LOGIN</b>
                          </h4>
                        </div>
                        <div className="card-body">
                          <Form>
                            <div className="row">
                              <div className="mb-3 col-12">
                                <div className="form-floating">
                                  <Field
                                    id="floatingEmail"
                                    name="email"
                                    type="text"
                                    className="form-control"
                                    placeholder="Email"
                                  />
                                  <label htmlFor="floatingEmail">
                                    Enter Email
                                  </label>
                                  <ErrorMessage name="email">
                                    {(msg) => (
                                      <span className="text-danger font-12">
                                        {msg}
                                      </span>
                                    )}
                                  </ErrorMessage>
                                </div>
                              </div>
                              <div className="mb-3 col-12">
                                <div className="input-group">
                                  <div className="form-floating">
                                    <Field
                                      name="password"
                                      id="password"
                                      className="form-control"
                                      type={eyeType ? "password" : "text"}
                                      placeholder="Password"
                                    />
                                    <label htmlFor="password">
                                      Enter Password
                                    </label>
                                  </div>
                                  <span className="input-group-text">
                                    {eyeType ? (
                                      <FaEye
                                        type="button"
                                        onClick={() => setEyeType(!eyeType)}
                                        className="field-icon toggle-password"
                                        style={{ cursor: "pointer" }} // Optional: Add cursor pointer for better UI
                                      />
                                    ) : (
                                      <FaEyeSlash
                                        type="button"
                                        onClick={() => setEyeType(!eyeType)}
                                        className="field-icon toggle-password"
                                        style={{ cursor: "pointer" }} // Optional: Add cursor pointer for better UI
                                      />
                                    )}
                                  </span>
                                </div>
                                <ErrorMessage name="password">
                                  {(msg) => (
                                    <span className="text-danger font-12">
                                      {msg}
                                    </span>
                                  )}
                                </ErrorMessage>
                              </div>

                              <div className="mb-3 col-6">
                                <div className="form-floating">
                                  <Field
                                    className="form-control"
                                    id="captcha"
                                    name="captcha"
                                    type="text"
                                    placeholder="Captcha Code"
                                  />
                                  <label htmlFor="captcha">Captcha Code</label>
                                  <ErrorMessage name="captcha">
                                    {(msg) => (
                                      <span className="text-danger font-12">
                                        {msg}
                                      </span>
                                    )}
                                  </ErrorMessage>
                                </div>
                              </div>
                              <div className="col-6 form-floating">
                                <div className="d-flex align-items-center justify-content-around form-control pt-2 px-0">
                                  <img
                                    src={`data:image/svg+xml;base64,${btoa(
                                      `<svg xmlns="http://www.w3.org/2000/svg" width="110" height="50"><text x="15" y="35" font-size="30" fill="black">${captcha}</text></svg>`
                                    )}`}
                                    alt="captcha"
                                    className="pt-1"
                                  />
                                  <button
                                    type="button"
                                    className="btn border-0 bg-dark text-light btn-sm ml-2"
                                    onClick={() =>
                                      setCaptcha(generateCaptchaCode())
                                    }
                                  >
                                    <FaSpinner />
                                  </button>
                                </div>
                              </div>
                              <div className="text-center col-12">
                                <hr />
                                <button
                                  className="btn admin-btn-primary btn-primary w-100"
                                  type="submit"
                                >
                                  Login
                                </button>
                              </div>
                            </div>
                          </Form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      </Formik>
    </div>
  );

  async function adminLogin(values) {
    dispatch(setLoading(true));
    try {
      const res = await API.post("/login", {
        email: values.email,
        password: values.password,
        browser: browser.name,
        os: browser.os,
        version: browser.version,
        role: 1,
      });
      dispatch(setLoading(false));
      if (res.data.status === "Success") {
        // sessionStorage.setItem(en("token"), JSON.stringify((res.data.token)));
        dispatch(setCurrentUser(res.data.data));
        navigate("/admin/home");
        show({
          message: res?.data?.message,
          displayClass: "success",
        });
      } else {
        show({
          message: res.response?.data?.message,
          displayClass: "danger",
        });
      }
    } catch (error) {
      dispatch(setLoading(false));
      show({
        message: error.response?.data?.message || error.message,
        displayClass: "danger",
      });
    }
  }
};

export default Login;
