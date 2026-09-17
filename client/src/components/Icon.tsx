import type { IconBaseProps, IconType } from "react-icons";

interface IconProps extends IconBaseProps {
  icon: IconType;
}

const Icon = ({ icon, ...props }: IconProps) => <>{icon(props)}</>;

export default Icon;
