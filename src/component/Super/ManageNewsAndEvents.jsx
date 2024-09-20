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
import DataTable from "../Reusable/CustomTable"; // Updated to use reusable DataTable
import HeaderSection from "../Reusable/HeaderSection";

const ManageNewsAndEvents = () => {
  const header = [
    { text: "Sr.No.", dataField: "srno", align: "center" },
    { text: "Title", dataField: "title" },
    { text: "Subtitle", dataField: "subtitle" },
    { text: "Link", dataField: "link2", align: "center" },
    { text: "Image", dataField: "image", align: "center" },
    { text: "Actions", dataField: "actions", align: "center" },
  ];

  const [list, setList] = useState([]);
  const [updateModal, setUpdateModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ modal: false, data: "" });

  useEffect(() => {
    getList();
  }, [updateModal, deleteModal]);

  const getList = async () => {
    try {
      const res = await API.get("/news-and-events/listing");
      const data = res.data.data.map((item, i) => ({
        ...item,
        srno: i + 1,
        image: <img src={item.image} alt={item.title} width={100} />,
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
    if (!values.link || !values.image) {
      show({ message: "Please Select a File.", displayClass: "danger" });
      return null;
    }
    values.image = await handleFileUploadS3(values.image);
    values.link = await handleFileUploadS3(values.link);

    const fd = new FormData();
    Object.keys(values).forEach((item) => fd.append(item, values[item]));

    const config = { headers: { "content-type": "multipart/form-data" } };

    try {
      const res = await API.post("/news-and-events/add", fd, config);
      setUpdateModal(false);
      show({ message: res.data.message, displayClass: res.data.status });
    } catch (error) {
      show({
        message: error.response?.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  };

  const update = async (values, editData) => {
    if (values.image) {
      await handleFileDeleteS3(editData.image);
      values.image = await handleFileUploadS3(values.image);
    }
    if (values.link) {
      await handleFileDeleteS3(editData.link);
      values.link = await handleFileUploadS3(values.link);
    }

    const fd = new FormData();
    Object.keys(values).forEach((item) => fd.append(item, values[item]));

    const config = { headers: { "content-type": "multipart/form-data" } };

    try {
      const res = await API.put(
        `/news-and-events/update/${editData.id}`,
        fd,
        config
      );
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
      await handleFileDeleteS3(data.image);
      const res = await API.delete(`/news-and-events/delete`, {
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
      const res = await API.put("/news-and-events/disable", values);
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
        title="Manage News and Events"
        onClick={() => {
          setEditData(null);
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
        title={editData ? "Edit News and Events" : "Add News and Events"}
      >
        <Formik
          initialValues={{
            id: editData?.id || "",
            title: editData?.title || "",
            subtitle: editData?.subtitle || "",
            linkName: "",
            imageName: "",
            image: editData?.image || "",
            link: editData?.link || "",
          }}
          enableReinitialize={true}
          onSubmit={(values) => {
            editData ? update(values, editData) : add(values);
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
                  name="subtitle"
                  type="text"
                  className="form-control"
                  placeholder="Subtitle"
                />
                <label htmlFor="subtitle">Subtitle</label>
                <ErrorMessage
                  name="subtitle"
                  component="span"
                  className="text-danger font-12"
                />
              </div>

              <div className="row">
                <div className="col-sm-12">
                  <div className="form-floating mb-3">
                    <Field
                      name="linkName"
                      type="file"
                      className="form-control"
                      accept=".pdf"
                      onChange={(e) =>
                        setFieldValue("link", e.currentTarget.files[0])
                      }
                    />
                    <label htmlFor="linkName">PDF File</label>
                    <ErrorMessage
                      name="link"
                      component="span"
                      className="text-danger font-12"
                    />
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="form-floating mb-3">
                    <Field
                      name="imageName"
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) =>
                        setFieldValue("image", e.currentTarget.files[0])
                      }
                    />
                    <label htmlFor="imageName">Image File</label>
                    <ErrorMessage
                      name="image"
                      component="span"
                      className="text-danger font-12"
                    />
                  </div>
                </div>

                <div className="col-sm-6 text-center">
                  {values.image && typeof values.image === "string" ? (
                    <img src={values.image} alt="existingImage" height={100} />
                  ) : values.image ? (
                    <img
                      src={URL.createObjectURL(values.image)}
                      alt="selectedImage"
                      className="p-1 img-fluid"
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

      {/* Reusable ConfirmationModal for Delete */}
      <ConfirmationModal
        show={deleteModal.modal}
        onHide={() => setDeleteModal({ modal: false, data: "" })}
        title="Delete News and Event"
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

export default ManageNewsAndEvents;
