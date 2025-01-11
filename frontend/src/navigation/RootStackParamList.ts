import { NavigationProp } from "@react-navigation/native";

export type RootStackParamList = {
    Splash: undefined;
    SignIn: undefined;
    SignUp: undefined;
    ForgotPassword: undefined;
    ResetPassword: { resetToken: string };
    CoordinatorNavigator: {
        screen: string;
        params: any;
    } | undefined;
    UserNavigator: {
        screen: string;
        params: any;
    } | undefined;
};

// Function to handle navigation to the login screen
export let navigation: NavigationProp<any> | null = null;
export const setNavigation = (nav: NavigationProp<any>) => {
    navigation = nav;
};