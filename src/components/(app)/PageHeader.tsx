import { PageHeaderProps } from "@/interfaces/index.interfaces";

export default function PageHeader({
  title,
  description,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`mb-6 sm:mb-8 ${className}`}>
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-2">
        {title}
      </h2>
      <p className="text-gray-400 text-sm sm:text-base">{description}</p>
    </div>
  );
}
