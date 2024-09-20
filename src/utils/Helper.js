/* eslint-disable array-callback-return */
import { S3 } from "aws-sdk";
import CryptoJS from "crypto-js";
import aes from "crypto-js/aes";
import encHex from "crypto-js/enc-hex";
import padZeroPadding from "crypto-js/pad-zeropadding";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { toast } from "react-toastify";
import API from "../API";
import { navigate } from "../Store/AllReducers/navSlice";
import {
  setCurrentUser,
  unsetCurrentUser,
} from "../Store/AllReducers/userSlice";

// import API from '../API';
// import { setCurrentUser } from '../Store/AllReducers/userSlice';
import * as Yup from "yup";

const s3 = new S3({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

export async function handleFileUploadS3(file) {
  if (!file) return null;

  try {
    let finalName = file.name.replace(/[^a-zA-Z0-9 ]/g, "");
    finalName = finalName.split(" ").join("");
    finalName = finalName + "" + Date.now();
    console.log(finalName + " Uploaded");
    const params = {
      // Bucket: 'fra',
      Key: "uploads/" + finalName,
      ContentType: file.type,
      Body: file,
      Bucket: "fra-bucket-1",
      // Key: type === 'document' ? `document/${file.name}` : `dvv/${file.name}`,
    };

    const data = await s3.upload(params).promise();
    // console.log(`uploaded successfully:`, data);
    return data.Location;
  } catch (err) {
    console.error(`Error uploading :`, err);
    show({
      message: err?.response.message,
      displayClass: "danger",
    });
  }
}

export const handleFileDeleteS3 = async (filename) => {
  if (!filename) return null;

  try {
    let urlAry = filename.split("/");
    let oldFileName = urlAry[urlAry.length - 1];
    console.log(oldFileName + " Deleted");
    const params = {
      Bucket: "fra-bucket-1",
      Key: "uploads/" + oldFileName,
    };

    await s3.deleteObject(params).promise();
    // console.log('File deleted successfully');
  } catch (error) {
    console.error("Error deleting file:", error);
    show({
      message: error?.response.message,
      displayClass: "danger",
    });
  }
};

export async function fileUploadS3CustomName(file, finalName) {
  if (!file) return null;

  try {
    // let finalName = file.name.replace(/[^a-zA-Z0-9 ]/g, "");
    // finalName = finalName.split(" ").join("")
    console.log(finalName + " Uploaded");
    const params = {
      Key: "uploads/" + finalName,
      // Key: type === 'document' ? `document/${file.name}` : `dvv/${file.name}`,
      ContentType: file.type,
      Body: file,
      Bucket: "fra-bucket-1",
      // Bucket: 'fra',
    };

    const data = await s3.upload(params).promise();
    // console.log(`uploaded successfully:`, data);
    return data.Location;
  } catch (err) {
    console.error(`Error uploading :`, err);
    show({
      message: err?.response.message,
      displayClass: "danger",
    });
  }
}

export function show({ message, displayClass }) {
  if (displayClass === "success") {
    toast.success(message);
  } else if (displayClass === "warning") {
    toast.warn(message);
  } else if (displayClass === "danger" || displayClass === "failure") {
    toast.error(message);
  } else {
    toast.info(message);
  }
}

export function en(data) {
  try {
    let text =
      data !== undefined && data !== null && data !== "" ? "" + data + "" : "";
    if (text === "") {
      return text;
    }

    let key = encHex.parse(process.env.REACT_APP_EN_ID1);
    let iv = encHex.parse(process.env.REACT_APP_EN_ID2);
    let en1 = aes
      .encrypt(text, key, { iv: iv, padding: padZeroPadding })
      .toString();

    return en1;
  } catch (e) {
    console.log("Encryption log :", e);
    return "";
  }
}

export function de(data) {
  try {
    let encrypted =
      data !== undefined && data !== null && data !== "" ? data : "";
    if (encrypted === "") {
      return encrypted;
    }

    let key = encHex.parse(process.env.REACT_APP_EN_ID1);
    let iv = encHex.parse(process.env.REACT_APP_EN_ID2);
    let de1 = aes
      .decrypt(encrypted, key, { iv: iv })
      .toString(CryptoJS.enc.Utf8);

    return de1;
  } catch (e) {
    return "";
  }
}

export const whoAmI = async (dispatch, setLoading) => {
  try {
    setLoading(true);
    const res = await API.get("/whoAmI");
    setLoading(false);
    if (res.data.status === "success") {
      dispatch(setCurrentUser(JSON.parse(res?.data?.data)));
    } else {
      dispatch(unsetCurrentUser());
      dispatch(navigate("/admin/login"));
    }
  } catch (error) {
    setLoading(false);
    dispatch(unsetCurrentUser());
    dispatch(navigate("/admin/login"));
    console.error("WhoAmI Err:", error);
  }
};

// ------------------------------------- return Formik form -----------------------------------------
export const getFormikForm = (initialValues, required, onSubmit) => {
  let validationSchema = () => {
    let obj = {};

    required.map((item) => {
      obj[item] = Yup.string().required(item + " is Required");
    });

    return Yup.object().shape(obj);
  };

  let formikInitialValues = {};
  initialValues.map((item) => {
    formikInitialValues[item.name] = "";
  });

  return (
    <Formik
      initialValues={formikInitialValues}
      enableReinitialize={true}
      onSubmit={(values) => {
        onSubmit(values);
      }}
      validationSchema={validationSchema()}
    >
      {({ values }) => (
        <Form>
          {initialValues.map((item, index) => (
            <div className="form-floating mb-3" key={index}>
              <Field
                id={"floating" + item.name}
                name={item.name}
                type="text"
                value={values[item.name]}
                className="form-control"
                placeholder={item.name}
              />
              <label htmlFor={"floating" + item.name}>{item.heading}</label>
              <ErrorMessage name={item.name}>
                {(msg) => <span className="text-danger font-12">{msg}</span>}
              </ErrorMessage>
            </div>
          ))}
          <div className="text-center">
            <button type="submit" className="btn btn-primary m-2">
              Submit
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
