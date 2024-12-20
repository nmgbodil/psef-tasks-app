export type RootStackParamList = {
    Home: undefined;
    SignIn: undefined;
    SignUp: undefined;
    ForgotPassword: undefined;
    ResetPassword: { resetToken: string };
};

export interface UserData {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}