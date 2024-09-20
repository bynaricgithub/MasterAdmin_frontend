import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import RForm from "react-bootstrap/Form";
import API from "../../API";
import {
  handleFileDeleteS3,
  handleFileUploadS3,
  show,
} from "../../utils/Helper";
import ConfirmationModal from "../Reusable/ConfirmationModal";
import CustomModal from "../Reusable/CustomModal";
import DataTable from "../Reusable/CustomTable";
import FormInput from "../Reusable/FormInput";
import HeaderSection from "../Reusable/HeaderSection";

const ManageMembers = () => {
  const header = [
    { text: "Sr.No.", dataField: "srno", align: "center" },
    { text: "Title", dataField: "title" },
    { text: "Subtitle", dataField: "subtitle" },
    { text: "Image", dataField: "image", align: "center" },
    { text: "Order", dataField: "order_id", align: "center" },
    { text: "Actions", dataField: "actions", align: "center" },
  ];

  const [list, setList] = useState();
  const [updateModal, setUpdateModal] = useState(false);
  const [editData, setEditData] = useState();
  const [deleteModal, setDeleteModal] = useState({ modal: false, data: "" });
  const [selectedFileName, setSelectedFileName] = useState(""); // Track selected file name
  const [imagePreview, setImagePreview] = useState(null); // Track image preview

  useEffect(() => {
    getList();
  }, [updateModal, deleteModal]);

  return (
    <div className="px-2">
      <HeaderSection
        title="Manage Members"
        onClick={() => {
          setEditData(null);
          setSelectedFileName(""); // Reset file name
          setImagePreview(null); // Reset image preview
          setUpdateModal(true);
        }}
      />
      {/* DataTable */}
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
        title={editData ? "Edit Member" : "Add Member"}
      >
        <Formik
          initialValues={{
            id: editData?.id || "",
            title: editData?.title || "",
            subtitle: editData?.subtitle || "",
            imageName: "",
            image: editData?.image || "",
          }}
          enableReinitialize={true}
          onSubmit={async (values) => {
            if (editData) {
              await update(values);
            } else {
              await add(values);
            }
          }}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <div className="row">
                <div className="col-sm-12 text-center">
                  <FormInput
                    name="title"
                    label="Title"
                    value={values.title}
                    onChange={(e) => setFieldValue("title", e.target.value)}
                  />
                </div>
                <div className="col-sm-12 text-center">
                  <FormInput
                    name="subtitle"
                    label="Subtitle"
                    value={values.subtitle}
                    onChange={(e) => setFieldValue("subtitle", e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <div className="form-floating mb-3">
                    <Field
                      name="imageName"
                      type="file"
                      className="form-control"
                      onChange={(e) => {
                        const file = e.currentTarget.files[0];
                        setFieldValue("image", file);
                        setSelectedFileName(file?.name || ""); // Set selected file name
                        if (file) {
                          setImagePreview(URL.createObjectURL(file)); // Set image preview for new selection
                        }
                      }}
                    />
                    <label htmlFor="imageName">Image File</label>
                    <ErrorMessage
                      name="image"
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
                </div>
                <div className="col-sm-12 text-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="p-1"
                      height={100}
                    />
                  ) : editData?.image ? (
                    <img
                      src={editData.image} // Load from editData when editing
                      alt={editData.title}
                      className="p-1"
                      height={100}
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        show={deleteModal.modal}
        onHide={() => setDeleteModal({ modal: false, data: "" })}
        title="Delete Member"
        onConfirm={() => deleteItem(deleteModal.data)}
      >
        <p>
          Do you really want to delete the member titled:{" "}
          <b>{deleteModal.data?.title}</b>?
        </p>
      </ConfirmationModal>
    </div>
  );

  async function getList() {
    try {
      const res = await API.get("/members/listing");
      const data = res.data.data.map((item, i) => ({
        ...item,
        srno: i + 1,
        image: <img src={item.image} alt={item.title} width={100} />,
        actions: (
          <div className="d-flex justify-content-center">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditData(item);
                setSelectedFileName(item.image.split("/").pop()); // Set the existing file name for editing
                setImagePreview(item.image); // Show existing image preview
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
        message: error.response?.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  }

  async function add(values) {
    if (!values.image) {
      show({ message: "Please Select a File.", displayClass: "danger" });
      return null;
    }
    values.image = await handleFileUploadS3(values.image);
    delete values.imageName;

    try {
      const res = await API.post("/members/add", values);
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
      await handleFileDeleteS3(editData.image); // Delete old image
      values.image = await handleFileUploadS3(values.image); // Upload new image
    }
    delete values.imageName;

    try {
      const res = await API.put("/members/update", values);
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
      await handleFileDeleteS3(values.image); // Delete image from S3
      const res = await API.delete("/members/delete", {
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
      const res = await API.put("/members/disable", values);
      show({ message: res.data.message, displayClass: res.data.status });
    } catch (error) {
      show({
        message: error.response?.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  }
};

export default ManageMembers;
