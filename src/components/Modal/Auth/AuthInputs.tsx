import { authModalState } from "@/src/atoms/authModalAtom";
import { Flex } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import Login from "./Login";
import Signup from "./Signup";

type AuthInputsProps = {};

const AuthInputs: React.FC<AuthInputsProps> = () => {
  const modalState = useRecoilValue(authModalState);

  return (
    <Flex direction="column" alignItems="center" width="100%" mt={4}>
      {modalState.view == "login" && <Login />}
      {modalState.view == "signup" && <Signup />}
    </Flex>
  );
};

export default AuthInputs;
