import React, { useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";

const CustomReactSortable = ({ list: data, onUpdate, parent_id }) => {

    const [list, setList] = useState([]);

    const [edit, setEdit] = useState(false);

    useEffect(() => {
        setList(data)
    }, [data]);

    const getData = () => {
        return list.map((item) => (
            <li key={item.id}
                className="list-group-item list-group-item-action"
            >
                {item.label}
            </li>
        ))
    }

    return <div>
        <ul className="list-group">
            {!edit && getData()}
            {edit && <ReactSortable
                list={list}
                setList={setList}
                // group="groupName"
                animation={300}
                delayOnTouchStart={true}
                delay={2}
            >
                {getData()}
            </ReactSortable>}
        </ul>
        <div className="text-center">
            {!edit && <button
                type="button"
                className="btn btn-primary m-2"
                onClick={e => setEdit(true)}>Edit</button>}

            {edit && onUpdate && <button
                type="button"
                className="btn btn-primary m-2"
                onClick={e => {
                    setEdit(false)
                    onUpdate(list, parent_id)
                }}>Save</button>}

            {edit && <button
                type="button"
                className="btn btn-danger m-2"
                onClick={e => setEdit(false)}>Cancel</button>}
        </div>
    </div>
};

export default CustomReactSortable;
