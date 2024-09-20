import { FaPlus } from "react-icons/fa";

const HeaderSection = ({ title, buttonText = "Add New", onClick }) => {
  return (
    <div className="fade-in-top d-flex justify-content-between mx-3 mt-4 head-title">
      <h4>{title}</h4>
      <button
        className="btn rounded-4 btn-primary px-3 font-14"
        onClick={onClick}
      >
        <FaPlus /> {buttonText}
      </button>
    </div>
  );
};

export default HeaderSection;
