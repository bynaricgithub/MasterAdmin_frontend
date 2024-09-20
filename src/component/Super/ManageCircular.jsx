/* eslint-disable react-hooks/exhaustive-deps */
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

const ManageCircular = () => {
  const header = [
    { text: "Sr.No.", dataField: "srno", align: "center" },
    { text: "Date", dataField: "date" },
    { text: "Title", dataField: "title" },
    { text: "Link", dataField: "link2", align: "center" },
    { text: "Order ID", dataField: "order_id", align: "center" },
    { text: "Actions", dataField: "actions", align: "center" },
  ];

  const [list, setList] = useState([]);
  const [editData, setEditData] = useState(null);
  const [updateModal, setUpdateModal] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState(""); // Track selected file name
  const [deleteModal, setDeleteModal] = useState({ modal: false, data: "" });

  useEffect(() => {
    getList();
  }, [updateModal, deleteModal]);

  // Fetch Circulars List
  const getList = async () => {
    try {
      const res = await API.get("/circular/listing");
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
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditData(item);
                setSelectedFileName(item.link.split("/").pop()); // Set file name on edit
                setUpdateModal(true);
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
                changeItemStatus({
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

  // Add Circular
  const addCircular = async (values) => {
    if (!values.link) {
      show({ message: "Please Select a File.", displayClass: "danger" });
      return null;
    }

    values.link = await handleFileUploadS3(values.link);

    try {
      const res = await API.post("/circular/add", values);
      setUpdateModal(false);
      show({ message: res.data.message, displayClass: res.data.status });
    } catch (error) {
      show({
        message: error.response?.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  };

  // Update Circular
  const updateCircular = async (values) => {
    if (values.link) {
      await handleFileDeleteS3(editData.link); // Delete old file
      values.link = await handleFileUploadS3(values.link); // Upload new file
    }

    try {
      const res = await API.put("/circular/update", values);
      setUpdateModal(false);
      show({ message: res.data.message, displayClass: res.data.status });
    } catch (error) {
      show({
        message: error.response?.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  };

  // Delete Circular
  const deleteCircular = async (data) => {
    try {
      await handleFileDeleteS3(data.link);
      const res = await API.delete("/circular/delete", {
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

  // Change Circular Status
  const changeItemStatus = async (values) => {
    try {
      const res = await API.put("/circular/disable", values);
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
        title="Manage Circular"
        onClick={() => {
          setEditData(null);
          setSelectedFileName("");
          setUpdateModal(true);
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
        title={editData ? "Edit Circular" : "Add Circular"}
      >
        <Formik
          initialValues={{
            id: editData?.id || "",
            title: editData?.title || "",
            date: editData?.date || "",
            link: "",
            linkName: "",
          }}
          enableReinitialize={true}
          onSubmit={(values) => {
            editData ? updateCircular(values) : addCircular(values);
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
                <Field
                  name="date"
                  type="date"
                  className="form-control"
                  placeholder="Date"
                />
                <label htmlFor="date">Select Date</label>
                <ErrorMessage
                  name="date"
                  component="span"
                  className="text-danger font-12"
                />
              </div>

              <div className="form-floating mb-3">
                <Field
                  name="linkName"
                  type="file"
                  className="form-control"
                  accept=".pdf"
                  onChange={(e) => {
                    setFieldValue("link", e.currentTarget.files[0]);
                    setSelectedFileName(e.currentTarget.files[0]?.name); // Set file name
                  }}
                />
                <label htmlFor="linkName">PDF File</label>
                <ErrorMessage
                  name="link"
                  component="span"
                  className="text-danger font-12"
                />

                {/* Display selected or existing file name */}
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
        title="Delete Circular"
        onConfirm={() => deleteCircular(deleteModal.data)}
      >
        <p>
          Do you really want to delete the circular titled:{" "}
          <b>{deleteModal.data?.title}</b>?
        </p>
      </ConfirmationModal>
    </div>
  );
};

export default ManageCircular;
