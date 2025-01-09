import { NativeStackScreenProps } from "@react-navigation/native-stack";

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