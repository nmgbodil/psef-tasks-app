import CustomSwitch from "react-native-custom-switch";

type SwipeButtonProps = {
    onSwitch: () => void;
};

const SwipeButton = ({onSwitch}: SwipeButtonProps) => {
    return (
        <CustomSwitch
            onSwitch={onSwitch}
            buttonWidth={25}
            switchWidth={50}
            buttonPadding={2}
            switchBackgroundColor={"#7e7d76"}
            onSwitchBackgroundColor={"#008000"}
        />
    );
};
export default SwipeButton;