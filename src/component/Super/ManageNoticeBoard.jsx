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
import ConfirmationModal from "../Reusable/ConfirmationModal"; // Use reusable ConfirmationModal
import CustomModal from "../Reusable/CustomModal"; // Use reusable CustomModal
import DataTable from "../Reusable/CustomTable"; // Use reusable DataTable
import HeaderSection from "../Reusable/HeaderSection";

const ManageNoticeBoard = () => {
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
  const [selectedFileName, setSelectedFileName] = useState(""); // Track the file name

  useEffect(() => {
    getList();
  }, [updateModal, deleteModal]);

  const getList = async () => {
    try {
      const res = await API.get("/notice-board/listing");
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
                setSelectedFileName(item.link.split("/").pop()); // Show the existing file name in edit mode
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

  const add = async (values) => {
    if (!values.link) {
      show({ message: "Please Select a File.", displayClass: "danger" });
      return null;
    }
    values.link = await handleFileUploadS3(values.link);

    const fd = new FormData();
    Object.keys(values).forEach((item) => fd.append(item, values[item]));

    try {
      const res = await API.post("/notice-board/add", fd);
      setUpdateModal(false);
      show({ message: res.data.message, displayClass: res.data.status });
    } catch (error) {
      show({
        message: error.response?.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  };

  const update = async (values) => {
    if (values.link) {
      await handleFileDeleteS3(editData.link); // Delete old file
      values.link = await handleFileUploadS3(values.link); // Upload new file
    }

    const fd = new FormData();
    Object.keys(values).forEach((item) => fd.append(item, values[item]));

    try {
      const res = await API.put("/notice-board/update", fd);
      setUpdateModal(false);
      show({ message: res.data.message, displayClass: res.data.status });
    } catch (error) {
      show({
        message: error.response?.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  };

  const deleteItem = async (data) => {
    try {
      await handleFileDeleteS3(data.link);
      const res = await API.delete("/notice-board/delete", {
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

  const changeItemStatus = async (values) => {
    try {
      const res = await API.put("/notice-board/disable", values);
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
        title="Manage Notice Board"
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
        title={editData ? "Edit Notice Board" : "Add Notice Board"}
      >
        <Formik
          initialValues={{
            id: editData?.id || "",
            title: editData?.title || "",
            linkName: "",
            link: editData?.link || "",
          }}
          enableReinitialize={true}
          onSubmit={(values) => {
            editData ? update(values) : add(values);
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
                  name="linkName"
                  type="file"
                  className="form-control"
                  accept=".pdf"
                  onChange={(e) => {
                    setFieldValue("link", e.currentTarget.files[0]);
                    setSelectedFileName(e.currentTarget.files[0]?.name); // Set selected file name
                  }}
                />
                <label htmlFor="linkName">PDF File</label>
                <ErrorMessage
                  name="link"
                  component="span"
                  className="text-danger font-12"
                />

                {/* Display the file name */}
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
        title="Delete Notice Board"
        onConfirm={() => deleteItem(deleteModal.data)}
      >
        <p>
          Do you really want to delete the item titled:{" "}
          <b>{deleteModal.data?.title}</b>?
        </p>
      </ConfirmationModal>
    </div>
  );
};

export default ManageNoticeBoard;
