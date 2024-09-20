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
import HeaderSection from "../Reusable/HeaderSection";

const ManageSliderImages = () => {
  const header = [
    { text: "Sr.No.", dataField: "srno", align: "center" },
    { text: "Alternate Name", dataField: "alternate_name" },
    { text: "Image", dataField: "imgPreview", align: "center" },
    { text: "Order ID", dataField: "order_id", align: "center" },
    { text: "Actions", dataField: "actions", align: "center" },
  ];

  const [list, setList] = useState([]);
  const [updateModal, setUpdateModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ modal: false, data: null });

  useEffect(() => {
    getSliderImages();
  }, [updateModal, deleteModal]);

  const getSliderImages = async () => {
    try {
      const res = await API.get("/slider-images/listing");
      const data = res.data;
      const formattedData = data.data.map((item, i) => ({
        ...item,
        srno: i + 1,
        imgPreview: (
          <img
            src={item.image}
            alt={item.alternate_name}
            style={{ width: "70%" }}
          />
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
              id="custom-switch"
              onClick={(e) =>
                changeSliderImageStatus({
                  id: item.id,
                  status: e.target.checked ? 1 : 0,
                })
              }
            />
          </div>
        ),
      }));
      setList(formattedData);
    } catch (error) {
      show({
        message: error.response?.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  };

  const addSliderImage = async (values) => {
    if (!values.image)
      return show({
        message: "Please Select an Image.",
        displayClass: "danger",
      });

    const imageURL = await handleFileUploadS3(values.image);
    values.image = imageURL;

    const fd = new FormData();
    Object.keys(values).forEach((item) => fd.append(item, values[item]));

    try {
      const res = await API.post("/slider-images/add", fd);
      setUpdateModal(false);
      show({ message: res.data.message, displayClass: res.data.status });
    } catch (error) {
      show({
        message: error.response?.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  };

  const updateSliderImages = async (values) => {
    if (!values.image)
      return show({
        message: "Please Select an Image.",
        displayClass: "danger",
      });

    await handleFileDeleteS3(values.oldImage);
    values.image = await handleFileUploadS3(values.image);

    const fd = new FormData();
    Object.keys(values).forEach((item) => fd.append(item, values[item]));

    try {
      const res = await API.put("/slider-images/update", fd);
      setUpdateModal(false);
      show({ message: res.data.message, displayClass: res.data.status });
    } catch (error) {
      show({
        message: error.response?.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  };

  const changeSliderImageStatus = async (values) => {
    try {
      const res = await API.post("/slider-images/disable", values);
      show({ message: res.data.message, displayClass: res.data.status });
    } catch (error) {
      show({
        message: error.response?.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  };

  const deleteSliderImage = async (data) => {
    try {
      await handleFileDeleteS3(data.image);
      const res = await API.delete("/slider-images/delete", {
        params: { id: data.id },
      });
      setDeleteModal({ modal: false, data: null });
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
        title="Manage Slider Images"
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
        title={editData ? "Edit Slider Image" : "Add Slider Image"}
      >
        <Formik
          initialValues={{
            id: editData?.id || "",
            alternate_name: editData?.alternate_name || "",
            order_id: editData?.order_id || "",
            imageName: editData?.imageName || "",
            image: editData?.image || "", // If editData contains an image URL
          }}
          enableReinitialize={true}
          onSubmit={(values) => {
            if (editData) {
              updateSliderImages({ ...values, oldImage: editData.image });
            } else {
              addSliderImage(values);
            }
          }}
        >
          {({ values, handleChange, setFieldValue }) => (
            <Form>
              <div className="row">
                <div className="col-sm-12">
                  <div className="form-floating mb-3">
                    <Field
                      id="floatingImage"
                      name="imageName"
                      type="file"
                      onChange={(e) => {
                        handleChange(e);
                        setFieldValue("image", e.currentTarget.files[0]); // Capture the file
                      }}
                      value={values.imageName}
                      className="form-control"
                      placeholder="Image"
                      accept="image/*"
                    />
                    <label htmlFor="floatingImage">Image</label>
                    <ErrorMessage
                      name="image"
                      component="span"
                      className="text-danger font-12"
                    />
                  </div>
                </div>
                {/* Image Preview */}
                <div className="col-sm-12 text-center">
                  {values.image && values.image instanceof File ? (
                    <img
                      src={URL.createObjectURL(values.image)}
                      alt="selectedImage"
                      className="p-1 img-fluid"
                    />
                  ) : values.image ? (
                    <img
                      src={values.image}
                      alt="existingImage"
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        show={deleteModal.modal}
        onHide={() => setDeleteModal({ modal: false, data: null })}
        title="Delete Slider Image"
        onConfirm={() => deleteSliderImage(deleteModal.data)}
      />
    </div>
  );
};

export default ManageSliderImages;
