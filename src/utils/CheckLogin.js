import { isEmpty } from "lodash";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const useCheckLogin = () => {
  const navigate = useNavigate();
  const { currentUserData } = useSelector((s) => s.currentUser);

  useEffect(() => {
    if (isEmpty(currentUserData)) {
      navigate("/");
    }
  }, [currentUserData]);
};

export default useCheckLogin;

