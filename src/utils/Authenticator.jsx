/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Error404 from "../component/Error404";
import Content from "../layout/Content";
import { whoAmI } from "./Helper";

const Authenticator = () => {
  const { myUser } = useSelector((state) => state.currentUser);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  useEffect(() => {
    whoAmI(dispatch, setLoading);
  }, []);

  if (loading) {
    return (
      <div className="pt-5">
        <div className="admin-loader-container">
          <div className="admin-loader"></div>
        </div>
      </div>
    );
  }

  if (!myUser) {
    return <Error404 />;
  }

  return <Content />;
};

export default Authenticator;
