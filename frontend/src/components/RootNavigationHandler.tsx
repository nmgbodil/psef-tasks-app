import { useEffect } from "react";
import { NavigationProp, useNavigation } from "@react-navigation/native";

import { RootStackParamList, setNavigation } from "../navigation/RootStackParamList";


// Wrapper component to handle navigation
const RootNavigationHandler = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
    useEffect(() => {
      setNavigation(navigation);
    }, [navigation]);
  
    return null;
  };

  export default RootNavigationHandler