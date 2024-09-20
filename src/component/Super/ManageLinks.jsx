import {
  faCaretDown,
  faCaretUp,
  faPenToSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import RForm from "react-bootstrap/Form";
import * as Yup from "yup";
import API from "../../API";
import CustomLoader from "../../utils/CustomLoader";
import { show } from "../../utils/Helper";

// Reusable Components
import { FaPlus } from "react-icons/fa";
import ConfirmationModal from "../Reusable/ConfirmationModal";
import CustomModal from "../Reusable/CustomModal";
import DataTable from "../Reusable/CustomTable";

// Define the validation schema using Yup
const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  menu_url: Yup.string()
    .test(
      "is-valid-url-or-blank",
      "Invalid URL format. It should be a valid URL, '#', or '/'",
      (value) => {
        return (
          value === "#" ||
          value === "/" ||
          Yup.string().url().isValidSync(value)
        );
      }
    )
    .required("Menu URL is required"),
});

const ManageLinks = () => {
  const header = [
    { text: "Sr.No.", dataField: "srno", align: "center" },
    { text: "Title", dataField: "title" },
    { text: "Menu URL", dataField: "menu_url" },
    { text: "Parent", dataField: "parent_id" },
    { text: "Actions", dataField: "actions", align: "center" },
  ];

  const [list, setList] = useState();
  const [data, setData] = useState();
  const [fetchData, setFetchData] = useState(false);
  const [menus, setMenus] = useState();
  const [sorting, setSorting] = useState();
  const [updateModal, setUpdateModal] = useState(false);
  const [editData, setEditData] = useState();
  const [deleteModal, setDeleteModal] = useState({ modal: false, data: "" });
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    getLinks();
  }, [updateModal, deleteModal, fetchData]);

  useEffect(() => {
    if (data) {
      getMenus(data);
    }
  }, [data]);

  // Function to process menu data and set hierarchical menus
  function getMenus(menuData) {
    let menus = [];
    menuData.forEach((item) => {
      if (item.id === item.parent_id) {
        let strct = {
          id: item.id,
          label: item.title,
          link: item.menu_url,
          order_id: item.order_id,
          parent_id: item.parent_id,
        };
        menus.push(strct);
      }
    });

    menuData = menuData.filter(
      (item) => !menus.find((item2) => item2.id === item.id)
    );

    menus.forEach((item) => {
      item.subMenu = getSubmenus(menuData, item.id);
    });

    setMenus(menus);
    setSorting(menus);
  }

  // Recursive function to get submenus
  function getSubmenus(ary, id) {
    let subMenu = [];
    ary?.forEach((item) => {
      if (item.parent_id === id) {
        let strct = {
          id: item.id,
          label: item.title,
          link: item.menu_url,
          order_id: item.order_id,
          parent_id: item.parent_id,
          subMenu: getSubmenus(
            ary.filter((item2) => item2.id !== item.id),
            item.id
          ),
        };
        subMenu.push(strct);
      }
    });
    return subMenu;
  }

  // Sortable List for displaying hierarchical menus
  const SortableList = ({ item, order_id }) => {
    return (
      <>
        <div className="d-flex justify-content-between menuList">
          <h6 className="mb-0">
            {item.link === "#" && "📁 "}
            {item.link !== "#" && <> &#127760; </>}
            {item.label}
          </h6>
          <div className="sortBtn">
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => reorderUp(item)}
            >
              <FontAwesomeIcon icon={faCaretUp} />
            </button>
            <label>{order_id}</label>
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={() => reorderDown(item)}
            >
              <FontAwesomeIcon icon={faCaretDown} />
            </button>
          </div>
        </div>
        {item.subMenu && (
          <div className="subMenuList">
            {item.subMenu
              .sort((a, b) => a.order_id - b.order_id)
              .map((child, index) => (
                <SortableList
                  key={index}
                  item={child}
                  order_id={child.order_id}
                />
              ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="px-2">
      <div className="text-center head-title mt-3 pb-2">
        <h4 className="mb-0">Manage Links</h4>
      </div>

      {list && (
        <div className="d-flex justify-content-between align-items-center px-3 mb-3  sort-card">
          <div className="d-flex align-items-center">
            Links&nbsp;&nbsp;
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                checked={showMenu}
                id="flexSwitchCheckDefault"
                onChange={(e) => setShowMenu(e.target.checked)}
              />
            </div>
            Tree
          </div>
          {!showMenu && (
            <button
              type="button"
              className="btn rounded-4 btn-primary px-3 font-14"
              onClick={() => {
                setEditData(null);
                setUpdateModal(true);
              }}
            >
              <FaPlus /> Add New
            </button>
          )}
        </div>
      )}

      {/* Menu Sortable */}
      {showMenu && (
        <div className="fade-in-top mx-3 mb-4 pt-3 card">
          <div className="card-title text-center">
            <h4>Menu Sortable</h4>
            <hr />
          </div>
          <div className="card-body">
            {sorting &&
              sorting
                .sort((a, b) => a.order_id - b.order_id)
                .map((item, key) => (
                  <SortableList
                    item={item}
                    key={key}
                    order_id={item.order_id}
                  />
                ))}
          </div>
        </div>
      )}

      {/* Data Table */}
      {!showMenu && (
        <>
          {list ? (
            list.length > 0 && (
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
            )
          ) : (
            <CustomLoader />
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <CustomModal
        show={updateModal}
        onHide={() => setUpdateModal(false)}
        title={editData ? "Edit Link" : "Add Link"}
      >
        <Formik
          initialValues={{
            id: editData?.id || "",
            title: editData?.title || "",
            parent_id: editData?.parent_id || "",
            menu_url: editData?.menu_url || "",
          }}
          enableReinitialize={true}
          validationSchema={validationSchema} // Attach validation schema here
          onSubmit={(values) => {
            if (editData) {
              updateLink(values);
            } else {
              addLink(values);
            }
          }}
        >
          {({ values }) => (
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

              {/* Menu URL Field */}
              <div className="form-floating mb-3">
                <Field
                  id="floatingMenuURL"
                  name="menu_url"
                  type="text"
                  className="form-control"
                  placeholder="Menu URL"
                />
                <label htmlFor="floatingMenuURL">Menu URL</label>
                <ErrorMessage
                  name="menu_url"
                  component="span"
                  className="text-danger"
                />
              </div>

              {/* Parent ID Field */}
              <div className="form-floating mb-3">
                <Field
                  id="floatingParentId"
                  name="parent_id"
                  as="select"
                  value={values.parent_id}
                  className="form-control"
                  placeholder="Parent ID"
                >
                  <option value="">Select Parent ID</option>
                  {list?.map(
                    (item) =>
                      item.menu_url === "#" && (
                        <option value={item.id} key={item.id}>
                          {item.title}
                          {item.parent_id !== "No Parent" &&
                            ` < ` + item.parent_id}
                        </option>
                      )
                  )}
                </Field>
                <label htmlFor="floatingParentId">Parent ID</label>
                <ErrorMessage
                  name="parent_id"
                  component="span"
                  className="text-danger"
                />
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

      {/* Delete Modal */}
      <ConfirmationModal
        show={deleteModal.modal}
        onHide={() =>
          setDeleteModal({
            modal: false,
            data: "",
          })
        }
        title="Delete Link"
        onConfirm={() => deleteLink({ id: deleteModal.data?.id })}
      >
        <p>
          Do you really want to delete the link titled:{" "}
          <b>{deleteModal.data?.title}</b>?
        </p>
      </ConfirmationModal>
    </div>
  );

  async function getLinks(values) {
    try {
      const res = await API.get("/homemenu", { params: values });
      const data = res.data;
      setData(data?.data);
      setList(
        data?.data.map((item, i, arr) => ({
          ...item,
          srno: i + 1,
          parent_id:
            item.parent_id === item.id
              ? "No Parent"
              : arr.find((item2) => item.parent_id === item2.id)?.title,
          actions: (
            <div className="d-flex justify-content-evenly">
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
                className="btn btn-danger btn-sm"
                onClick={() =>
                  setDeleteModal({
                    modal: true,
                    data: item,
                  })
                }
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
              <div className="text-center p-1">
                <RForm.Check
                  defaultChecked={item.status === 1}
                  type="switch"
                  id="custom-switch"
                  onClick={(e) =>
                    changeLinkStatus({
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

  async function addLink(values) {
    try {
      const res = await API.post("/homemenu", values);
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

  async function updateLink(values) {
    try {
      const res = await API.put("/homemenu", values);
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

  async function deleteLink(values) {
    try {
      const res = await API.delete("/homemenu", { params: { id: values.id } });
      const data = res.data;
      setDeleteModal({
        modal: false,
        data: "",
      });
      show({ message: data.message, displayClass: data.status });
    } catch (error) {
      show({
        message: error.response.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  }

  async function changeLinkStatus(values) {
    try {
      const res = await API.post("/homemenu/disable", values);
      const data = res.data;
      show({ message: data.message, displayClass: data.status });
    } catch (error) {
      show({
        message: error.response.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  }

  async function reorderUp(values) {
    try {
      const res = await API.post("/reorder/up", values);
      const data = res.data;
      setFetchData((prev) => !prev);
      show({ message: data.message, displayClass: data.status });
    } catch (error) {
      show({
        message: error.response.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  }

  async function reorderDown(values) {
    try {
      const res = await API.post("/reorder/down", values);
      const data = res.data;
      setFetchData((prev) => !prev);
      show({ message: data.message, displayClass: data.status });
    } catch (error) {
      show({
        message: error.response.data?.message || error.response?.message,
        displayClass: "failure",
      });
    }
  }
};

export default ManageLinks;
