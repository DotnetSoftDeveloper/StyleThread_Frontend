
// import "./Loader.css";

import Lottie from "lottie-react";
import loader from "./../../Assests/Loader.json"

const Loader = () => {
  return (
    // <div className="loader-overlay">
    //   <div className="dot-spinner">
    //     <div className="dot-spinner__dot"></div>
    //     <div className="dot-spinner__dot"></div>
    //     <div className="dot-spinner__dot"></div>
    //     <div className="dot-spinner__dot"></div>
    //     <div className="dot-spinner__dot"></div>
    //     <div className="dot-spinner__dot"></div>
    //     <div className="dot-spinner__dot"></div>
    //     <div className="dot-spinner__dot"></div>
    //   </div>
    // </div>
    <>
    <Lottie
                animationData={loader}
                loop={true}
                className="noContent-animation"
              />
    </>
  );
};

export default Loader;
