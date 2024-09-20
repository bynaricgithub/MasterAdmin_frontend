/* eslint-disable react-hooks/exhaustive-deps */
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form, Formik } from "formik";
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

const ManageVideos = () => {
  const header = [
    { text: "Sr.No.", dataField: "srno", align: "center" },
    { text: "Link", dataField: "link2" },
    { text: "Video", dataField: "video" },
    { text: "Actions", dataField: "actions", align: "center" },
  ];

  const [list, setList] = useState();
  const [updateModal, setUpdateModal] = useState(false);
  const [editData, setEditData] = useState();
  const [deleteModal, setDeleteModal] = useState({
    modal: false,
    data: "",
  });

  useEffect(() => {
    getList();
  }, [updateModal, deleteModal]);

  return (
    <div className="px-2">
      <HeaderSection
        title="Manage Videos"
        buttonText="Upload Video"
        onClick={() => {
          setEditData(false);
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
        title={editData ? "Edit Video" : "Add Video"}
        footer={false}
      >
        <Formik
          initialValues={{
            id: editData?.id || "",
            link: editData?.link || "",
            videoName: "",
            video: "",
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
          {({ values, handleChange, setFieldValue }) => (
            <Form>
              <div className="row">
                <div className="col-sm-6">
                  <FormInput
                    name="link"
                    label="Video Link"
                    value={values.link}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-sm-6">
                  <FormInput
                    name="videoName"
                    label="Video File"
                    type="file"
                    onChange={(e) => {
                      handleChange(e);
                      setFieldValue("video", e.currentTarget.files[0]);
                    }}
                    value={values.videoName}
                    accept="video/*"
                  />
                </div>
                <div className="col-sm-6">
                  {!values.video ? (
                    <div className="text-center text-secondary">
                      No video selected
                    </div>
                  ) : (
                    <video
                      src={URL.createObjectURL(values.video)}
                      alt="selected-video"
                      className="p-2"
                      width={300}
                    />
                  )}
                </div>
              </div>
              <div className="text-center pb-3">
                <hr />

                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </CustomModal>

      {/* Delete Modal */}
      <ConfirmationModal
        show={deleteModal.modal}
        onHide={() => setDeleteModal({ modal: false, data: "" })}
        title="Delete Video"
        onConfirm={() => deleteItem(deleteModal.data)}
      />
    </div>
  );

  async function getList() {
    try {
      const res = await API.get("/news-and-events/listing");
      const data = res.data;

      setList(
        data?.data.map((item, i) => ({
          ...item,
          srno: i + 1,
          video: <video src={item.video} alt={item.title} width={100} />,
          actions: (
            <div className="d-flex justify-content-center">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setEditData(item);
                  setUpdateModal(true);
                }}
              >
                <FontAwesomeIcon icon={faPenToSquare} />
              </button>
              <button
                type="button"
                className="btn  btn-danger btn-sm"
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
        }))
      );
    } catch (error) {
      show({
        message: error.response.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  }

  async function add(values) {
    if (!values.video) {
      show({ message: "Please Select a File.", displayClass: "danger" });
      return;
    }

    values.video = await handleFileUploadS3(values.video);
    delete values.videoName;

    try {
      const res = await API.post("/news-and-events/add", values);
      const data = res.data;
      setUpdateModal(false);
      show({ message: data.message, displayClass: data.status });
    } catch (error) {
      show({
        message: error.response.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  }

  async function update(values) {
    if (values.video) {
      await handleFileDeleteS3(editData.video);
      values.video = await handleFileUploadS3(values.video);
    }

    try {
      const res = await API.put("/news-and-events/update", values);
      const data = res.data;
      setUpdateModal(false);
      show({ message: data.message, displayClass: data.status });
    } catch (error) {
      show({
        message: error.response.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  }

  async function deleteItem(values) {
    try {
      await handleFileDeleteS3(values.video);
      const res = await API.delete("/news-and-events/delete", {
        params: { id: values.id },
      });
      const data = res.data;
      setDeleteModal({ modal: false, data: "" });
      show({ message: data.message, displayClass: data.status });
    } catch (error) {
      show({
        message: error.response.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  }

  async function changeItemStatus(values) {
    try {
      const res = await API.put("/news-and-events/disable", values);
      const data = res.data;
      show({ message: data.message, displayClass: data.status });
    } catch (error) {
      show({
        message: error.response.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  }
};

export default ManageVideos;
