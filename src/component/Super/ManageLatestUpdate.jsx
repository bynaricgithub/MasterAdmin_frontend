import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import RForm from "react-bootstrap/Form";
import { FaFilePdf } from "react-icons/fa";
import API from "../../API";
import {
  handleFileDeleteS3,
  handleFileUploadS3,
  show,
} from "../../utils/Helper";
import ConfirmationModal from "../Reusable/ConfirmationModal";
import CustomModal from "../Reusable/CustomModal";
import DataTable from "../Reusable/CustomTable";
import HeaderSection from "../Reusable/HeaderSection";

const ManageLatestUpdate = () => {
  const header = [
    { text: "Sr.No.", dataField: "srno", align: "center" },
    { text: "Title", dataField: "title" },
    { text: "Link", dataField: "link2", align: "center" },
    { text: "Order ID", dataField: "order_id", align: "center" },
    { text: "Actions", dataField: "actions", align: "center" },
  ];

  const [list, setList] = useState([]);
  const [updateModal, setUpdateModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ modal: false, data: "" });
  const [selectedFileName, setSelectedFileName] = useState(""); // State for file name
  const [selectedFile, setSelectedFile] = useState(null); // Track selected file object

  useEffect(() => {
    getLatestUpdates();
  }, [updateModal, deleteModal]);

  const getLatestUpdates = async () => {
    try {
      const res = await API.get("/latest-update/listing");
      const data = res.data?.data.map((item, i) => ({
        ...item,
        srno: i + 1,
        link2: (
          <a
            href={item.link}
            target="_blank"
            className="text-decoration-none btn btn-primary"
            rel="noreferrer"
          >
            <FaFilePdf />
          </a>
        ),
        actions: (
          <div className="d-flex justify-content-center">
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditData(item);
                setUpdateModal(true);
                setSelectedFileName(item.link);
              }}
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setDeleteModal({ modal: true, data: item })}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
            <RForm.Check
              defaultChecked={item.status === 1}
              type="switch"
              onClick={(e) =>
                changeStatusLatestUpdates({
                  id: item.id,
                  status: e.target.checked ? 1 : 0,
                })
              }
            />
          </div>
        ),
      }));
      setList(data);
    } catch (error) {
      show({
        message: error.response?.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  };

  const addLatestUpdates = async (values) => {
    if (!values.link) {
      show({ message: "Please Select a File.", displayClass: "danger" });
      return null;
    }
    values.link = await handleFileUploadS3(values.link);

    const fd = new FormData();
    Object.keys(values).forEach((item) => fd.append(item, values[item]));

    try {
      const res = await API.post("/latest-update/add", fd);
      setUpdateModal(false);
      show({ message: res.data.message, displayClass: res.data.status });
    } catch (error) {
      show({
        message: error.response?.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  };

  const updateLatestUpdates = async (values) => {
    if (values.link && selectedFile) {
      await handleFileDeleteS3(editData.link); // Delete old file
      values.link = await handleFileUploadS3(values.link); // Upload new file
    }

    const fd = new FormData();
    Object.keys(values).forEach((item) => fd.append(item, values[item]));

    try {
      const res = await API.put("/latest-update/update", fd);
      setUpdateModal(false);
      show({ message: res.data.message, displayClass: res.data.status });
    } catch (error) {
      show({
        message: error.response?.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  };

  const deleteLatestUpdates = async (data) => {
    try {
      await handleFileDeleteS3(data.link);
      const res = await API.delete("/latest-update/delete", {
        params: { id: data.id },
      });
      setDeleteModal({ modal: false, data: "" });
      show({ message: res.data.message, displayClass: res.data.status });
    } catch (error) {
      show({
        message: error.response?.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  };

  const changeStatusLatestUpdates = async (values) => {
    try {
      const res = await API.put("/latest-update/disable", values);
      show({ message: res.data.message, displayClass: res.data.status });
    } catch (error) {
      show({
        message: error.response?.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  };

  return (
    <div className="px-2">
      <HeaderSection
        title="Manage Latest Update"
        onClick={() => {
          setEditData(null);
          setUpdateModal(true);
          setSelectedFile(null);
          setSelectedFileName("");
        }}
      />

      <DataTable
        data={list}
        columns={header}
        keyField="srno"
        searchEnabled={true}
        gridViewEnabled={true}
        entriesEnabled={true}
        paginationEnabled={true}
        customPageSize={10}
      />

      <CustomModal
        show={updateModal}
        onHide={() => setUpdateModal(false)}
        title={editData ? "Edit Latest Update" : "Add Latest Update"}
      >
        <Formik
          initialValues={{
            id: editData?.id || "",
            title: editData?.title || "",
            link: editData?.link || "",
          }}
          enableReinitialize={true}
          onSubmit={(values) => {
            editData ? updateLatestUpdates(values) : addLatestUpdates(values);
          }}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <div className="form-floating mb-3">
                <Field
                  name="title"
                  type="text"
                  className="form-control"
                  placeholder="Title"
                />
                <label htmlFor="title">Title</label>
                <ErrorMessage
                  name="title"
                  component="span"
                  className="text-danger font-12"
                />
              </div>

              <div className="form-floating mb-3">
                <input
                  name="link"
                  type="file"
                  className="form-control"
                  accept=".pdf"
                  onChange={(e) => {
                    setFieldValue("link", e.currentTarget.files[0]);
                    setSelectedFileName(e.currentTarget.files[0]?.name);
                    setSelectedFile(e.currentTarget.files[0]); // Track file selection
                  }}
                />
                <label htmlFor="link">PDF File</label>
                <ErrorMessage
                  name="link"
                  component="span"
                  className="text-danger font-12"
                />

                {selectedFileName && (
                  <div className="mt-2 text-primary">
                    Selected File: <strong>{selectedFileName}</strong>
                  </div>
                )}
              </div>

              <div className="text-center pb-3">
                <hr />
                <button type="submit" className="btn btn-primary mx-2">
                  Submit
                </button>
                <button
                  type="button"
                  className="btn btn-danger mx-2"
                  onClick={() => setUpdateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </CustomModal>

      {/* Reusable ConfirmationModal for Delete */}
      <ConfirmationModal
        show={deleteModal.modal}
        onHide={() => setDeleteModal({ modal: false, data: "" })}
        title="Delete Latest Update"
        onConfirm={() => deleteLatestUpdates(deleteModal.data)}
      >
        <p>
          Do you really want to delete the item titled:{" "}
          <b>{deleteModal.data?.title}</b>?
        </p>
      </ConfirmationModal>
    </div>
  );
};

export default ManageLatestUpdate;
