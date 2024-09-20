/* eslint-disable eqeqeq */
import axios from "axios";
import { en } from "./utils/Helper";

const serverPath = process.env.REACT_APP_SERVER_PROJPATH;

let API = axios.create({
  baseURL: serverPath,
  withCredentials: true,
  headers: {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "frame-ancestors 'none';",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    Server: "",
    //extra options
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "no-referrer-when-downgrade",
  },
});

// ------------------------------------------- For Data Encryption ------------------------------------------------------

//     API.interceptors.request.use(
//         function (config) {
//             if (config.params) {
//                 //get api
//                 let paramObj = {};
//                 const keyArr = Object.keys(config.params);//array of keys
//                 keyArr.forEach(key => {

//                     paramObj[key] = encodeURIComponent(en(config.params[key]));

//                 });
//                 config.params = { "inputParam": encodeURIComponent(en(JSON.stringify(paramObj))) };

//             }

//             if (config.data) {
//                 //post api
//                 let dataObj = {};
//                 const keyArr = Object.keys(config.data);//array of keys
//                 keyArr.forEach(key => {

//                     if (isObject(config.data[key]) || Array.isArray(config.data[key])) {
//                         config.data[key] = JSON.stringify(config.data[key]);
//                     }

//                     dataObj[key] = encodeURIComponent(en(config.data[key]));
//                 });

//                 config.data = { "inputParam": encodeURIComponent(en(JSON.stringify(dataObj))) };
//             }
//             // ------------------------------------ Setting token -----------------------------------------
//             const tokenName = en("token")
//             const token = de(
//                 window.atob(
//                     decodeURIComponent(JSON.parse(sessionStorage.getItem(tokenName)))
//                 )
//             );
//             if (token) {
//                 config.headers["Authorization"] = "Bearer " + token;
//             }
//             return config;
//         },
//         function (error) {
//             return Promise.reject(error);
//         }
//     );

//     API.interceptors.response.use(
//         (response) => {
//             let res_data = de(response.data)
//             // ------------------------------- checking if response is html or not (Example : Payment) -------------------------------------------
//             if (/<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/.test(res_data)) {
//                 response.data = (res_data);
//             }
//             else {
//                 response.data = JSON.parse(res_data);
//             }
//             return response;
//         },
//         (error) => {
//             if (error.response.status == 440) {

//                 //----------------Invalid User-Trying to modify token or session time out--------------
//                 window.location.href = "/";

//             }
//             error.response.data = JSON.parse(de(error.response.data));
//             console.log(error.response.data);
//             const status = error.response;
//             let errRes = { ...error };
//             if (status !== undefined && status.status === 401) {
//                 window.location.href = "/login";
//             } else if (status !== undefined && status.status === 429) {
//                 errRes = {
//                     'response': {
//                         data: {
//                             message: "Server is Busy. Please wait for some seconds. Your Response will not be saved till this message keeps appearing."
//                         }
//                     }
//                 }

//             } else if (status === undefined || !status) {
//                 errRes = {
//                     'response': {
//                         data: {
//                             message: "There is some problem with server response.Your Response will not be saved till this message keeps appearing."
//                         }
//                     }
//                 }
//             }
//             if (!error.response) {
//                 errRes = {
//                     'response': {
//                         data: {
//                             message: "Your Connection to server is lost. Please Check your internet Connection."
//                         }
//                     }
//                 }
//             }
//             return Promise.reject(errRes);
//         }
//     );

// }
// else {
API.interceptors.request.use(
  function (config) {
    // ------------------------------------ Setting token -----------------------------------------
    const tokenName = en("token");
    const token = window.atob(
      decodeURIComponent(JSON.parse(sessionStorage.getItem(tokenName)))
    );
    if (token) {
      config.headers["Authorization"] = "Bearer " + token;
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default API;
