/* eslint-disable react-hooks/exhaustive-deps */
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import RForm from "react-bootstrap/Form";
import * as Yup from "yup";
import API from "../../API";
import {
  handleFileDeleteS3,
  handleFileUploadS3,
  show,
} from "../../utils/Helper";

// Reusable components
import { FaFilePdf } from "react-icons/fa";
import ConfirmationModal from "../Reusable/ConfirmationModal"; // Use reusable ConfirmationModal
import CustomModal from "../Reusable/CustomModal"; // Use reusable CustomModal
import DataTable from "../Reusable/CustomTable"; // Use reusable DataTable
import HeaderSection from "../Reusable/HeaderSection";

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"), // Title is required
  link: Yup.string().url("Invalid URL").required("Link is required"), // Link is required and must be a valid URL
});

const ManageArticle = () => {
  const header = [
    { text: "Sr.No.", dataField: "srno", align: "center" },
    { text: "Title", dataField: "title" },
    { text: "Link", dataField: "link2", align: "center" },
    { text: "Image", dataField: "image", align: "center" },
    { text: "Actions", dataField: "actions", align: "center" },
  ];

  const [list, setList] = useState();
  const [updateModal, setUpdateModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ modal: false, data: "" });
  const [selectedFileName, setSelectedFileName] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    getList();
  }, [updateModal, deleteModal]);

  return (
    <div className="px-2">
      <HeaderSection
        title="Manage News Article"
        onClick={() => {
          setEditData(null);
          setSelectedFileName("");
          setImagePreview(null);
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

      {/* Add/Edit Modal */}
      <CustomModal
        show={updateModal}
        onHide={() => setUpdateModal(false)}
        title={editData ? "Edit Article" : "Add Article"}
      >
        <Formik
          initialValues={{
            id: editData?.id || "",
            title: editData?.title || "", // Initialize title
            link: editData?.link || "", // Initialize link
            imgName: "",
            image: editData?.image || "",
          }}
          enableReinitialize={true}
          validationSchema={validationSchema} // Add validation schema
          onSubmit={async (values) => {
            if (editData) {
              await update(values);
            } else {
              await add(values);
            }
          }}
        >
          {({ values, handleChange, setFieldValue }) => (
            <Form>
              {/* Title Field */}
              <div className="form-floating mb-3">
                <Field
                  id="floatingTitle"
                  name="title"
                  type="text"
                  className="form-control"
                  placeholder="Title"
                />
                <label htmlFor="floatingTitle">Title</label>
                <ErrorMessage
                  name="title"
                  component="span"
                  className="text-danger"
                />
              </div>

              {/* Link Field */}
              <div className="form-floating mb-3">
                <Field
                  id="floatingLink"
                  name="link"
                  type="text"
                  className="form-control"
                  placeholder="Link"
                />
                <label htmlFor="floatingLink">Link</label>
                <ErrorMessage
                  name="link"
                  component="span"
                  className="text-danger"
                />
              </div>

              <div className="row">
                <div className="col-sm-6">
                  <div className="form-floating mb-3">
                    <Field
                      id="floatingImage"
                      name="imgName"
                      type="file"
                      onChange={(e) => {
                        const file = e.currentTarget.files[0];
                        setFieldValue("image", file);
                        setSelectedFileName(file?.name || ""); // Set selected file name
                        if (file) {
                          setImagePreview(URL.createObjectURL(file)); // Set image preview
                        }
                      }}
                      className="form-control"
                      placeholder="Image"
                      accept="image/*"
                    />
                    <label htmlFor="floatingImage">Image File</label>
                    <ErrorMessage
                      name="image"
                      component="span"
                      className="text-danger"
                    />

                    {selectedFileName && (
                      <div className="mt-2 text-primary">
                        Selected File: <strong>{selectedFileName}</strong>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-sm-6">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="p-2"
                      width={300}
                    />
                  ) : editData?.image ? (
                    <img
                      src={editData.image}
                      alt={editData.title}
                      className="p-2"
                      width={300}
                    />
                  ) : (
                    <div className="text-center text-secondary">
                      No image selected
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center pb-3">
                <hr />
                <button type="submit" className="btn btn-primary">
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        show={deleteModal.modal}
        onHide={() => setDeleteModal({ modal: false, data: "" })}
        title="Delete Article"
        onConfirm={() => deleteItem(deleteModal.data)}
      >
        <p>
          Do you really want to delete the article titled:{" "}
          <b>{deleteModal.data?.title}</b>?
        </p>
      </ConfirmationModal>
    </div>
  );

  async function getList() {
    try {
      const res = await API.get("/news-and-events/listing");
      const data = res.data.data.map((item, i) => ({
        ...item,
        srno: i + 1,
        title: item.title, // Add title field to the data
        link2: (
          <a
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="text-decoration-none btn btn-primary"
          >
            <FaFilePdf />
          </a>
        ), // Show the link in the table as a clickable URL
        image: <img src={item.image} alt={item.title} width={100} />,
        actions: (
          <div className="d-flex justify-content-center">
            <button
              type="button"
              className="btn  btn-primary btn-sm"
              onClick={() => {
                setEditData(item);
                setSelectedFileName(item.image.split("/").pop());
                setImagePreview(item.image);
                setUpdateModal(true);
              }}
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => setDeleteModal({ modal: true, data: item })}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
            <div className="text-center p-1">
              <RForm.Check
                defaultChecked={item.status === 1}
                type="switch"
                id="custom-switch"
                onClick={(e) =>
                  changeItemStatus({
                    id: item.id,
                    status: e.target.checked ? 1 : 0,
                  })
                }
              />
            </div>
          </div>
        ),
      }));
      setList(data);
    } catch (error) {
      show({
        message: error.response.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  }

  async function add(values) {
    if (!values.image) {
      show({ message: "Please Select a File.", displayClass: "danger" });
      return;
    }
    values.image = await handleFileUploadS3(values.image);
    delete values.imgName;

    try {
      const res = await API.post("/news-and-events/add", values);
      setUpdateModal(false);
      show({ message: res.data.message, displayClass: res.data.status });
    } catch (error) {
      show({
        message: error.response?.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  }

  async function update(values) {
    if (values.image) {
      await handleFileDeleteS3(editData.image);
      values.image = await handleFileUploadS3(values.image);
    }
    delete values.imgName;

    try {
      const res = await API.put("/news-and-events/update", values);
      setUpdateModal(false);
      show({ message: res.data.message, displayClass: res.data.status });
    } catch (error) {
      show({
        message: error.response?.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  }

  async function deleteItem(values) {
    try {
      await handleFileDeleteS3(values.image);
      const res = await API.delete("/news-and-events/delete", {
        params: { id: values.id },
      });
      setDeleteModal({ modal: false, data: "" });
      show({ message: res.data.message, displayClass: res.data.status });
    } catch (error) {
      show({
        message: error.response?.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  }

  async function changeItemStatus(values) {
    try {
      const res = await API.put("/news-and-events/disable", values);
      show({ message: res.data.message, displayClass: res.data.status });
    } catch (error) {
      show({
        message: error.response?.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  }
};

export default ManageArticle;
