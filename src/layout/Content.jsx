import React, { Suspense, lazy, useState } from "react";
import { useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import Error404 from "../component/Error404";
import ManageCircular from "../component/Super/ManageCircular";
import ManageArticle from "../component/Super/ManageNewsarticle";
import ManageVideos from "../component/Super/ManageVideos";
import CustomLoader from "../utils/CustomLoader";
import SidebarMain from "./Sidebar";
import TopBar from "./Topbar";

const AdminHome = lazy(() => import("../component/Super/AdminHome"));
const ManageLinks = lazy(() => import("../component/Super/ManageLinks"));
const ManageSliderImages = lazy(() =>
  import("../component/Super/ManageSliderImages")
);
const ManageLatestUpdate = lazy(() =>
  import("../component/Super/ManageLatestUpdate")
);
const ManageNewsAndEvents = lazy(() =>
  import("../component/Super/ManageNewsAndEvents")
);
const ManageNoticeBoard = lazy(() =>
  import("../component/Super/ManageNoticeBoard")
);
const ManageMembers = lazy(() => import("../component/Super/ManageMembers"));
const Managevideos = lazy(() => import("../component/Super/ManageVideos"));

function lazyLoader(route, children) {
  return (
    <Route
      path={route}
      element={<Suspense fallback={<CustomLoader />}>{children}</Suspense>}
    />
  );
}

const Content = () => {
  const [isSidebarActive, setIsSidebarActive] = useState(true);
  const sidebarToggle = () => {
    setIsSidebarActive(!isSidebarActive);
    document.getElementById("sidebar")?.classList.toggle("active");
  };

  const { myUser } = useSelector((state) => state.currentUser);
  const { show } = useSelector((state) => state.message);
  return (
    <div className={`wrapper ${isSidebarActive ? "" : "side-collapsed"}`}>
      {myUser?.role === "1" && window.location.pathname.search("admin") > 0 && (
        <SidebarMain />
      )}
      {myUser?.role === "1" && <TopBar onSidebarToggle={sidebarToggle} />}
      <div id="content">
        <Routes>
          {lazyLoader("/", <AdminHome />)}
          {lazyLoader("/home", <AdminHome />)}
          {lazyLoader("/manageLinks", <ManageLinks />)}
          {lazyLoader("/manageSliderImages", <ManageSliderImages />)}
          {lazyLoader("/manageLatestUpdate", <ManageLatestUpdate />)}
          {lazyLoader("/manageNewsAndEvents", <ManageNewsAndEvents />)}
          {lazyLoader("/manageNoticeBoard", <ManageNoticeBoard />)}
          {lazyLoader("/manageMembers", <ManageMembers />)}
          {lazyLoader("/managevideos", <Managevideos />)}
          {lazyLoader("/manageCircular", <ManageCircular />)}
          {lazyLoader("/manageArticle", <ManageArticle />)}
          {lazyLoader("/manageVideos", <ManageVideos />)}
          <Route path="/*" element={<Error404 />} />
        </Routes>
      </div>
    </div>
  );
};

export default Content;
