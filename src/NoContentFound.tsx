import Lottie from "lottie-react";
import React from "react";
import noContnt from "./Assests/404Error.json";
import "./NoContentFound.css";

const NoContentFound: React.FC = () => {
  return (
    <div >
      <Lottie
            animationData={noContnt}
            loop={true}
            className="noContent-animation"
          />
    </div>
  );
};

export default NoContentFound;
