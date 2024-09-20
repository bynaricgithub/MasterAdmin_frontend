/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { navigateData } from "../Store/AllReducers/navSlice";
import { useDispatch } from "react-redux";

const Navigator = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { path, data } = useSelector((state) => state.nav);

    useEffect(() => {
        if (path) {
            navigate(path, { state: data })
            dispatch(navigateData({ path: null, data: null }))
        }
    }, [path]);

    return <>
    </>;
};

export default Navigator;
